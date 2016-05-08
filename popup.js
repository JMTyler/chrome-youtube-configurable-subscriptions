
var $btnBack;

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
	var $lblStatus = $('#lblStatus');
	var $content = $('#content');

	$lblStatus.html('');
	$content.html('');
	$btnBack.css('display', 'none');

	var $lstSubs = $('<ul/>');
	for (var i = 0; i < subscriptions.length; i++) {
		(function() {
			var sub = subscriptions[i];

			$li = $('<li/>');
			$li.html('<div>' + sub.label + '</div>');
			$li.click(function() {
				loadSubscription(sub);
			});

			$lstSubs.append($li);
		})();
	}
	$content.html($lstSubs);
	$lstSubs.menu();
};

var loadSubscription = function(options) {
	var $lblStatus = $('#lblStatus');
	var $content = $('#content');

	$lblStatus.html('');
	$content.html('');

	var req = new XMLHttpRequest();
	req.onload = function() {
		var $li;
		var videoTitle;
		var videoUri;

		$lblStatus.text('SUCCESS: ' + options.label);
		$btnBack.css('display', '');

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

		var $lstVids = $('<ul/>');
		for (var j = start; j != end; j += step) {
			var isWatched = !options.unwatched.includes(res.items[j].id.videoId);
			if (!options.showWatchedVideos && isWatched) {
				continue;
			}

			videoTitle = res.items[j].snippet.title;
			videoUri = 'https://www.youtube.com/watch?v=' + res.items[j].id.videoId;

			$li = $('<li/>');
			$li.html((isWatched ? '[W]' : '') + ' <a href="' + videoUri + '">' + videoTitle + '</a>');
			$lstVids.append($li);
		}
		$content.html($lstVids);
		$lstVids.menu();
	};

	req.onerror = function() {
		$('#lblStatus').text('ERROR loading ' + options.label);
		console.error('ERROR', arguments);
	};

	req.open('GET', 'https://www.googleapis.com/youtube/v3/search?type=video&part=snippet&order=date&channelId='+ options.channelId +'&q='+ options.query +'&key='+ jmtyler.settings.get('api_key'), true);
	req.setRequestHeader('Cache-Control', 'no-cache');
	req.send(null);
};

document.addEventListener('DOMContentLoaded', function() {
	jmtyler.settings.init('local');

	$btnBack = $('#btnBack');
	$btnBack.click(function() {
		loadSubscriptionList();
	});

	loadSubscriptionList();
});


