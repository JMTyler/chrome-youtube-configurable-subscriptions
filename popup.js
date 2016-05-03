
document.addEventListener('DOMContentLoaded', function() {
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
			for (var i = 0; i < res.items.length; i++) {
				videoTitle = res.items[i].snippet.title;
				videoUri = 'https://www.youtube.com/watch?v=' + res.items[i].id.videoId;

				$li = document.createElement('li');
				$li.innerHTML = '<a href="' + videoUri + '">' + videoTitle + '</a>';
				$lstVideos.appendChild($li);
			}
		};

		req.onerror = function() {
			document.getElementById('lblStatus').innerText = 'ERROR';
			console.error('ERROR', arguments);
		};

		req.open('GET', 'https://www.googleapis.com/youtube/v3/search?key=XXXXX&part=snippet&type=video&q=The+Forest&channelId=UCu17Sme-KE87ca9OTzP0p7g&order=date', true);
		req.setRequestHeader('Cache-Control', 'no-cache');
		req.send(null);
	};
});
