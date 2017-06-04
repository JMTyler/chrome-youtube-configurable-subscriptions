'use strict';

const SCHEMA_VERSION = 7;
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
				console.log('Initializing localstorage.');
				jmtyler.memory.init('local', () => {
				console.log('  ...localstorage initialized.');
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

				var performUpgrade = Promise.resolve();
				connection.onupgradeneeded = (ev) => {
					var db = ev.target.result;

					if (ev.oldVersion < 1) {
						// TODO: keyPath is PK? can it be omitted? do I want to?
						var store = db.createObjectStore('Subscriptions', { keyPath: 'label' });
						//store.createIndex('IX_things_bleep', 'bleep', { unique: false });
						//store.createIndex('IX_things_bloop', 'bloop', { unique: true });

						// TODO: migrate existing subscriptions from localstorage into indexedDB
						// TODO: then run an immediate resync
					}
					if (ev.oldVersion < 7) {
						// TODO: keyPath is PK? can it be omitted? do I want to?
						console.log('Overwriting promise.');
						performUpgrade = new Promise((resolve, reject) => {
							var subscriptions = jmtyler.memory.get('subscriptions');
							var t = ev.target.transaction;
							var store = t.objectStore('Subscriptions');

							console.log('Starting upgrade.');
							subscriptions.reduce((previous, sub, i) => {
								return previous.then(() => {
									console.log(`Sub promise #${i+1}.`);
									return new Promise((resolve, reject) => {
										var request = store.add(sub);
										request.onsuccess = () => {
											console.log(`  Promise #${i+1} complete.`);
											return resolve();
										};
										request.onerror = () => {
											console.log(`  Promise #${i+1} failed.`);
											return reject();
										};
									});
								});
							}, Promise.resolve()).then(() => {
								console.log('Upgrade complete.');
								return resolve();
							}).catch((err) => {
								console.log('Upgrade failed; aborting transaction.', err);
								t.abort();
								return reject();
							});
						});

						// TODO: then run an immediate resync
					}

					// We don't resolve or set _db because `onsuccess` should still get called.
					return;
				};

				connection.onsuccess = (ev) => {
					console.log('Connected.');
					// IDBDatabase
					_setDatabase(connection.result);
					return performUpgrade.then(() => {
						console.log('Connection established. Continuing with application.');
						return resolve(this);
					}).catch((err) => {
						console.log('Connection/Upgrade failed. Ignoring since connection event handlers should pick up transaction abortion.', err);
						// Swallow the error; the upgrade transaction must've been aborted, so the error should already be handled above.
					});
				};
				});
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
