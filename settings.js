
var jmtyler = jmtyler || {};
jmtyler.settings = (function()
{
	var _settings = {};
	var _resource = null;

	var _defaults = {
		is_debug_mode : false,
		api_key       : '[YOU FORGOT TO INPUT YOUR API KEY]',
	};

	var _commit = function()
	{
		_resource.set({ settings: _settings });
	};

	return {
		init: function(resource)
		{
			_resource = chrome.storage[resource];
			_resource.get('settings', function(storage) {
				if (!storage.settings) {
					storage.settings = {};
				}
				_settings = storage.settings;
			});
			return this;
		},
		get: function(key)
		{
			if (typeof(key) == 'undefined') {
				return _settings;
			}

			if (typeof(_settings[key]) != 'undefined') {
				return _settings[key];
			}

			if (typeof(_defaults[key]) != 'undefined') {
				return _defaults[key];
			}

			return null;
		},
		set: function(key, value)
		{
			_settings[key] = value;
			_commit();

			return this;
		},
		clear: function(key)
		{
			if (typeof(key) == 'undefined' || key === null) {
				_settings = {};
				_save();
				return this;
			}

			_load();
			delete _settings[key];
			_save();

			return this;
		},
	};
})();

// TODO: Move this to a better spot, but it still must realistically depend on jmtyler.settings
jmtyler.log = function()
{
	if (!jmtyler.settings.get('is_debug_mode')) {
		return false;
	}

	return console.log.apply(console, arguments);
};
