
var $btnBack;

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
		$li.html('<div>' + sub.label + '</div>');
		$li.click(function() {
			loadSubscription(i);
		});

		$lstSubs.append($li);
	});
	$content.html($lstSubs);
	$lstSubs.menu();
};

var loadSubscription = function(index) {
	var subscriptions = jmtyler.memory.get('subscriptions');
	var options = subscriptions[index];

	var $lblStatus = $('#lblStatus');
	var $content = $('#content');

	$lblStatus.html('');
	$content.html('');

	var $li;
	var videoTitle;
	var videoUri;

	$lblStatus.text('SUCCESS: ' + options.label);
	$btnBack.css('display', '');

	var start, end, step;
	if (options.sort_order === 'DESC') {
		start = 0;
		end = options.items.length;
		step = 1;
	} else if (options.sort_order === 'ASC') {
		start = options.items.length - 1;
		end = -1;
		step = -1;
	}

	var $lstVids = $('<ul/>');
	for (var j = start; j != end; j += step) {
		var isWatched = !options.unwatched.includes(options.items[j].id.videoId);
		if (!options.showWatchedVideos && isWatched) {
			continue;
		}

		videoTitle = options.items[j].snippet.title;
		videoUri = 'https://www.youtube.com/watch?v=' + options.items[j].id.videoId;

		$li = $('<li/>');
		$li.html((isWatched ? '[W]' : '') + ' <a href="' + videoUri + '">' + videoTitle + '</a>');
		$lstVids.append($li);
	}
	$content.html($lstVids);
	$lstVids.menu();
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
