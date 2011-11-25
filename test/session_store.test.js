
var Store = require('../lib/session_store')
  , config = require('../config');

var store = new Store(config.db_options);

module.exports = {
    setUp: function (callback) {
        this.existsKey = 'key1';
        this.notExistsKey = 'key2';
        this.session = {foo: 'bar'};
        store.set(this.existsKey, this.session, function() {
            callback();
        });
    },
    tearDown: function (callback) {
        // clean up
        store.destroy(this.existsKey, function() {
            callback();
        });
    },
    test_get: function(test) {
        store.get(this.existsKey, function(err, session) {
            test.ok(!err);
            test.ok(session);
            for(var k in this.session) {
                test.strictEqual(session[k], this.session[k]);
            }
            test.done();
        });
    },
    test_length: function(test) {
        store.length(function(err, count) {
            test.ok(!err);
            test.ok(count > 0);
            test.done();
        });
    },
    test_set: function(test) {
        var key = new Date().toString();
        var session = {key: key, now: new Date().getTime()};
        store.set(key, session, function(err) {
            test.ok(!err);
            store.get(key, function(err, sess) {
                test.ok(!err);
                for(var k in session) {
                    test.strictEqual(sess[k], session[k]);
                }
                test.done();
            });
        });
    },
    test_clear: function(test) {
        store.clear(function(err) {
            test.ok(!err);
            store.length(function(err, count) {
                test.ok(!err);
                test.equal(0, count);
                test.done();
            });
        });
    },
};