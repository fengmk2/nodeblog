/**
 * Module dependencies.
 */

var models = require('../models')
  , Post = models.Post;

exports.index = function(req, res, next) {
	Post.where().limit(10).sort('create_at', -1).find(function(err, posts) {
		if(err) {
			next(err);
		} else {
			res.render('index', {posts: posts});
		}
	});
};