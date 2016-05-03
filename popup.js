
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

document.addEventListener('DOMContentLoaded', function() {
	var $li;
	var $lstSubs = document.getElementById('lstSubscriptions');
	for (var i = 0; i < subscriptions.length; i++) {
		$li = document.createElement('li');
		$li.innerHTML = '<a href="#">' + subscriptions[i].label + '</a>';
		$lstSubs.appendChild($li);

		(function() {
			var closureI = i;
			$li.onclick = function() {
				console.log('loading up ' + subscriptions[closureI].label);
			};
		})();
	}

	var $btnTest = document.getElementById('btnTest');
	$btnTest.onclick = function() {
		var req = new XMLHttpRequest();

		req.onload = function() {
			document.getElementById('lblStatus').innerText = 'SUCCESS';
			var res = JSON.parse(req.responseText);
			var $lstVideos = document.getElementById('lstVideos');

			var $li;
			var videoTitle;
			var videoUri;
			for (var j = 0; j < res.items.length; j++) {
				videoTitle = res.items[j].snippet.title;
				videoUri = 'https://www.youtube.com/watch?v=' + res.items[j].id.videoId;

				$li = document.createElement('li');
				$li.innerHTML = '<a href="' + videoUri + '">' + videoTitle + '</a>';
				$lstVideos.appendChild($li);
			}
		};

		req.onerror = function() {
			document.getElementById('lblStatus').innerText = 'ERROR';
			console.error('ERROR', arguments);
		};

		req.open('GET', 'https://www.googleapis.com/youtube/v3/search?key=&part=snippet&type=video&q=&channelId=&order=date', true);
		req.setRequestHeader('Cache-Control', 'no-cache');
		req.send(null);
	};
});
