
var jmtyler = jmtyler || {};
jmtyler.memory = (function()
{
	var _memory = {};
	var _resource = null;

	var _defaults = {
		subscriptions: [
			{
				label: 'VintageBeef',
				channelId: 'UCu17Sme-KE87ca9OTzP0p7g',
				query: 'The+Forest+Alpha+S3',
				sort_order: 'DESC',
				showWatchedVideos: false,
				unwatched: {"sxLPk1nj-ug": {"kind": "youtube#searchResult","etag": "\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/hn8S7CJDv5bELD2hBeJeE3-pl3Q\"","id": {"kind": "youtube#video","videoId": "sxLPk1nj-ug"},"snippet": {"publishedAt": "2016-04-30T22:00:01.000Z","channelId": "UCu17Sme-KE87ca9OTzP0p7g","title": "The Forest (Alpha S3) - EP29 - Island Run","description": "In The Forest, the player must survive on an island on which their character's plane has crashed by creating shelter, weapons, and other survival tools. There's ...","thumbnails": {"default": {"url": "https://i.ytimg.com/vi/sxLPk1nj-ug/default.jpg","width": 120,"height": 90},"medium": {"url": "https://i.ytimg.com/vi/sxLPk1nj-ug/mqdefault.jpg","width": 320,"height": 180},"high": {"url": "https://i.ytimg.com/vi/sxLPk1nj-ug/hqdefault.jpg","width": 480,"height": 360}},"channelTitle": "VintageBeef","liveBroadcastContent": "none"}},"vE-t9K-rVxA": {"kind": "youtube#searchResult","etag": "\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/HALABYFKMwKIiNhOxHQdLUaN5rY\"","id": {"kind": "youtube#video","videoId": "vE-t9K-rVxA"},"snippet": {"publishedAt": "2016-05-01T22:00:01.000Z","channelId": "UCu17Sme-KE87ca9OTzP0p7g","title": "The Forest (Multiplayer) - EP28 - Can't See Me!","description": "Multiplayer Forest action! I don't have to survive alone any more! Sl1pg8r - https://www.youtube.com/user/sl1pg8r Keralis - https://www.youtube.com/user/Keralis ...","thumbnails": {"default": {"url": "https://i.ytimg.com/vi/vE-t9K-rVxA/default.jpg","width": 120,"height": 90},"medium": {"url": "https://i.ytimg.com/vi/vE-t9K-rVxA/mqdefault.jpg","width": 320,"height": 180},"high": {"url": "https://i.ytimg.com/vi/vE-t9K-rVxA/hqdefault.jpg","width": 480,"height": 360}},"channelTitle": "VintageBeef","liveBroadcastContent": "none"}}},
				unwatchedCount: 2,
				firstPage: ['rOBSNk3HnHs', '00qcqUZPH3o', '0Kv3j3OdF74', 'sxLPk1nj-ug', 'dnclcLybvfs'],
				//items: [{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/CHK6mNnL2RS3Ml_-N-z3rqF6d9M\"","id":{"kind":"youtube#video","videoId":"QcD1s_msYAU"},"snippet":{"publishedAt":"2016-05-11T22:00:00.000Z","channelId":"UCu17Sme-KE87ca9OTzP0p7g","title":"The Forest (Multiplayer) - EP32 - Signal Fires!","description":"Multiplayer Forest action! I don't have to survive alone any more! Sl1pg8r - https://www.youtube.com/user/sl1pg8r Keralis - https://www.youtube.com/user/Keralis ...","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/QcD1s_msYAU/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/QcD1s_msYAU/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/QcD1s_msYAU/hqdefault.jpg","width":480,"height":360}},"channelTitle":"VintageBeef","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/6FReDS-lQqsmVRA6McKlPH2Tx40\"","id":{"kind":"youtube#video","videoId":"0Kv3j3OdF74"},"snippet":{"publishedAt":"2016-05-09T22:00:00.000Z","channelId":"UCu17Sme-KE87ca9OTzP0p7g","title":"The Forest (Alpha S3) - EP30 - Not Multiplayer!","description":"In The Forest, the player must survive on an island on which their character's plane has crashed by creating shelter, weapons, and other survival tools. There's ...","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/0Kv3j3OdF74/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/0Kv3j3OdF74/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/0Kv3j3OdF74/hqdefault.jpg","width":480,"height":360}},"channelTitle":"VintageBeef","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/Qy9Cx6Ek0AiJZe2UU5-iB0BK8qU\"","id":{"kind":"youtube#video","videoId":"B62xM0LFDqI"},"snippet":{"publishedAt":"2016-05-07T22:00:00.000Z","channelId":"UCu17Sme-KE87ca9OTzP0p7g","title":"The Forest (Multiplayer) - EP31 - So Stylish!","description":"Multiplayer Forest action! I don't have to survive alone any more! Sl1pg8r - https://www.youtube.com/user/sl1pg8r Keralis - https://www.youtube.com/user/Keralis ...","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/B62xM0LFDqI/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/B62xM0LFDqI/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/B62xM0LFDqI/hqdefault.jpg","width":480,"height":360}},"channelTitle":"VintageBeef","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/A4huTVCU53mAJ_hd9rL1WV503-o\"","id":{"kind":"youtube#video","videoId":"c3BqQGAMc_g"},"snippet":{"publishedAt":"2016-05-05T22:00:01.000Z","channelId":"UCu17Sme-KE87ca9OTzP0p7g","title":"The Forest (Multiplayer) - EP30 - Tennis Racquet?","description":"Multiplayer Forest action! I don't have to survive alone any more! Sl1pg8r - https://www.youtube.com/user/sl1pg8r Keralis - https://www.youtube.com/user/Keralis ...","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/c3BqQGAMc_g/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/c3BqQGAMc_g/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/c3BqQGAMc_g/hqdefault.jpg","width":480,"height":360}},"channelTitle":"VintageBeef","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/lmIkMqo-Nq58CuAbiloZVFlQZqE\"","id":{"kind":"youtube#video","videoId":"1iPY0yrK6wc"},"snippet":{"publishedAt":"2016-05-03T22:00:00.000Z","channelId":"UCu17Sme-KE87ca9OTzP0p7g","title":"The Forest (Multiplayer) - EP29 - Moss?","description":"Multiplayer Forest action! I don't have to survive alone any more! Sl1pg8r - https://www.youtube.com/user/sl1pg8r Keralis - https://www.youtube.com/user/Keralis ...","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/1iPY0yrK6wc/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/1iPY0yrK6wc/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/1iPY0yrK6wc/hqdefault.jpg","width":480,"height":360}},"channelTitle":"VintageBeef","liveBroadcastContent":"none"}}],
			}, {
				label: 'BdoubleO',
				channelId: 'UClu2e7S8atp6tG2galK9hgg',
				query: 'Crewcraft+Minecraft+Server',
				sort_order: 'ASC',
				showWatchedVideos: true,
				unwatched: {"IrLGzTeDNeM": {"kind": "youtube#searchResult","etag": "\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/YvfBPbK6pF_FbaaYiAZbttQmeBQ\"","id": {"kind": "youtube#video","videoId": "IrLGzTeDNeM"},"snippet": {"publishedAt": "2016-05-01T23:28:31.000Z","channelId": "UClu2e7S8atp6tG2galK9hgg","title": "Crewcraft Minecraft Server :: Sick Nasty Armory! E50","description": "Minecraft on the Crewcraft Server! This is a minecraft server with a bunch of hilarious guys! Leave a like for some awesome multiplayer minecraft content baby!","thumbnails": {"default": {"url": "https://i.ytimg.com/vi/IrLGzTeDNeM/default.jpg","width": 120,"height": 90},"medium": {"url": "https://i.ytimg.com/vi/IrLGzTeDNeM/mqdefault.jpg","width": 320,"height": 180},"high": {"url": "https://i.ytimg.com/vi/IrLGzTeDNeM/hqdefault.jpg","width": 480,"height": 360}},"channelTitle": "BdoubleO100","liveBroadcastContent": "none"}}},
				unwatchedCount: 1,
				firstPage: ['lW1CQcvCdt0', 'D3Cvwg3bwdU', 'qgFKnppqREg', 'QOrWNM3FlOE', 'FSmLn0D9OT8'],
				//items: [{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/zVqOvrtUyu1hHjS-1xCgW8J-DMQ\"","id":{"kind":"youtube#video","videoId":"qgFKnppqREg"},"snippet":{"publishedAt":"2016-05-10T23:17:12.000Z","channelId":"UClu2e7S8atp6tG2galK9hgg","title":"Crewcraft Minecraft Server :: Outsmarting This Redstone! E54","description":"Minecraft on the Crewcraft Server! This is a minecraft server with a bunch of hilarious guys! Leave a like for some awesome multiplayer minecraft content baby!","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/qgFKnppqREg/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/qgFKnppqREg/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/qgFKnppqREg/hqdefault.jpg","width":480,"height":360}},"channelTitle":"BdoubleO100","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/LaMS1y_9bExhPvL8ignItpKD5Uc\"","id":{"kind":"youtube#video","videoId":"QOrWNM3FlOE"},"snippet":{"publishedAt":"2016-05-09T02:07:27.000Z","channelId":"UClu2e7S8atp6tG2galK9hgg","title":"Crewcraft Minecraft Server :: Castle Dungeon & Crypt! E53","description":"Minecraft on the Crewcraft Server! This is a minecraft server with a bunch of hilarious guys! Leave a like for some awesome multiplayer minecraft content baby!","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/QOrWNM3FlOE/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/QOrWNM3FlOE/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/QOrWNM3FlOE/hqdefault.jpg","width":480,"height":360}},"channelTitle":"BdoubleO100","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/LiJuOt7Q-hUcocjnFIbdA5qnHp8\"","id":{"kind":"youtube#video","videoId":"FSmLn0D9OT8"},"snippet":{"publishedAt":"2016-05-05T23:30:00.000Z","channelId":"UClu2e7S8atp6tG2galK9hgg","title":"Crewcraft Minecraft Server :: HUGE Castle Expansion! E52","description":"Minecraft on the Crewcraft Server! This is a minecraft server with a bunch of hilarious guys! Leave a like for some awesome multiplayer minecraft content baby!","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/FSmLn0D9OT8/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/FSmLn0D9OT8/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/FSmLn0D9OT8/hqdefault.jpg","width":480,"height":360}},"channelTitle":"BdoubleO100","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/izK9q1sJZFxuQpc_MNju4D-Z0yI\"","id":{"kind":"youtube#video","videoId":"7EUHxJn8_1A"},"snippet":{"publishedAt":"2016-05-03T23:30:01.000Z","channelId":"UClu2e7S8atp6tG2galK9hgg","title":"Crewcraft Minecraft Server :: Dinner and a Murrrrrder! E51","description":"Minecraft on the Crewcraft Server! This is a minecraft server with a bunch of hilarious guys! Leave a like for some awesome multiplayer minecraft content baby!","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/7EUHxJn8_1A/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/7EUHxJn8_1A/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/7EUHxJn8_1A/hqdefault.jpg","width":480,"height":360}},"channelTitle":"BdoubleO100","liveBroadcastContent":"none"}},{"kind":"youtube#searchResult","etag":"\"kiOs9cZLH2FUp6r6KJ8eyq_LIOk/YvfBPbK6pF_FbaaYiAZbttQmeBQ\"","id":{"kind":"youtube#video","videoId":"IrLGzTeDNeM"},"snippet":{"publishedAt":"2016-05-01T23:28:31.000Z","channelId":"UClu2e7S8atp6tG2galK9hgg","title":"Crewcraft Minecraft Server :: Sick Nasty Armory! E50","description":"Minecraft on the Crewcraft Server! This is a minecraft server with a bunch of hilarious guys! Leave a like for some awesome multiplayer minecraft content baby!","thumbnails":{"default":{"url":"https://i.ytimg.com/vi/IrLGzTeDNeM/default.jpg","width":120,"height":90},"medium":{"url":"https://i.ytimg.com/vi/IrLGzTeDNeM/mqdefault.jpg","width":320,"height":180},"high":{"url":"https://i.ytimg.com/vi/IrLGzTeDNeM/hqdefault.jpg","width":480,"height":360}},"channelTitle":"BdoubleO100","liveBroadcastContent":"none"}}],
			},
		],
	};

	var _commit = function()
	{
		_resource.set({ memory: _memory });
	};

	return {
		init: function(resource, callback)
		{
			_resource = chrome.storage[resource];
			this.reload(callback);
			return this;
		},
		reload: function(callback)
		{
			callback = callback || function(){};

			_resource.get('memory', function(storage) {
				if (!storage.memory) {
					storage.memory = {};
				}
				_memory = storage.memory;
				return callback();
			});
			return this;
		},
		get: function(key)
		{
			if (typeof(key) == 'undefined') {
				return _memory;
			}

			if (typeof(_memory[key]) != 'undefined') {
				return _memory[key];
			}

			// TODO: Should probably clone defaults into memory when accessed, so I don't mess up users' expectations if I change a default and to ensure that nested objects in defaults actually get saved.
			if (typeof(_defaults[key]) != 'undefined') {
				return _defaults[key];
			}

			return null;
		},
		set: function(key, value)
		{
			_memory[key] = value;
			_commit();

			return this;
		},
		clear: function(key)
		{
			if (typeof(key) == 'undefined' || key === null) {
				_memory = {};
				_commit();
				return this;
			}

			delete _memory[key];
			_commit();

			return this;
		},
	};
})();
