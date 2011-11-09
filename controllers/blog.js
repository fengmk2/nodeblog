/**
 * Module dependencies.
 */

var models = require('../models')
  , Post = models.Post
  , User = models.User;

/**
 * @param {} posts posts to be detailed
 * @param {Function(err, posts)} next
 */
var detailPosts= exports.detailPosts= function(posts, next) {
	var ids = {};
	for(var i = 0, len = posts.length; i < len; i ++) {
		var post = posts[i];
		if(post.author_id && !ids[post.author_id]) {
			ids[post.author_id] = 1;
		}
	}
	User.find({_id: {$in: Object.keys(ids)}}, function(err, users) {
		var map = {};
		for(var i = 0, len = users.length; i < len; i ++) {
			var user = users[i];
			map[user.id] = user;
		}
		for(var i = 0, len = posts.length; i < len; i ++) {
			var post = posts[i];
			post.author = map[post.author_id];
		}
		next(err, posts);
	});
};
exports.index = function(req, res, next) {
	Post.where().limit(20).sort('create_at', -1).find(function(err, posts) {
		if(err) return next(err);
		detailPosts(posts, function(err, posts) {
			var tpl = 'index', layout = true;
			if(req.query.format === 'rss') {
				tpl = 'rss', layout = false;
			}
			res.render(tpl, {posts: posts, layout: layout});
		});
	});
};