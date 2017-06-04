
var $btnBack;
var pageTokens = [];

var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];

var previousView = null;
var loadView = function(channel) {
	if (channel === null) {
		return loadChannelList();
	}

	return loadSubscriptionList(channel);
};

var loadChannelList = function() {
	previousView = null;

	jmtyler.db.fetchAll('Subscriptions').then((subscriptions) => {
		var $li;
		var $lblStatus = $('#lblStatus');
		var $content = $('#content');

		$lblStatus.html('');
		$content.html('');
		$btnBack.css('display', 'none');

		var $lstChannels = $('<ul/>');
		var channels = {};
		subscriptions.forEach(function(sub) {
			var channel = sub.label.split('/')[0];
			var count = sub.unwatchedCount;
			if (typeof channels[channel] == 'undefined') {
				channels[channel] = 0;
			}
			if (sub.bubbleCount) {
				channels[channel] += count;
			}
		});

		for (var key in channels) {
			if (!channels.hasOwnProperty(key)) {
				continue;
			}

			$li = $('<li/>');
			if (channels[key] > 0) {
				$li.css('background', '#f9d1d1');
			}
			$li.html('<div>' + key + ' (' + channels[key] + ')' + '</div>');
			$li.click(loadSubscriptionList.bind(this, key));

			$lstChannels.append($li);
		}
		$content.html($lstChannels);
		$lstChannels.menu();
	});
};

var loadSubscriptionList = function(channel) {
	previousView = null;

	var $li;
	var $lblStatus = $('#lblStatus');
	var $content = $('#content');

	$lblStatus.css('fontSize', 'large');
	$lblStatus.html('');
	$content.html('');

	var $lstSubs = $('<ul/>');
	jmtyler.db.fetchAll('Subscriptions').then((subscriptions) => {
		subscriptions.forEach(function(sub) {
			var labelParts = sub.label.split('/');
			var thisChannel = labelParts[0];
			if (thisChannel != channel) {
				return;
			}

			$li = $('<li/>');
			if (sub.unwatchedCount > 0 && sub.bubbleCount) {
				$li.css('background', '#f9d1d1');
			}
			$li.html('<div>' + labelParts[1] + ' (' + sub.unwatchedCount + ')' + '</div>');
			$li.click(function() {
				loadSubscription(sub.label);
			});

			$lstSubs.append($li);
		});

		$lblStatus.text(channel);
		$btnBack.css('display', '');
		$content.html($lstSubs);
		$lstSubs.menu();
	});
};

var loadSubscription = function(label) {
	var $lblStatus = $('#lblStatus');
	var $content = $('#content');

	$lblStatus.css('fontSize', 'large');
	$lblStatus.html('');
	$content.html('');

	jmtyler.db.fetchById('Subscriptions', label).then((subscription) => {
		// set previousView to the `channel` key for this subscription
		previousView = subscription.label.split('/')[0];

		var $lstVids = $('<ul/>');
		loadSubscriptionPage(subscription, 0, $lstVids, subscriptions, []).then(function() {
			$lblStatus.text(subscription.label.replace('/', ' :: '));
			$btnBack.css('display', '');

			$content.html($lstVids);
			$lstVids.menu();
		}).catch(function() {
			$lblStatus.text('ERROR: ' + JSON.stringify(arguments));
		});
	});
};

