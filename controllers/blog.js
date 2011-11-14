/**
 * Module dependencies.
 */

var db = require('../db');

module.exports = function(app) {
    app.get(/^\/(rss)?$/, function(req, res, next) {
        db.posts.list({}, {sort: {_id: -1}, limit: 20}, function(err, posts) {
            if(req.params[0] === 'rss') {
                return res.render('rss.xml', {posts: posts, layout: false});
            }
            res.render('index.html', {posts: posts});
        });
    });
};