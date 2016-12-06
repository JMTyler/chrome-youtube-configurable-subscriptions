
var syncSubscriptions = function() { };

(function() {
	console.log(new Date().toLocaleTimeString(), 'loading event page');
	jmtyler.settings.init('local');
	jmtyler.memory.init('local');

	syncSubscriptions = function() {
		console.log(new Date().toLocaleTimeString(), 'fetching!');

		jmtyler.memory.reload(function() {
			var subscriptions = jmtyler.memory.get('subscriptions');
			Promise.all(subscriptions.map(function(sub) {
				return fetchSubscriptionPage(sub, 0).then(function(res) {
					var videoIds = res.items.map(function(item) {
						return item.id.videoId;
					});
					// _.difference
					var hasNewVideos = false;
					return Promise.all(videoIds.map(function(videoId) {
						if (!sub.firstPage.includes(videoId)) {
							hasNewVideos = true;
							// _.find
							return Promise.all(res.items.map(function(item) {
								if (item.id.videoId === videoId) {
									return new Promise(function(resolve, reject) {
										var req = new XMLHttpRequest();
										req.onload = function() {
											var res = JSON.parse(req.responseText);

											item.contentDetails = {};
											item.contentDetails.duration = res.items[0].contentDetails.duration;
											item.statistics = res.items[0].statistics;

											// TODO: We should do a prelim fetch on subscription add to init firstPage.
											sub.backlog.push(item);
											sub.unwatched.push(videoId);
											sub.unwatchedCount++;

											return resolve(item);
										};

										req.onerror = function(err) {
											return reject(err);
										};

										// TODO: You can pass multiple IDs to one call, so we should do that with all 5 IDs.
										req.open('GET', 'https://www.googleapis.com/youtube/v3/videos?part=statistics%2CcontentDetails&id='+ item.id.videoId +'&key='+ jmtyler.settings.get('api_key'), true);
										req.setRequestHeader('Cache-Control', 'no-cache');
										req.send(null);
									});
								}
								return Promise.resolve();
							}));
						}
						return Promise.resolve();
					})).then(function() {
						// TODO: Should check if new video count == page size, and check the next page just in case.
						if (hasNewVideos) {
							sub.firstPage = videoIds;
							console.log('NEW THINGS!');
						} else {
							console.log('** all up to date!');
						}
					}).catch(function(err) {
						console.error(err);
					});
				});
			})).then(function() {
				jmtyler.memory.set('subscriptions', subscriptions);
				var totalUnwatchedCount = 0;
				subscriptions.forEach(function(sub) {
					if (sub.bubbleCount) {
						totalUnwatchedCount += sub.unwatchedCount;
					}
				});
				chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
			}).catch(function() {
				console.error('ERROR', arguments);
			});
		});
	};

	var fetchSubscriptionPage = function(sub, page)
	{
		return new Promise(function(resolve, reject) {
			var req = new XMLHttpRequest();
			req.onload = function() {
				var res = JSON.parse(req.responseText);
				return resolve(res);
			};

			req.onerror = function(err) {
				return reject(err);
			};

			// TODO: Is there a concern with consuming the API every time?  Something preliminary we can do, like a HEAD request for RSS?
			req.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=date&channelId='+ sub.channelId +'&q='+ sub.query +'&key='+ jmtyler.settings.get('api_key'), true);
			req.setRequestHeader('Cache-Control', 'no-cache');
			req.send(null);
		});
	};


	/* Setup listeners */

	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name != 'fetch_subscriptions') {
			return;
		}

		return syncSubscriptions();
	});

	chrome.idle.setDetectionInterval(3600);
	chrome.idle.onStateChanged.addListener(function(state) {
		console.log(new Date().toLocaleTimeString(), 'state change!', state);
		if (state != 'active') {
			return;
		}

		// Wait 5s before fetching, just in case network needs to load back up.
		setTimeout(syncSubscriptions, 5000);

		// Reset the alarm countdown.
		return chrome.alarms.create('fetch_subscriptions', {
			periodInMinutes : 15,
		});
	});

	chrome.runtime.onInstalled.addListener(function() {
		console.log(new Date().toLocaleTimeString(), 'creating alarm');
		chrome.alarms.create('fetch_subscriptions', {
			periodInMinutes : 15,
		});

		chrome.browserAction.setBadgeBackgroundColor({ color: '#00AA00' });

		return syncSubscriptions();
	});

	window.prefetchFirstPages = function() {
		jmtyler.memory.reload(function() {
			var subscriptions = jmtyler.memory.get('subscriptions');
			Promise.all(subscriptions.map(function(sub) {
				return fetchSubscriptionPage(sub, 0).then(function(res) {
					sub.firstPage = res.items.map(function(item) {
						return item.id.videoId;
					});
				});
			})).then(function() {
				jmtyler.memory.set('subscriptions', subscriptions);
				var totalUnwatchedCount = 0;
				subscriptions.forEach(function(sub) {
					if (sub.bubbleCount) {
						totalUnwatchedCount += sub.unwatchedCount;
					}
				});
				chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
			}).catch(function() {
				console.error('ERROR', arguments);
			});
		});
	};
})();
