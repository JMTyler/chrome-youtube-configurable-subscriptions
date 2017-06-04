'use strict';

const SCHEMA_VERSION = 1;
const DATABASE_NAME  = 'YTConfSub';

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
			if (_db) {
				return Promise.reject(new Error('You should close the existing DB connection via jmtyler.db.close() before opening a new one.'));
			}

			return new Promise((resolve, reject) => {
				// IDBRequest / IDBOpenDBRequest
				var connection = indexedDB.open(DATABASE_NAME, SCHEMA_VERSION);

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
					var db = connection.result;

					if (ev.oldVersion < 1) {
						// TODO: keyPath is PK? can it be omitted? do I want to?
						var store = db.createObjectStore('Subscriptions', { keyPath: 'label' });
						store.createIndex('IX_things_bleep', 'bleep', { unique: false });
						store.createIndex('IX_things_bloop', 'bloop', { unique: true });

						// TODO: migrate existing subscriptions from localstorage into indexedDB
						// TODO: then run an immediate resync
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

		insert: function(store, obj) {
			if (!_db) {
				return Promise.reject(new Error('You must open a DB connection via jmtyler.db.connect() before performing any CRUD operations.'));
			}

			return new Promise((resolve, reject) => {
				// IDBTransaction
				var t = _db.transaction(store, 'readwrite');
				t.objectStore(store).add(obj);
				// TODO: Do I need to pair this with an onsuccess, or will oncomplete on its own suffice?
				t.oncomplete = () => {
					return resolve();
				};
				t.onerror = (ev) => {
					return reject(ev);
				};
				// TODO: should probably handle the rejection case
			});
		},

		update: function(store, obj) {
			if (!_db) {
				return Promise.reject(new Error('You must open a DB connection via jmtyler.db.connect() before performing any CRUD operations.'));
			}

			return new Promise((resolve, reject) => {
				// IDBTransaction
				var t = _db.transaction(store, 'readwrite');
				t.objectStore(store).put(obj);
				t.onsuccess = () => {
					return resolve();
				};
				t.onerror = (ev) => {
					return reject(ev);
				};
				// TODO: should probably handle the rejection case
			});
		},

		fetchById: function(store, id) {
			if (!_db) {
				return Promise.reject(new Error('You must open a DB connection via jmtyler.db.connect() before performing any CRUD operations.'));
			}

			return new Promise((resolve, reject) => {
				var query = _db.transaction(store, 'readonly').objectStore(store).get(id);
				query.onsuccess = (ev) => {
					return resolve(query.result);
				};
				query.onerror = (ev) => {
					return reject(ev);
				};
				// TODO: should probably handle the rejection case
			});
		},

		fetchOne: function(store, filter) {
			if (!_db) {
				return Promise.reject(new Error('You must open a DB connection via jmtyler.db.connect() before performing any CRUD operations.'));
			}

			var filterKeys = Object.keys(filter);
			if (filterKeys.length < 1) {
				return Promise.reject(new Error('... TODO ...'));
			}

			var field = filterKeys[0];
			var value = filter[field];

			return new Promise((resolve, reject) => {
				var query = _db.transaction(store, 'readonly').objectStore(store).index(`IX_${store}_${field}`).get(value);
				query.onsuccess = (ev) => {
					return resolve(query.result);
				};
				query.onerror = (ev) => {
					return reject(ev);
				};
				// TODO: should probably handle the rejection case
			});
		},

		fetchAll: function(store, filter = null) {
			if (!_db) {
				return Promise.reject(new Error('You must open a DB connection via jmtyler.db.connect() before performing any CRUD operations.'));
			}

			return new Promise((resolve, reject) => {
				var objStore = _db.transaction(store, 'readonly').objectStore(store);

				var query;
				if (filter === null) {
					query = objStore.getAll();
				} else {
					var field = Object.keys(filter)[0];
					var value = filter[field];
					query = objStore.index(`IX_${store}_${field}`).getAll(value);
				}

				query.onsuccess = (ev) => {
					return resolve(query.result);
				};
				query.onerror = (ev) => {
					return reject(ev);
				};
				// TODO: should probably handle the rejection case
			});
		},

		// TODO: create fetchByXX methods
		/*fetchOne: function(filters) {
			if (!_db) {
				return Promise.reject(new Error('You must open a DB connection via jmtyler.db.connect() before performing any CRUD operations.'));
			}

			return new Promise((resolve, reject) => {
				var store = _db.transaction('things', 'readonly').objectStore('things');
				// TODO: is it possible to perform a query *without* an index?
				var query = store.index('IX_things_bleep').openCursor(IDBKeyRange.only(filters.bleep));

				query.onsuccess = (ev) => {
					var cursor = query.result;
					return resolve(cursor.value);
				};
				// TODO: should probably handle the rejection case
			});
		},*/

		close: function() {
			if (_db) {
				// TODO: does this have a callback?
				_db.close();
				_db = null;
			}
			return Promise.resolve();
		},

		/* DEBUG METHODS */

		getDatabase: function() {
			return _db;
		},
	};
})();
