/**
 * Module dependencies.
 */

var models = require('../models')
  , Post = models.Post
  , User = models.User;

exports.index = function(req, res, next) {
	Post.where().limit(20).sort('create_at', -1).find(function(err, posts) {
		if(err) return next(err);
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
			var tpl = req.query.format === 'rss' ? 'rss' : 'index';
			res.render(tpl, {posts: posts});
		});
	});
};