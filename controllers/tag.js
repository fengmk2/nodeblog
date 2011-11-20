/**
 * Module dependencies.
 */


var db = require('../db')
  , EventProxy = require('../lib/eventproxy').EventProxy
  , utils = require('../lib/utils')
  , MetaWeblog = require('metaweblog').MetaWeblog;

module.exports = function(app) {
  app.get('/:tagName', function(req, res, next) {
    var count = 20, page = parseInt(req.query.page || 1);
    if(isNaN(page)) {
        page = 1;
    }
    var options = {sort: {_id: -1}, limit: count};
    if(page > 1) {
        options.skip = (page - 1) * count;
    }
    db.posts.list({tags: req.params.tagName}, options, function(err, posts) {
        posts= posts || [];
        res.render('index.html', {
          posts: posts
        , page: page
      });
    });
  });
}
/*
exports.index = function(req, res, next) {
  Tag.where().find(function(err, tags) {
    if (err) return next(err);
    res.render('tag', {
      tags: tags
      , layout: true
    });
  })
};

exports.show= function(req, res, next) {
  var tag= req.params.tag;
//  Post.where().limit(20).sort('create_at', -1).findBytag(tag, function(err, posts) {
  Post.findByTag(tag, function(err, posts) {
    if (err) return next(err);
    detailPosts(posts, function(err, posts) {
      var tpl="archive"
        ,  layout= true;
      if (req.query.format==="rss") {
        tpl= "rss", layout= false;
      }
      res.render(tpl, {posts: posts, layout: layout});
    });
  });
}
*/