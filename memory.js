
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
				query: 'The+Forest',
				sort_order: 'DESC',
				showWatchedVideos: false,
				unwatched: ['sxLPk1nj-ug', 'vE-t9K-rVxA'],
			}, {
				label: 'BdoubleO',
				channelId: 'UClu2e7S8atp6tG2galK9hgg',
				query: 'Crewcraft+Minecraft+Server',
				sort_order: 'ASC',
				showWatchedVideos: true,
				unwatched: ['IrLGzTeDNeM'],
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
			callback = callback || function(){};

			_resource = chrome.storage[resource];
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
