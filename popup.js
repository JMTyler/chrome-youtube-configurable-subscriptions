
var $btnBack;

var apiKey = 'XXXXX';
var subscriptions = [
	{
		label: 'VintageBeef',
		channelId: 'UCu17Sme-KE87ca9OTzP0p7g',
		query: 'The+Forest',
	},
	{
		label: 'BdoubleO',
		channelId: 'UClu2e7S8atp6tG2galK9hgg',
		query: 'Crewcraft+Minecraft+Server',
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

		var res = JSON.parse(req.responseText);
		for (var j = 0; j < res.items.length; j++) {
			videoTitle = res.items[j].snippet.title;
			videoUri = 'https://www.youtube.com/watch?v=' + res.items[j].id.videoId;

			$li = document.createElement('li');
			$li.innerHTML = '<a href="' + videoUri + '">' + videoTitle + '</a>';
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


