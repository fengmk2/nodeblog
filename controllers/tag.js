/**
 * Module dependencies.
 */

var models = require('../models')
  , Tag = models.Tag
  , Post = models.Post
  , detailPosts = require('./blog').detailPosts
  , util= require('util')
  ;

/*
exports.load= function(name, callback) {
  this.name=name;
  console.log(callback.toString());
}
*/

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