var loadSubscriptionPage = function(subscription, page, $lstVids, subscriptions, subItems)
{
	return fetchSubscriptionPage(subscription, page).then(function(res) {
		var start = 0;
		var end = res.items.length;
		var step = 1;

		$lstVids.find('> :last-child').remove();

		for (var j = start; j != end; j += step) {
			var isWatched = !subscription.unwatched.includes(res.items[j].id.videoId);
			if (isWatched && subscription.isBacklog) {
				continue;
			}

			(function(index, start, end, step) {
				var item = res.items[index];
				var videoId = item.id.videoId;
				var videoTitle = item.snippet.title;
				var videoUri = 'https://www.youtube.com/watch?v=' + videoId;
				var thumbnail = item.snippet.thumbnails.medium;
				var publishDate = new Date(item.snippet.publishedAt);
				var isWatched = !subscription.unwatched.includes(videoId);

				var globalIndex = subItems.push(item) - 1;

				var $li = $('<li/>');
				$li.addClass('videoIndex-' + globalIndex);
				$li.html(
					'<div style="padding: 10px 10px;">' +
						'<span style="display: inline-block;">' +
							'<img src="'+thumbnail.url+'" style="width: '+thumbnail.width.toString()+'px; height: '+thumbnail.height.toString()+'px;" />' +
						'</span>' +
						'<span style="position: absolute; margin-left: 10px; text-align: center;">' +
							'<span style="font-size: xx-large;">' +
								item.contentDetails.duration.replace('PT', '').replace('S', 's').replace('M', 'm ') +
							'</span>' +
							'<br/>' +
							(months[publishDate.getMonth()]+' '+publishDate.getDate()+', '+publishDate.getFullYear()+' @ '+publishDate.getHours()+':'+publishDate.getMinutes()) + '<br/><br/>' +
							'<i>Views: '+item.statistics.viewCount+'</i>' +
							'<br/>' +
							'<i>Likes: '+item.statistics.likeCount+'</i>' +
							'<br/><br/>' +
							'<div class="toggleButtons ui-controlgroup ui-controlgroup-horizontal" role="toolbar" style="text-align: left; width: 100%;">' +
								'<button class="ui-widget ui-button ui-button-icon-only ui-controlgroup-item ui-corner-all" style="padding: 1em;">' +
									'<span class="ui-icon"></span>' +
								'</button>' +
								'<div class="ui-controlgroup ui-controlgroup-vertical" role="toolbar" style="position: relative; overflow: hidden; width: 25.5px; height: 36px;">' +
									'<button class="toggleAllUp ui-widget ui-button ui-button-icon-only ui-controlgroup-item ui-corner-tr" style="padding: 8px 0.7em; position: absolute; transition: 1s; left: -25.5px;">' +
										'<span class="ui-icon ui-icon-arrowthickstop-1-n"></span>' +
									'</button>' +
									'<button class="toggleAllDown ui-widget ui-button ui-button-icon-only ui-controlgroup-item ui-corner-br" style="padding: 8px 0.7em; position: absolute; transition: 1s; top: 18px; left: -25.5px;">' +
										'<span class="ui-icon ui-icon-arrowthickstop-1-s"></span>' +
									'</button>' +
								'</div>' +
							'</div>' +
						'</span>' +
						'<div>' +
							videoTitle +
						'</div>' +
					'</div>'
				);

				var renderWatchedState = function($li, isWatched) {
					$li.css('background', isWatched ? 'initial' : '#f9d1d1');
					$li.find('> div').css('background', isWatched ? '' : '#f9d1d1');
					$li.find('.toggleButtons > button .ui-icon')
						.removeClass('ui-icon-mail-' + (isWatched ? 'closed' : 'open'))
						.addClass('ui-icon-mail-' + (isWatched ? 'open' : 'closed'));
				};
				renderWatchedState($li, isWatched);

				$li.find('.toggleButtons > button').click(function(event) {
					event && event.preventDefault();

					var isWatched = !subscription.unwatched.includes(videoId);
					if (!isWatched) {
						subscription.unwatchedCount--;
						var unwatchedIndex = subscription.unwatched.indexOf(videoId);
						if (unwatchedIndex > -1) {
							subscription.unwatched.splice(unwatchedIndex, 1);
						}
						var backlogIndex = subscription.backlog.findIndex((vid) => { return vid.id.videoId === videoId; });
						if (backlogIndex > -1) {
							subscription.backlog.splice(backlogIndex, 1);
						}
						jmtyler.db.update('Subscriptions', subscription);

						if (subscription.bubbleCount) {
							chrome.browserAction.getBadgeText({}, function (text) {
								var totalUnwatchedCount = parseInt(text, 10);
								totalUnwatchedCount--;
								chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
							});
						}
					} else {
						subscription.unwatchedCount++;
						subscription.unwatched.push(videoId);
						subscription.backlog.push(item);
						jmtyler.db.update('Subscriptions', subscription);

						if (subscription.bubbleCount) {
							chrome.browserAction.getBadgeText({}, function (text) {
								var totalUnwatchedCount = parseInt(text, 10);
								totalUnwatchedCount++;
								chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
							});
						}
					}

					renderWatchedState($li, !isWatched);

					return false;
				});
				$li.find('.toggleButtons > div > button.toggleAllUp').click(function(event) {
					event && event.preventDefault();

					var markAsWatched = subscription.unwatched.includes(videoId);
					chrome.browserAction.getBadgeText({}, function (text) {
						var totalUnwatchedCount = parseInt(text, 10);
						for (var k = globalIndex; k >= 0; k--) {
							var item = subItems[k];
							var videoId = item.id.videoId;

							var isWatched = !subscription.unwatched.includes(videoId);
							if (markAsWatched && !isWatched) {
								subscription.unwatchedCount--;
								if (subscription.bubbleCount) {
									totalUnwatchedCount--;
								}
								var unwatchedIndex = subscription.unwatched.indexOf(videoId);
								if (unwatchedIndex > -1) {
									subscription.unwatched.splice(unwatchedIndex, 1);
								}
								var backlogIndex = subscription.backlog.findIndex((vid) => { return vid.id.videoId === videoId; });
								if (backlogIndex > -1) {
									subscription.backlog.splice(backlogIndex, 1);
								}
								jmtyler.db.update('Subscriptions', subscription);

								renderWatchedState($lstVids.find('> li.videoIndex-' + k), !isWatched);
							} else if (!markAsWatched && isWatched) {
								subscription.unwatchedCount++;
								if (subscription.bubbleCount) {
									totalUnwatchedCount++;
								}
								subscription.unwatched.push(videoId);
								subscription.backlog.push(item);
								jmtyler.db.update('Subscriptions', subscription);

								renderWatchedState($lstVids.find('> li.videoIndex-' + k), !isWatched);
							}
						}
						chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
					});

					return false;
				});
				$li.find('.toggleButtons > div > button.toggleAllDown').click(function(event) {
					event && event.preventDefault();

					var markAsWatched = subscription.unwatched.includes(videoId);
					chrome.browserAction.getBadgeText({}, function (text) {
						var totalUnwatchedCount = parseInt(text, 10);
						for (var k = globalIndex; k < subItems.length; k++) {
							var item = subItems[k];
							var videoId = item.id.videoId;

							var isWatched = !subscription.unwatched.includes(videoId);
							if (markAsWatched && !isWatched) {
								subscription.unwatchedCount--;
								if (subscription.bubbleCount) {
									totalUnwatchedCount--;
								}
								var unwatchedIndex = subscription.unwatched.indexOf(videoId);
								if (unwatchedIndex > -1) {
									subscription.unwatched.splice(unwatchedIndex, 1);
								}
								var backlogIndex = subscription.backlog.findIndex((vid) => { return vid.id.videoId === videoId; });
								if (backlogIndex > -1) {
									subscription.backlog.splice(backlogIndex, 1);
								}
								jmtyler.db.update('Subscriptions', subscription);

								renderWatchedState($lstVids.find('> li.videoIndex-' + k), !isWatched);
							} else if (!markAsWatched && isWatched) {
								subscription.unwatchedCount++;
								if (subscription.bubbleCount) {
									totalUnwatchedCount++;
								}
								subscription.unwatched.push(videoId);
								subscription.backlog.push(item);
								jmtyler.db.update('Subscriptions', subscription);

								renderWatchedState($lstVids.find('> li.videoIndex-' + k), !isWatched);
							}
						}
						chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
					});

					return false;
				});

				$li.find('.toggleButtons').hover(
					function(event) {
						$li.find('.toggleButtons > div > button').css('left', '0px');
						setTimeout(function() {
							$li.find('.toggleButtons > button').removeClass('ui-corner-all').addClass('ui-corner-left');
						}, 100);
					},
					function(event) {
						$li.find('.toggleButtons > div > button').css('left', '-25.5px');
						setTimeout(function() {
							$li.find('.toggleButtons > button').removeClass('ui-corner-left').addClass('ui-corner-all');
						}, 700);
					}
				);

				$li.click(function(event) {
					var isWatched = !subscription.unwatched.includes(videoId);
					if (!isWatched) {
						subscription.unwatchedCount--;
						var unwatchedIndex = subscription.unwatched.indexOf(videoId);
						if (unwatchedIndex > -1) {
							subscription.unwatched.splice(unwatchedIndex, 1);
						}
						var backlogIndex = subscription.backlog.findIndex((vid) => { return vid.id.videoId === videoId; });
						if (backlogIndex > -1) {
							subscription.backlog.splice(backlogIndex, 1);
						}
						jmtyler.db.update('Subscriptions', subscription);

						if (subscription.bubbleCount) {
							chrome.browserAction.getBadgeText({}, function (text) {
								var totalUnwatchedCount = parseInt(text, 10);
								totalUnwatchedCount--;
								chrome.browserAction.setBadgeText({ text: totalUnwatchedCount.toString() });
							});
						}
					}

					var isBackgroundTab = event.ctrlKey || event.button == 1;
					chrome.tabs.create({
						url    : videoUri,
						//url : 'javascript:document.write("' + videoTitle + '");',
						active : !isBackgroundTab,
					});
				});
				$lstVids.append($li);
			})(j, start, end, step);
		}

		var $li = $('<li/>');
		$li.html('<div style="text-align: center;">' + 'Load More' + '</div>');
		$li.click(function(event) {
			loadSubscriptionPage(subscription, page + 1, $lstVids, subscriptions, subItems).then(function() {
				$lstVids.menu('refresh');
			});
		});
		$lstVids.append($li);
	}).catch(function(err) {
		console.error(err);
	});
};

