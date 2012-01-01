/**
 * NodeBlog APP
 */
 
require('./public/js/date.format');

var connect = require('connect')
  , render = require('./lib/render')
  , blog = require('./controllers/blog')
  , user = require('./controllers/user')
  , post = require('./controllers/post')
  , comment = require('./controllers/comment')
  , tag = require('./controllers/tag')
  , config = require('./config')
  , utils = require('./lib/utils')
  , Store = require('./lib/session_store')
  , db = require('./db');

if (!config.view_theme) {
  config.view_theme = 'simple';
}
var qsOptions = { limit: 100 };
var app = connect(
    connect.static(__dirname + '/public')
  , connect.logger()
  , connect.cookieParser()
  , connect.bodyParser(qsOptions)
  , connect.session({ 
      secret: config.session_secret
    , cookie:{ path: '/', httpOnly: true, maxAge: 24 * 3600000 * 3650 } 
    , store: new Store(config.db_options)
  })
  , connect.query(qsOptions)
  , user.oauth_handle
  , render({
      root: __dirname + '/views/'+config.view_theme
    , cache: config.view_cache || false
    , helpers: {
        config: config
      , markdown: utils.markdown
      , first_paragraph_markdown: utils.first_paragraph_markdown
    }
  })
);
app.use('/', connect.router(blog));
app.use('/user', connect.router(user));
app.use('/post', connect.router(post));
app.use('/comment', connect.router(comment));
app.use('/tag', connect.router(tag));
app.use(connect.router(function(app) {
  app.get('*', function(req, res, next) {
    res.statusCode=404;
    res.render('404.html');
  });
})
);
app.listen(config.PORT);
console.log("nodeblog started: http://localhost:" + config.PORT);