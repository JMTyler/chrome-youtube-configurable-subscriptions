
var $btnBack;
var pageTokens = [];

var loadSubscriptionList = function() {
	var subscriptions = jmtyler.memory.get('subscriptions');

	var $li;
	var $lblStatus = $('#lblStatus');
	var $content = $('#content');

	$lblStatus.html('');
	$content.html('');
	$btnBack.css('display', 'none');

	var $lstSubs = $('<ul/>');
	subscriptions.forEach(function(sub, i) {
		$li = $('<li/>');
		$li.html('<div>' + sub.label + ' (' + sub.unwatchedCount + ')' + '</div>');
		$li.click(function() {
			loadSubscription(i);
		});

		$lstSubs.append($li);
	});
	$content.html($lstSubs);
	$lstSubs.menu();
};

var loadSubscription = function(index) {
	var $lblStatus = $('#lblStatus');
	var $content = $('#content');

	$lblStatus.html('');
	$content.html('');

	var subscriptions = jmtyler.memory.get('subscriptions');
	var subscription = subscriptions[index];

	var $lstVids = $('<ul/>');
	loadSubscriptionPage(subscription, 0, $lstVids, subscriptions, index).then(function() {
		$lblStatus.text('SUCCESS: ' + subscription.label);
		$btnBack.css('display', '');

		$content.html($lstVids);
		$lstVids.menu();
	}).catch(function() {
		$lblStatus.text('ERROR: ' + JSON.stringify(arguments));
	});
};

var loadSubscriptionPage = function(subscription, page, $lstVids, subscriptions, subIndex)
{
	return fetchSubscriptionPage(subscription, page).then(function(res) {
		var start, end, step;
		// TODO: Can only modify sort by oldest first (ASC) if watched videos are hidden.
		if (subscription.sort_order === 'DESC') {
			start = 0;
			end = res.items.length;
			step = 1;
		} else if (subscription.sort_order === 'ASC') {
			start = res.items.length - 1;
			end = -1;
			step = -1;
		}

		$lstVids.find('> :last-child').remove();

		for (var j = start; j != end; j += step) {
			var isWatched = typeof subscription.unwatched[res.items[j].id.videoId] === 'undefined';
			if (!subscription.showWatchedVideos && isWatched) {
				//continue;
			}

			(function() {
				var videoId = res.items[j].id.videoId;
				var videoTitle = res.items[j].snippet.title;
				var videoUri = 'https://www.youtube.com/watch?v=' + videoId;

				var $li = $('<li/>');
				$li.html('<div>' + (isWatched ? '[W]' : '') + videoTitle + '</div>');
				$li.click(function(event) {
					var isBackgroundTab = event.ctrlKey || event.button == 1;
					chrome.tabs.create({
						//url    : videoUri,
						url : 'javascript:document.write("' + videoTitle + '");',
						active : !isBackgroundTab,
					});

					if (typeof subscription.unwatched[videoId] !== 'undefined') {
						subscription.unwatchedCount--;
						delete subscription.unwatched[videoId];
						subscriptions[subIndex] = subscription;
						jmtyler.memory.set('subscriptions', subscriptions);

						var totalUnwatchedCount = 0;
						subscriptions.forEach(function(sub) {
							totalUnwatchedCount += sub.unwatchedCount;
						});
						chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
					}
				});
				$lstVids.append($li);
			})();
		}

		var $li = $('<li/>');
		$li.html('<div style="text-align: center;">' + 'Load More' + '</div>');
		$li.click(function(event) {
			loadSubscriptionPage(subscription, page + 1, $lstVids).then(function() {
				$lstVids.menu('refresh');
			});
		});
		$lstVids.append($li);
	});
};

var fetchSubscriptionPage = function(sub, page)
{
	return new Promise(function(resolve, reject) {
		var req = new XMLHttpRequest();
		req.onload = function() {
			var res = JSON.parse(req.responseText);

			if (page - 1 >= 0 && typeof res.prevPageToken !== 'undefined') {
				pageTokens[page - 1] = res.prevPageToken;
			}

			if (typeof res.nextPageToken !== 'undefined') {
				pageTokens[page + 1] = res.nextPageToken;
			}

			return resolve(res);
		};

		req.onerror = function(err) {
			return reject(err);
		};

		req.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=date&maxResults=5&channelId='+ sub.channelId +'&q='+ sub.query +'&key='+ jmtyler.settings.get('api_key') + (page == 0 ? '' : '&pageToken='+ pageTokens[page]), true);
		req.setRequestHeader('Cache-Control', 'no-cache');
		req.send(null);
	});
};

document.addEventListener('DOMContentLoaded', function() {
	jmtyler.settings.init('local');
	jmtyler.memory.init('local', function() {
		loadSubscriptionList();
	});

	$btnBack = $('#btnBack');
	$btnBack.click(function() {
		loadSubscriptionList();
	});
});

function clearSubscriptionVideos() {
	var subs = jmtyler.memory.get('subscriptions');
	subs.forEach(function(sub) {
		sub.items = [];
	});
	jmtyler.memory.set('subscriptions', subs);
}
