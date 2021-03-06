
var syncSubscriptions = function() { };

(function() {
	console.log(new Date().toLocaleTimeString(), 'loading event page');
	jmtyler.settings.init('sync');

	syncSubscriptions = function() {
		console.log(new Date().toLocaleTimeString(), 'fetching!');

		jmtyler.db.connect().then(() => {
			jmtyler.db.fetchAll('Subscriptions').then((subscriptions) => {
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
								console.log('NEW THINGS!');
								sub.firstPage = videoIds;
								return jmtyler.db.update('Subscriptions', sub);
							}

							console.log('** all up to date!');
						}).catch(function(err) {
							console.error(err);
						});
					});
				})).then(function() {
					var totalUnwatchedCount = 0;
					subscriptions.forEach(function(sub) {
						if (sub.bubbleCount) {
							totalUnwatchedCount += sub.unwatchedCount;
						}
					});
					chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
				}).catch(function(err) {
					console.error('ERROR', err);
				}).then(() => {
					jmtyler.db.close();
				});
			});
		}).catch((err) => {
			console.error('Failed to connect to database.', err);
		});
	};

	var fetchSubscriptionPage = function(sub, page)
	{
		return new Promise(function(resolve, reject) {
			var req = new XMLHttpRequest();
			req.onload = function() {
				var res = JSON.parse(req.responseText);
				if (!res.items) {
					console.error('Failed payload:', res);
					return reject(new Error('Subscription page fetch did not contain array of items.'));
				}
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
		jmtyler.db.connect().then(() => {
			jmtyler.db.fetchAll('Subscriptions').then((subscriptions) => {
				Promise.all(subscriptions.map(function(sub) {
					return fetchSubscriptionPage(sub, 0).then(function(res) {
						sub.firstPage = res.items.map(function(item) {
							return item.id.videoId;
						});
						return jmtyler.db.update('Subscriptions', sub);
					});
				})).then(function() {
					var totalUnwatchedCount = 0;
					subscriptions.forEach(function(sub) {
						if (sub.bubbleCount) {
							totalUnwatchedCount += sub.unwatchedCount;
						}
					});
					chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
				}).catch(function() {
					console.error('ERROR', arguments);
				}).then(() => {
					jmtyler.db.close();
				});
			});
		});
	};

	window.addSubscription = function(sub) {
		const DEFAULTS = {
			isBacklog      : false,
			bubbleCount    : true,
			firstPage      : [],
			backlog        : [],
			unwatched      : [],
			unwatchedCount : 0,
		};

		if (!sub.channelId) {
			return Promise.reject(new Error('All subscriptions must include a "channelId" field.'));
		}

		if (!sub.label) {
			return Promise.reject(new Error('All subscriptions must include a "label" field.'));
		}

		if (!sub.query) {
			return Promise.reject(new Error('All subscriptions must include a "query" field.'));
		}

		Object.keys(DEFAULTS).forEach((key) => {
			if (typeof sub[key] === 'undefined') {
				sub[key] = DEFAULTS[key];
			}
		});

		fetchSubscriptionPage(sub, 0).then(function(res) {
			sub.firstPage = res.items.map(function(item) {
				return item.id.videoId;
			});

			return jmtyler.db.connect().then(() => {
				return jmtyler.db.insert('Subscriptions', sub).then(() => {
					return jmtyler.db.close();
				});
			});
		}).then(function() {
			if (sub.bubbleCount) {
				chrome.browserAction.getBadgeText({}, function (text) {
					var totalUnwatchedCount = parseInt(text, 10);
					totalUnwatchedCount += sub.unwatchedCount;
					chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
				});
			}
		}).then(() => {
			console.log(`Successfully added new subscription "${sub.label}"`);
		}).catch(function() {
			console.error('ERROR', arguments);
		});
	};
	window.addSubscription.spec = {
		isBacklog   : false,
		bubbleCount : true,
		channelId   : '',
		label       : '',
		query       : '',
	};
})();
