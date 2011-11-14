/**
 * Module dependencies.
 */

var db = require('../db')
  , EventProxy = require('../lib/eventproxy').EventProxy
  , utils = require('../lib/utils')
  , MetaWeblog = require('metaweblog').MetaWeblog;


module.exports = function(app) {
    app.get('/new', function(req, res, next) {
        if(!req.session.user || !req.session.user.is_admin) {
            res.writeHead(302, { Location: '/' });
            return res.end();
        }
        res.render('post/edit.html');
    });
    
    app.get('/:id', function(req, res, next) {
        var ep = new EventProxy();
        ep.assign('post', 'comments', function(post, comments) {
            res.render('post/item.html', {post: post, comments: comments});
        });
        ep.on('error', function(err) {
            ep.unbind();
            next(err);
        });
        db.posts.findById(req.params.id, function(err, post) {
            if(err) {
                return ep.emit('error', err);
            }
            if(typeof post.author_id !== 'string') {
                post.author_id = post.author_id.toString();
            }
            db.users.findById(post.author_id, function(err, user) {
                if(err) {
                    return ep.emit('error', err);
                }
                post.author = user;
                ep.emit('post', post);
            });
        });
        db.comments.findItems({parent_id: {$in: [req.params.id, db.ObjectID(req.params.id)]}}, 
                {sort: {_id: -1}}, function(err, comments) {
            if(err) {
                return ep.emit('error', err);
            }
            ep.emit('comments', comments);
        });
    });
    
    app.get('/:id/edit', function(req, res, next) {
        _get_post_and_check_author(req, res, next, function(post) {
            res.render('post/edit.html', {post: post});
        });
    });
    
    // new post
    app.post('/', function(req, res, next) {
        if(!utils.check_admin(req)) {
            res.writeHead(302, { Location: '/' });
            return res.end();
        }
        
        var post = {
            title: req.body.title
          , content: req.body.content
        };
        post.tags = parse_tags(req.body.tags);
        var user = req.session.user;
        post.weblog_sync = req.body.sync_cb === 'on';
        post.is_markdown = req.body.markdown_cb === 'on';
        post.public = req.body.public_cb === 'on';
        post.author_id = user._id;
        post.update_at = post.create_at = new Date();
        var metaweblog = req.session.user.metaweblog;
        sync_weblog(metaweblog, post, function(err) {
            if(err) {
                return next(err);
            }
            db.posts.insert(post, function(err) {
                res.writeHead(302, {
                    Location: '/post/' + post._id
                });
                res.end();
            });
        });
    });
    
    // update post
    app.post('/:id', function(req, res, next) {
        _get_post_and_check_author(req, res, next, function(post) {
            post.title = req.body.title;
            post.content = req.body.content;
            post.tags = parse_tags(req.body.tags);
            post.weblog_sync = req.body.sync_cb === 'on';
            post.is_markdown = req.body.markdown_cb === 'on';
            post.public = req.body.public_cb === 'on';
            post.update_at = new Date();
            if(!post.create_at) {
                post.create_at = new Date();
            }
            var metaweblog = req.session.user.metaweblog;
            sync_weblog(metaweblog, post, function(err) {
                if(err) {
                    return next(err);
                }
                db.posts.update({_id: post._id}, post, function(err) {
                    res.writeHead(302, { Location: '/post/' + post._id });
                    res.end();
                });
            });
        });
    });
    
    app.post('/:id/delete', function(req, res, next) {
        _get_post_and_check_author(req, res, next, function(post) {
            var metaweblog = req.session.user.metaweblog;
            remove_weblog_post(metaweblog, post, function(err) {
                if(err) {
                    if(utils.isxhr(req)) {
                        return res.end(JSON.stringify({ error: err.message }));
                    }
                    return next(err);
                }
                db.posts.remove({_id: post._id}, function(err) {
                    if(utils.isxhr(req)) {
                        return res.end(JSON.stringify({ error: err && err.message }));
                    }
                    if(err) {
                        return next(err);
                    }
                    res.writeHead(302, { Location: '/' });
                    res.end();
                });
            });
        });
    });
};

/** 
 * 分割标签字符串(,)
 */
function parse_tags(tags) {
    tags = tags.split(','), needs = [];
    for(var i = 0, l = tags.length; i < l; i++) {
        var tag = tags[i].trim();
        if(tag) {
            needs.push(tag);
        }
    }
    return needs.length > 0 ? needs : null;
}

/**
 * Get post by req.params.id and check if current use is author.
 * 
 * @param req
 * @param res
 * @param next
 * @param callback
 * @api private
 */
function _get_post_and_check_author(req, res, next, callback) {
    db.posts.findById(req.params.id, function(err, post) {
        if(err || !post) {
            return next(err);
        }
        if(!utils.check_author(req, post)) {
            res.writeHead(302, { Location: '/' });
            return res.end();
        }
        callback(post);
    });
};

/**
 * Sync to your blog using MetaWeblog API
 * 
 * @param {Object} metaweblog
 * @param {Object} post
 * @param {Function} callback(err)
 * @api private
 */
function sync_weblog(metaweblog, post, callback) {
	if(post.weblog_sync && metaweblog && metaweblog.bloginfo) {
		var weblog = new MetaWeblog(metaweblog.url);
		var weblog_post = {
			dateCreated: post.create_at
		  , title: post.title
		  , description: post.is_markdown ? utils.markdown(post.content) : post.content
		};
		if(post.weblog_post) { // update
			weblog.editPost(post.weblog_post, metaweblog.username, metaweblog.password, weblog_post, post.public, callback);
		} else {
			weblog.newPost(metaweblog.bloginfo.blogid, metaweblog.username, metaweblog.password, weblog_post, post.public, 
					function(err, weblog_post_id) {
				if(weblog_post_id) {
					post.weblog_post = weblog_post_id;
				}
				callback(err, weblog_post_id);
			});
		}
	} else {
		callback();
	}
}

function remove_weblog_post(metaweblog, post, callback) {
    if(post.weblog_sync && post.weblog_post && metaweblog && metaweblog.bloginfo) {
        var weblog = new MetaWeblog(metaweblog.url);
        weblog.deletePost('nodeblog', post.weblog_post, metaweblog.username, metaweblog.password, true, callback);
    } else {
        callback();
    }
};


