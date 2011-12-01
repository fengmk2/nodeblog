/**
 * Session Store for Connect, base on mongoskin
 * 
 * Session Store Implementation

Every session store must implement the following methods

.get(sid, callback)
.set(sid, session, callback)
.destroy(sid, callback)
Recommended methods include, but are not limited to:

.length(callback)
.clear(callback)
For an example implementation view the connect-redis repo.

 * 
 * Use case:
 * 
 * var Store = require('./lib/session_store');
 * 
 * var store = new Store({
 *     host: 'localhost'
 *   , port: 27017
 *   , database: 'connect_session'
 *   , user: 'foo' // optional
 *   , password: 'bar' // optional
 * });
 * 
 * connect(
 *     connect.sesstion({
 *         store: store
 *     });
 * );
 * 
 */

var mongo = require('mongoskin')
  , Store = require('connect').session.Store;

var MongoStore = function(options) {
    var dburl = 'mongodb://';
    if(options.user && options.password) {
        dburl = options.user + ':' + options.password + '@';
    }
    dburl += options.host + ':' + options.port + '/' + options.database;
    this.db = mongo.db(dburl);
    var name = options.collection || 'session';
    this.db.bind(name);
    this.collection = this.db[name];
};

MongoStore.prototype.__proto__ = Store.prototype;

MongoStore.prototype.get = function(sid, callback) {
    this.collection.findOne({_id: sid}, function(err, data) {
        if(data) {
            var sess = typeof data.session === 'string' ? JSON.parse(data.session) : data.session;
            return callback(null, sess);
        }
        callback(err);
    });
};

MongoStore.prototype.set = function(sid, session, callback) {
    var update = {_id: sid, session: JSON.stringify(session)};
    if (session && session.cookie && session.cookie.expires) {
        update.expires = Date.parse(session.cookie.expires);
    }
    this.collection.update({_id: sid}, update, {upsert: true}, callback);
};

MongoStore.prototype.destroy = function(sid, callback) {
    this.collection.remove({_id: sid}, callback);
};

MongoStore.prototype.length = function(callback) {
    this.collection.count({}, callback);
};

MongoStore.prototype.clear = function(callback) {
    this.db.dropCollection(this.collection.collectionName, callback);
};

module.exports = MongoStore;