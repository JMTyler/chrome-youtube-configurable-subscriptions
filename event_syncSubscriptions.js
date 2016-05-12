
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

		var subscriptions = jmtyler.memory.get('subscriptions');
		Promise.all(subscriptions.map(function(sub) {
			return new Promise(function(resolve, reject) {
				var req = new XMLHttpRequest();
				req.onload = function() {
					var res = JSON.parse(req.responseText);
					sub.items = res.items;
					return resolve(sub);
				};

				req.onerror = function(err) {
					return reject(err);
				};

				req.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=date&channelId='+ sub.channelId +'&q='+ sub.query +'&key='+ jmtyler.settings.get('api_key'), true);
				req.setRequestHeader('Cache-Control', 'no-cache');
				req.send(null);
			});
		})).then(function() {
			jmtyler.memory.set('subscriptions', subscriptions);
		}).catch(function() {
			console.error('ERROR', arguments);
		});
	});
})();
