var config = require('./config');
var mongo = require('mongoskin');

var dburl = '';
var uri = 'mongodb://';
if (config.db_options.user && config.db_options.password) {
    dburl += config.db_options.user + ':' + config.db_options.password + '@';
}
dburl += config.db_options.host + ':' + config.db_options.port 
    + '/' + config.db_options.database;
var db = module.exports = mongo.db(dburl);
db.ObjectID = db.db.bson_serializer.ObjectID;

db.bind('posts', {
    list: function(query, options, callback) {
        return this.findItems(query, options, function(err, posts) {
            if(posts && posts.length > 0) {
                var ids = [];
                for(var i = 0, l = posts.length; i < l; i++) {
                    var post = posts[i];
                    var author_id = typeof post.author_id === 'string' ? db.ObjectID(post.author_id) : post.author_id;
                    ids.push(author_id);
                }
                
                db.users.findItems({_id: {$in: ids}}, function(err, users) {
                    if(users) {
                        var map = {};
                        for(var i = 0, l = users.length; i < l; i++) {
                            var user = users[i];
                            map[user._id] = user;
                        }
                        for(var i = 0, l = posts.length; i < l; i++) {
                            var post = posts[i];
                            post.author = map[post.author_id];
                        }
                    }
                    callback(err, posts);
                });
            } else {
                callback(err, posts);
            }
        });
    }
});

db.bind('users');
db.users.ensureIndex({uid: 1}, {unique: true}, function() {});
//tag用
db.posts.ensureIndex({tags: 1}, {}, function() {});

db.bind('comments');
