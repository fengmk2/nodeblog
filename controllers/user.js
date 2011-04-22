/**
 * Module dependencies.
 */

var models = require('../models')
  , User = models.User
  , MetaWeblog = require('metaweblog').MetaWeblog;

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
		res.render('user', {user: user, setting: setting, metaweblog: metaweblog});
	});
};

exports.save = function(req, res, next) {
	if(!req.session.user) {
		return next();
	}
	User.findOne({uid: req.session.user.uid}, function(err, user) {
		var metaweblog = user.metaweblog || {};
		metaweblog.username = req.body.metaweblog_username;
		metaweblog.password = req.body.metaweblog_password;
		metaweblog.url = req.body.metaweblog_url;
		var weblog = new MetaWeblog(metaweblog.url);
		weblog.getUsersBlogs('nodeblog', metaweblog.username, metaweblog.password, function(err, bloginfos) {
			if(err) return next(err);
			if(bloginfos && bloginfos.length > 0) {
				metaweblog.bloginfo = bloginfos[0];
			}
			user.metaweblog = metaweblog;
			req.session.user = user;
			user.save(function(err) {
				if(err) return next(err);
				res.redirect('/user/' + user.id);
			});
		});
	});
};