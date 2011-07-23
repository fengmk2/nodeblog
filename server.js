/**
 * Module dependencies.
 */

var express = require('express')
  , FileStore = require('filestore').FileStore
  , weibo = require('weibo')
  , Resource = require('express-resource')
  , config = require('./config')
  , models = require('./models')
  , User = models.User;

require('./public/js/date.format');

var app = express.createServer(
    express.bodyParser()
);

app.helpers({
	config: config
});

/**
 * Weibo settings
 */
var WEIBO_NAMES = {
	tsina: '新浪微博',
	tqq: '腾讯微博',
	twitter: 'Twitter'
};
var tapi = weibo.tapi;
for(var type in config.weibo_appkeys) {
	var appkeys = config.weibo_appkeys[type];
	if(appkeys[0]) {
		tapi.init(type, appkeys[0], appkeys[1]);
	}
}
var support_weibos = {};
for(var type in tapi.enables) {
	support_weibos[type] = WEIBO_NAMES[type];
}

/**
 * Views settings
 */
app.set("view engine", "html");
app.set("views", __dirname + '/views/simple');
app.set('view options', {
    layout: __dirname + '/views/simple/layout',
    support_weibos: support_weibos
});

//var ejs = require('ejs');
//ejs.open = '{{';
//ejs.close = '}}';
//app.register(".html", ejs);
//var dot = require('dot');
//dot.templateSettings.begin = '<?js';
//dot.templateSettings.end = '?>';
app.register(".html", require('tenjin'));

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
	app.use(express.logger());
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
    app.set('view cache', true);
});

/**
 * Middleware settings: bodyParser, cookieParser, session
 */
app.configure(function(){
    app.use(express.cookieParser());
    var store = new FileStore(config.session_dir);
    app.use(express.session({
    	secret: config.session_secret
      , store: store
    }));
});

app.use(weibo.oauth_middleware(function(oauth_user, referer, req, res, callback) {
	oauth_user.uid = oauth_user.blogtype + ':' + oauth_user.id;
	User.findOne({uid: oauth_user.uid}, function(err, user) {
		if(err) {
			console.log(err);
			res.send(err);
			callback(false);
		}
		if(!user) {
			user = new User();
		}
		user.uid = oauth_user.uid;
		user.screen_name = oauth_user.screen_name;
		user.t_url = oauth_user.t_url;
		user.profile_image_url = oauth_user.profile_image_url;
		user.info = oauth_user;
		user.is_admin = config.admins.indexOf(user.uid) >= 0;
		user.save(function(err) {
			if(err) {
				console.log(err);
				res.send(err);
				callback(false);
			} else {
				req.session.user = user;
				callback();
			}
		});
	});
}));

//自动在模板上下文中增加当前用户引用
app.use(function wrap_current_user(req, res, next) {
    if(req.url.indexOf('/logout') == 0) {
        // 处理用户登出
        if(req.session && req.session.user) {
            req.session.user = undefined;
        }
        var referer = req.headers.referer || '/';
        if(referer.indexOf('/logout') >= 0) {
            referer = '/'; // 防止循环跳转
        }
        res.redirect(referer);
    } else {
    	if(!res._locals) {
            res._locals = {};
        }
    	res._locals.current_user = null;
        if(req.session && req.session.user) {
        	// keep login
        	var year = 25920000000;
        	req.session.cookie.expires = new Date(Date.now() + year);
        	req.session.cookie.maxAge = year;
            res._locals.current_user = req.session.user;
        }
        next();
    }
});

//var vhost_re = new RegExp('^' + config.subdomain.replace(/[*]/g, '(.*?)') + '$');
//app.use(function sub_domain(req, res, next) {
//	if(req.headers.host) {
//		var host = req.headers.host.split(':')[0];
//		var subdomains = vhost_re.exec(host);
//	    if(subdomains) {
//	    	req.subdomain = subdomains[1];
//	    }
//	}
//	next();
//});

app.resource(require('./controllers/blog'));
app.resource('post', require('./controllers/post'));
app.resource('user', require('./controllers/user'));

app.listen(config.PORT);
console.log('http://localhost:' + config.PORT);
console.log((process.env.NODE_ENV || 'development') + ' env');