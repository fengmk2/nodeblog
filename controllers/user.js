/**
 * Module dependencies.
 */

var MetaWeblog = require('metaweblog').MetaWeblog;

var db = require('../db')
  , weibo = require('weibo')
  , config = require('../config');

module.exports = function(app) {
    app.get('/login', function(req, res, next) {
        var t_user = req.session.user;
        if(t_user) {
            res.writeHead(302, { 'Location': '/user/' + t_user.uid });
            res.end();
        } else {
            res.render('user/login.html');
        }
    });
    
    app.get('/logout', function(req, res, next) {
        req.session.user = null;
        res.writeHead(302, { 'Location': '/' });
        res.end();
    });
    
    app.get('/:id', function(req, res, next) {
        _get_and_check_user(req, res, next, function(user) {
            var metaweblog = user.metaweblog || {};
            res.render('user/item.html', {user: user, metaweblog: metaweblog});
        });
    });
    
    app.post('/:id', function(req, res, next) {
        _get_and_check_user(req, res, next, function(user) {
            var metaweblog = user.metaweblog || {};
            metaweblog.username = req.body.metaweblog_username;
            metaweblog.password = req.body.metaweblog_password;
            metaweblog.url = req.body.metaweblog_url;
            metaweblog.error = null;
            _check_metaweblog(metaweblog, function(err, bloginfo) {
                if(err) {
                    metaweblog.error = err.message;
                }
                metaweblog.bloginfo = bloginfo;
                user.metaweblog = metaweblog;
                db.users.update({_id: user._id}, user, function(err) {
                    if(err) {
                        return next(err);
                    }
                    req.session.user = user;
                    res.writeHead(302, { Location: '/user/' + user.uid });
                    res.end();
                });
            });
        });
    });
};

for(var type in config.weibo_appkeys) {
    var appkeys = config.weibo_appkeys[type];
    if(appkeys[0]) {
        weibo.init(type, appkeys[0], appkeys[1]);
    }
}

module.exports.oauth_handle = weibo.oauth_middleware(function(oauth_user, referer, req, res, callback) {
    oauth_user.uid = oauth_user.blogtype + ':' + oauth_user.id;
    db.users.findOne({uid: oauth_user.uid}, function(err, user) {
        if(err) {
            return callback(err);
        }
        user = user || {};
        user.uid = oauth_user.uid;
        user.screen_name = oauth_user.screen_name;
        user.t_url = oauth_user.t_url;
        user.profile_image_url = oauth_user.profile_image_url;
        user.info = oauth_user;
        user.is_admin = config.admins.indexOf(user.uid) >= 0;
        db.users.update({uid: user.uid}, user, {upsert: true}, function(err) {
            if(err) {
                return callback(err);
            }
            req.session.user = user;
            callback();
        });
    });
});

function _get_and_check_user(req, res, next, callback) {
    if(!req.session.user || req.session.user.uid !== req.params.id) {
        res.writeHead(302, { 'Location': '/' });
        return res.end();
    }
    db.users.findOne({uid: req.params.id}, function(err, user) {
        if(err) {
            return next(err);
        }
        callback(user);
    });
};

function _check_metaweblog(metaweblog, callback) {
    if(metaweblog.url && metaweblog.username && metaweblog.password && MetaWeblog) {
        var weblog = new MetaWeblog(metaweblog.url);
        weblog.getUsersBlogs('nodeblog', metaweblog.username, metaweblog.password, function(err, bloginfos) {
            if(err) {
                return callback(err);
            }
            var bloginfo = null;
            if(bloginfos && bloginfos.length > 0) {
                bloginfo = bloginfos[0];
            }
            callback(null, bloginfo);
        });
    } else {
        callback();
    }
};

//exports.show = function(req, res, next) {
//	var t_user = req.session.user;
//	if(!t_user) {
//		return res.redirect('/');
//	}
//	User.findOne({uid: t_user.uid}, function(err, user) {
//		if(err) return next(err);
//		var setting = user.setting || {};
//		var metaweblog = user.metaweblog || {};
//		res.render('user', {user: user, setting: setting, metaweblog: metaweblog, support_metaweblog: support_metaweblog});
//	});
//};
//
//function save_metaweblog(params, user, callback) {
//	var metaweblog = user.metaweblog || {};
//	metaweblog.username = params.metaweblog_username;
//	metaweblog.password = params.metaweblog_password;
//	metaweblog.url = params.metaweblog_url;
//	user.metaweblog = metaweblog;
//	if(metaweblog.url && metaweblog.username && metaweblog.password && MetaWeblog) {
//		var weblog = new MetaWeblog(metaweblog.url);
//		weblog.getUsersBlogs('nodeblog', metaweblog.username, metaweblog.password, function(err, bloginfos) {
//			metaweblog.error = (err && err.message) || null;
//			if(bloginfos && bloginfos.length > 0) {
//				metaweblog.bloginfo = bloginfos[0];
//			} else {
//				metaweblog.bloginfo = null;
//			}
//			callback();
//		});
//	} else {
//		metaweblog.bloginfo = null;
//		callback();
//	}
//};
//
//exports.save = function(req, res, next) {
//	if(!req.session.user) {
//		return next();
//	}
//	User.findOne({uid: req.session.user.uid}, function(err, user) {
//		save_metaweblog(req.body, user, function() {
//			req.session.user = user;
//			user.save(function(err) {
//				if(err) return next(err);
//				res.redirect('/user/' + user.id);
//			});
//		});
//	});
//};