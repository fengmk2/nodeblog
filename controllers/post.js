/**
 * Module dependencies.
 */

var models = require('../models')
  , Post = models.Post
  , MetaWeblog = require('metaweblog').MetaWeblog;

exports.load = function(id, callback) {
	Post.findById(id, callback);
};

exports.index = function(req, res){
	res.redirect('/');
};
    
exports.new = function(req, res){
	var post = new Post();
	console.log(post)
	res.render('post_edit', {post: post});
};

exports.show = function(req, res){
	res.render('post', {post: req.post});
};

exports.edit = function(req, res){
	res.render('post_edit', {post: req.post});
};

/**
 * Sync to your blog using MetaWeblog API
 * 
 * @param {Object} user
 * @param {Object} post
 * @param {Function} callback(err)
 * @api private
 */
function sync_weblog(user, post, callback) {
	var metaweblog = user.metaweblog;
	if(post.weblog_sync && metaweblog && metaweblog.bloginfo) {
		var weblog = new MetaWeblog(metaweblog.url);
		var weblog_post = {
			dateCreated: post.create_at
		  , title: post.title
		  , description: post.html
		};
		if(post.weblog_post) { // update
			weblog.editPost(post.weblog_post, metaweblog.username, metaweblog.password, weblog_post, post.public,
					function(err, success) {
				callback(err);
			});
		} else {
			weblog.newPost(metaweblog.bloginfo.blogid, metaweblog.username, metaweblog.password, weblog_post, post.public, 
					function(err, weblog_post_id) {
				if(weblog_post_id) {
					post.weblog_post = weblog_post_id;
				}
				callback(err);
			});
		}
	} else {
		callback(null);
	}
}

exports.create = function(req, res, next){
	var title = req.body.title
	  , content = req.body.content;
	var post = new Post({title: title, content: content});
	post.weblog_sync = req.body.sync_cb == 'on';
	post.is_markdown = req.body.markdown_cb == 'on';
	post.public = req.body.public_cb == 'on';
	// sync to metaweblog
	var user = req.session.user;
	sync_weblog(user, post, function(err) {
		if(err) return next(err);
		post.save(function(err) {
			if(err) return next(err);
			res.redirect('/post/' + post.id);
		});
	});
};

exports.save = function(req, res, next){
	var post = req.post;
	post.title = req.body.title;
	post.content = req.body.content;
	post.weblog_sync = req.body.sync_cb == 'on';
	post.is_markdown = req.body.markdown_cb == 'on';
	post.public = req.body.public_cb == 'on';
	var user = req.session.user;
	sync_weblog(user, post, function(err) {
		if(err) return next(err);
		post.save(function(err) {
			if(err) return next(err);
			res.redirect('/post/' + post.id);
		});
	});
};

exports.delete = function(req, res, next){
	if(!req.post || !req.session.user) {
		return next();
	}
	req.post.remove(function(err) {
		var success = true;
		if(err) {
			err = err.message || err;
			success = false;
		}
		res.send(JSON.stringify({success: success, error: err}));
	});
};