
(function() {
	console.log(new Date().toLocaleTimeString(), 'loading event page');
	jmtyler.settings.init('local');
	jmtyler.memory.init('local');

	chrome.runtime.onInstalled.addListener(function() {
		console.log(new Date().toLocaleTimeString(), 'creating alarm');
		chrome.alarms.create('fetch_subscriptions', {
			periodInMinutes : 1,
		});
	});

	chrome.alarms.onAlarm.addListener(function(alarm) {
		if (alarm.name != 'fetch_subscriptions') {
			return;
		}

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
					videoIds.forEach(function(videoId) {
						if (!sub.firstPage.includes(videoId)) {
							hasNewVideos = true;
							// _.find
							res.items.forEach(function(item) {
								if (item.id.videoId === videoId) {
									sub.unwatched[videoId] = item;
								}
							});
						}
					});
					if (hasNewVideos) {
						sub.firstPage = videoIds;
						console.log('NEW THINGS!');
					} else {
						console.log('** all up to date!');
					}
					// TODO: This XHR is not actually to update the renderable list of videos.. just add new ones to the unwatched list.
					//sub.items = res.items;
				});
			})).then(function() {
				jmtyler.memory.set('subscriptions', subscriptions);
			}).catch(function() {
				console.error('ERROR', arguments);
			});
		});
	});

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

			req.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=date&channelId='+ sub.channelId +'&q='+ sub.query +'&key='+ jmtyler.settings.get('api_key'), true);
			req.setRequestHeader('Cache-Control', 'no-cache');
			req.send(null);
		});
	};
})();