var fetchSubscriptionPage = function(sub, page)
{
	if (sub.isBacklog) {
		var startIndex = page * 5;
		return new Promise(function(resolve, reject) {
			var items = [];
			for (var i = startIndex; i < startIndex + 5; i++) {
				items.push(sub.backlog[i]);
			}
			return resolve({
				items: items,
			});
		});
	}

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
	}).then(function(res) {
		return Promise.all(res.items.map(function(item) {
			return new Promise(function(resolve, reject) {
				var req = new XMLHttpRequest();
				req.onload = function() {
					var res = JSON.parse(req.responseText);

					item.contentDetails = {};
					item.contentDetails.duration = res.items[0].contentDetails.duration;
					item.statistics = res.items[0].statistics;

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
		})).then(function(items) {
			res.items = items;
			return res;
		});
	});
};

// TODO: We will probably need an event handler for when the popup closes, so we can subsequently close the DB connection.

document.addEventListener('DOMContentLoaded', function() {
	jmtyler.settings.init('sync');
	jmtyler.db.connect().then(() => {
		loadChannelList();
	});

	$btnBack = $('.btnBack');
	$btnBack.click(function() {
		loadView(previousView);
	});
});

function clearSubscriptionVideos() {
	var subs = jmtyler.memory.get('subscriptions');
	subs.forEach(function(sub) {
		sub.items = [];
	});
	jmtyler.memory.set('subscriptions', subs);
}
