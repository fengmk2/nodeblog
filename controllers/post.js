/**
 * Module dependencies.
 */

var models = require('../models')
  , Post = models.Post
  , User = models.User
  , Comment = models.Comment
  , Tag= models.Tag
  , check_author = require('./common').check_author
  , combo = require('../lib/combo').combo;

var MetaWeblog = null;
try {
    MetaWeblog = require('metaweblog').MetaWeblog;
} catch(e) {
    console.warn('unsupport MetaWeblog, Please install "npm install -g metaweblog"');
}


exports.load = function(id, callback) {
	Post.findById(id, callback);
};

exports.index = function(req, res){
	res.redirect('/');
};
    
exports.new = function(req, res){
    if(!req.session.user.is_admin) {
        return res.redirect('/');
    }
	var post = new Post();
	res.render('post_edit', {post: post});
};

exports.show = function(req, res, next){
	var post = req.post;
	var both = combo(function(user_args, comments_args) {
	    var error = user_args[0] || comments_args[0];
	    if(error) {
	        return next(error);
	    }
	    post.author = user_args[1];
        res.render('post', {post: post, comments: comments_args[1]});
	});
	var user_cb = both.add(), comments_cb = both.add();
	User.findById(post.author_id, user_cb);
	
	Comment.find({parent_id: post.id}, function(err, comments) {
	    if(err) {
	        return comments_cb(err);
	    }
	    var ids = {};
        for(var i = 0, len = comments.length; i < len; i ++) {
            var comment = comments[i];
            if(comment.author_id && !ids[comment.author_id]) {
                ids[comment.author_id] = 1;
            }
        }
        User.find({_id: {$in: Object.keys(ids)}}, function(err, users) {
            var map = {}, users = users || [];
            for(var i = 0, len = users.length; i < len; i ++) {
                var user = users[i];
                map[user.id] = user;
            }
            for(var i = 0, len = comments.length; i < len; i ++) {
                var comment = comments[i];
                comment.author = map[comment.author_id];
            }
            comments_cb(err, comments);
        });
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
	if(post.weblog_sync && metaweblog && metaweblog.bloginfo && MetaWeblog) {
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

/** 
 * 分割标签字符串(,)
 */
function _parse_tags(tagLine) {
  return tagLine.split(/\s*,\s*/).filter(function(s) {
    //过滤空串
    return s.length>0;  
  });
}

exports.create = function(req, res, next){
	var title = req.body.title
	  , content = req.body.content
	  , new_tags=  _parse_tags(req.body.tags);
	var user = req.session.user;
	var post = new Post({title: title, content: content});
	post.tags= new_tags;
	post.weblog_sync = req.body.sync_cb == 'on';
	post.is_markdown = req.body.markdown_cb == 'on';
	post.public = req.body.public_cb == 'on';
	post.author_id = user._id;
	sync_weblog(user, post, function(err) {
		if(err) return next(err);
		post.save(function(err) {
			if(err) return next(err);
			Tag.addPostTags(post._id, new_tags, function(err, num) {
				if (err) return next(err);
			});
			res.redirect('/post/' + post.id);
		});
	});
};

exports.save = function(req, res, next){
	if(!check_author(req, res)) return res.redirect('/');
	var post = req.post
		, user = req.session.user
		, old_tags= post.tags
		, new_tags= _parse_tags(req.body.tags)
		;
	post.title = req.body.title;
	post.content = req.body.content;
	post.tags= new_tags;
	post.weblog_sync = req.body.sync_cb == 'on';
	post.is_markdown = req.body.markdown_cb == 'on';
	post.public = req.body.public_cb == 'on';
	post.author_id = user._id;
	//return;
	sync_weblog(user, post, function(err) {
		if(err) return next(err);
		post.save(function(err) {
			if(err) return next(err);
			Tag.updatePostTags(post._id, new_tags, old_tags, function(err) {
				if (err) return;
			});
			res.redirect('/post/' + post.id);
		});
	});
};

function remove_weblog_post(post, user, callback) {
	var metaweblog = user.metaweblog;
	if(post.weblog_sync && post.weblog_post && metaweblog && metaweblog.bloginfo && MetaWeblog) {
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
exports.update= function(req, res, next) {
	return exports.save.apply(this, arguments);
};
exports.destroy= function(req, res, next) {
	return exports.delete.apply(this, arguments);
};