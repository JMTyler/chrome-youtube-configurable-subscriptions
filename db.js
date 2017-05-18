'use strict';

var SCHEMA_VERSION = 1;

var jmtyler = jmtyler || {};
jmtyler.db = (function()
{
	var _db = null;
	var _setDatabase = (result) => {
		_db = result;
		_db.onerror = (ev) => {
			// TODO: what do???
			console.error('db error', ev);
		};
	};

	return {
		connect: function() {
			return new Promise((resolve, reject) => {
				// IDBRequest / IDBOpenDBRequest
				var connection = indexedDB.open('test_db', SCHEMA_VERSION);

				connection.onerror = (ev) => {
					console.error('IndexedDB Connection ERROR', ev);
					// TODO: log info about error
					return reject(new Error('IndexedDB Connection ERROR'));
				};

				connection.onblocked = (ev) => {
					console.error('IndexedDB Connection BLOCKED', ev);
					// TODO: track `ev` on error obj
					return reject(new Error('IndexedDB Connection BLOCKED'));
				};

				connection.onupgradeneeded = (ev) => {
					var _db = connection.result;

					if (ev.oldVersion < 1) {
						// TODO: keyPath is PK? can it be omitted? do I want to?
						var store = _db.createObjectStore('subs', { keyPath: 'time' });
						store.createIndex('IX_subs_thing', 'thing', { unique: false });
					}

					// We don't resolve or set _db because `onsuccess` should still get called.
					return;
				};

				connection.onsuccess = (ev) => {
					// IDBDatabase
					_setDatabase(connection.result);
					return resolve(this);
				};
			});
		},

		insert: function(obj) {
			return new Promise((resolve, reject) => {
				// IDBTransaction
				var t = _db.transaction('subs', 'readwrite');
				t.objectStore('subs').put(obj);
				t.oncomplete = () => {
					return resolve();
				};
				// TODO: should probably handle the rejection case
			});
		},

		fetchAll: function() {
			return new Promise((resolve, reject) => {
				// IDBObjectStore
				var store = _db.transaction('subs', 'readonly').objectStore('subs');
				// TODO: defaults to lookup via the PK index
				var query = store.openCursor();

				var collection = [];
				query.onsuccess = (ev) => {
					var cursor = query.result;
					if (!cursor) {
						return resolve(collection);
					}

					collection.push(cursor.value);
					cursor.continue();
				};
				// TODO: should probably handle the rejection case
			});
		},

		// TODO: create fetchByXX methods
		fetch: function(filters) {
			return new Promise((resolve, reject) => {
				var store = _db.transaction('subs', 'readonly').objectStore('subs');
				// TODO: is it possible to perform a query *without* an index?
				var query = store.index('IX_subs_thing').openCursor(IDBKeyRange.only(filters.thing));

				query.onsuccess = (ev) => {
					var cursor = query.result;
					return resolve(cursor.value);
				};
				// TODO: should probably handle the rejection case
			});
		},

		close: function() {
			_db.close();
		},
	};
})();
