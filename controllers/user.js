/**
 * Module dependencies.
 */

var models = require('../models')
  , User = models.User;

var MetaWeblog = null, support_metaweblog = true;
try {
    MetaWeblog = require('metaweblog').MetaWeblog;
} catch(e) {
    console.warning('unspport MetaWeblog, Please install "npm install -g metaweblog"');
    support_metaweblog = false;
}

exports.index = function(req, res) {
	var t_user = req.session.user;
	if(t_user) {
		res.redirect('/user/' + t_user.uid);
	} else {
		res.render('user');
	}
};

exports.show = function(req, res, next) {
	var t_user = req.session.user;
	if(!t_user) {
		return res.redirect('/');
	}
	User.findOne({uid: t_user.uid}, function(err, user) {
		if(err) return next(err);
		var setting = user.setting || {};
		var metaweblog = user.metaweblog || {};
		res.render('user', {user: user, setting: setting, metaweblog: metaweblog, support_metaweblog: support_metaweblog});
	});
};

function save_metaweblog(params, user, callback) {
	var metaweblog = user.metaweblog || {};
	metaweblog.username = params.metaweblog_username;
	metaweblog.password = params.metaweblog_password;
	metaweblog.url = params.metaweblog_url;
	user.metaweblog = metaweblog;
	if(metaweblog.url && metaweblog.username && metaweblog.password && MetaWeblog) {
		var weblog = new MetaWeblog(metaweblog.url);
		weblog.getUsersBlogs('nodeblog', metaweblog.username, metaweblog.password, function(err, bloginfos) {
			metaweblog.error = (err && err.message) || null;
			if(bloginfos && bloginfos.length > 0) {
				metaweblog.bloginfo = bloginfos[0];
			} else {
				metaweblog.bloginfo = null;
			}
			callback();
		});
	} else {
		metaweblog.bloginfo = null;
		callback();
	}
};

exports.save = function(req, res, next) {
	if(!req.session.user) {
		return next();
	}
	User.findOne({uid: req.session.user.uid}, function(err, user) {
		save_metaweblog(req.body, user, function() {
			req.session.user = user;
			user.save(function(err) {
				if(err) return next(err);
				res.redirect('/user/' + user.id);
			});
		});
	});
};