/**
 * Module dependencies.
 */

var models = require('../models')
  , Post = models.Post
  , User = models.User
  , MetaWeblog = require('metaweblog').MetaWeblog;


/**
 * Check if req.post author
 * 
 * @param {Object} req
 * @param {Object} res
 * @api private
 */
function check_author(req, res) {
	var user = req.session.user;
	if(!user || user._id != req.post.author_id) {
		return false;
	}
	return true;
}

exports.load = function(id, callback) {
	Post.findById(id, callback);
};

exports.index = function(req, res){
	res.redirect('/');
};
    
exports.new = function(req, res){
	var post = new Post();
	res.render('post_edit', {post: post});
};

exports.show = function(req, res){
	var post = req.post;
	User.findById(post.author_id, function(err, user) {
		post.author = user;
		res.render('post', {post: post});
	});
};

exports.edit = function(req, res){
	if(!check_author(req, res)) return res.redirect('/');
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
	var user = req.session.user;
	var post = new Post({title: title, content: content});
	post.weblog_sync = req.body.sync_cb == 'on';
	post.is_markdown = req.body.markdown_cb == 'on';
	post.public = req.body.public_cb == 'on';
	post.author_id = user._id;
	sync_weblog(user, post, function(err) {
		if(err) return next(err);
		post.save(function(err) {
			if(err) return next(err);
			res.redirect('/post/' + post.id);
		});
	});
};

exports.save = function(req, res, next){
	if(!check_author(req, res)) return res.redirect('/');
	var post = req.post;
	var user = req.session.user;
	post.title = req.body.title;
	post.content = req.body.content;
	post.weblog_sync = req.body.sync_cb == 'on';
	post.is_markdown = req.body.markdown_cb == 'on';
	post.public = req.body.public_cb == 'on';
	post.author_id = user._id;
	sync_weblog(user, post, function(err) {
		if(err) return next(err);
		post.save(function(err) {
			if(err) return next(err);
			res.redirect('/post/' + post.id);
		});
	});
};

function remove_weblog_post(post, user, callback) {
	var metaweblog = user.metaweblog;
	if(post.weblog_sync && post.weblog_post && metaweblog && metaweblog.bloginfo) {
		var weblog = new MetaWeblog(metaweblog.url);
		weblog.deletePost('nodeblog', post.weblog_post, 
				metaweblog.username, metaweblog.password, true, callback);
	} else {
		callback(null);
	}
};

exports.delete = function(req, res, next){
	if(!check_author(req, res)) {
		return res.send(JSON.stringify({success: false, error: 'No permissions.'}));
	}
	remove_weblog_post(req.post, req.session.user, function(err) {
		if(err) return next(err);
		req.post.remove(function(err) {
			var success = true;
			if(err) {
				err = err.message || err;
				success = false;
			}
			res.send(JSON.stringify({success: success, error: err}));
		});
	});
};