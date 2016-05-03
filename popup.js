
var $btnBack;

var apiKey = 'XXXXX';
var subscriptions = [
	{
		label: 'VintageBeef',
		channelId: 'UCu17Sme-KE87ca9OTzP0p7g',
		query: 'The+Forest',
		sort_order: 'DESC',
		showWatchedVideos: false,
		unwatched: ['sxLPk1nj-ug', 'vE-t9K-rVxA'],
	},
	{
		label: 'BdoubleO',
		channelId: 'UClu2e7S8atp6tG2galK9hgg',
		query: 'Crewcraft+Minecraft+Server',
		sort_order: 'ASC',
		showWatchedVideos: true,
		unwatched: ['IrLGzTeDNeM'],
	}
];

var loadSubscriptionList = function() {
	var $li;
	var $lstSubs = document.getElementById('lstSubscriptions');
	var $lstVids = document.getElementById('lstVideos');
	var $lblStatus = document.getElementById('lblStatus');

	$lstSubs.innerHTML = '';
	$lstVids.innerHTML = '';
	$lblStatus.innerHTML = '';
	$btnBack.style.display = 'none';

	for (var i = 0; i < subscriptions.length; i++) {
		(function() {
			var sub = subscriptions[i];

			$li = document.createElement('li');
			$li.innerHTML = '<a href="#">' + sub.label + '</a>';
			$lstSubs.appendChild($li);

			$li.onclick = function() {
				loadSubscription(sub);
			};
		})();
	}
};

var loadSubscription = function(options) {
	var $lstSubs = document.getElementById('lstSubscriptions');
	var $lstVids = document.getElementById('lstVideos');
	var $lblStatus = document.getElementById('lblStatus');

	$lstSubs.innerHTML = '';

	var req = new XMLHttpRequest();
	req.onload = function() {
		var $li;
		var videoTitle;
		var videoUri;

		$lblStatus.innerText = 'SUCCESS: ' + options.label;
		$btnBack.style.display = '';

		var start, end, step;
		var res = JSON.parse(req.responseText);
		if (options.sort_order === 'DESC') {
			start = 0;
			end = res.items.length;
			step = 1;
		} else if (options.sort_order === 'ASC') {
			start = res.items.length - 1;
			end = -1;
			step = -1;
		}

		for (var j = start; j != end; j += step) {
			var isWatched = !options.unwatched.includes(res.items[j].id.videoId);
			if (!options.showWatchedVideos && isWatched) {
				continue;
			}

			videoTitle = res.items[j].snippet.title;
			videoUri = 'https://www.youtube.com/watch?v=' + res.items[j].id.videoId;

			$li = document.createElement('li');
			$li.innerHTML = (isWatched ? '[W]' : '') + ' <a href="' + videoUri + '">' + videoTitle + '</a>';
			$lstVids.appendChild($li);
		}
	};

	req.onerror = function() {
		document.getElementById('lblStatus').innerText = 'ERROR loading ' + options.label;
		console.error('ERROR', arguments);
	};

	req.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=date&channelId='+ options.channelId +'&q='+ options.query +'&key='+ apiKey, true);
	req.setRequestHeader('Cache-Control', 'no-cache');
	req.send(null);
};

document.addEventListener('DOMContentLoaded', function() {
	$btnBack = document.getElementById('btnBack');
	$btnBack.onclick = function() {
		loadSubscriptionList();
	};

	loadSubscriptionList();
});


