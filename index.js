// blog index

var express = require('express')
  , db = require('./db');

var app = express.createServer(
    express.logger()
  , express.bodyParser()
);
app.set("view engine", "html");
app.register(".html", require("ejs"));

app.set('view options', {
    layout: __dirname + '/views/simple/layout'
});

app.configure(function(){
    //app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
//  app.use(app.router);
});

app.configure('development', function(){
    app.use(express.static(__dirname + '/public'));
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
    var oneYear = 31557600000;
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
    app.use(express.errorHandler());
});

app.get('/', function(req, res, next) {
    db.list_objs('blog', function(err, blogs) {
        if(!blogs) {
            blogs = [];
        }
        res.render('simple/index', {blogs: blogs});
    });
});

app.get('/blog/new', function(req, res, next) {
    res.render('simple/blog_edit');
});

app.post('/blog/new', function(req, res, next) {
    var title = req.body.title
      , content = req.body.content;
    db.insert_or_update('blog', {title: title, content: content}, function(err, result) {
        res.redirect('/blog/' + result.insertId);
    });
});

app.post('/blog/update', function(req, res, next) {
    var title = req.body.title
      , content = req.body.content
      , id = req.body.id;
    db.update('blog', 'id', {title: title, content: content, id: id}, function(err, result) {
        res.redirect('/blog/' + id);
    });
});

app.get('/blog/:id', function(req, res, next) {
    db.get_obj('blog', {id: req.params.id}, function(err, blog) {
        res.render('simple/blog', {blog: blog});
    });
});

app.listen(3000);
console.log('http://localhost:3000/');
