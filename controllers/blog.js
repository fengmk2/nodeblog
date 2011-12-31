/**
 * Module dependencies.
 */

var db = require('../db');

module.exports = function(app) {
  app.get(/^\/(rss)?$/, function(req, res, next) {
    var count = 20, page = parseInt(req.query.page || 1);
    if (isNaN(page)) {
        page = 1;
    }
    var options = { sort: { _id: -1 }, limit: count };
    if (page > 1) {
        options.skip = (page - 1) * count;
    }
    db.posts.list({}, options, function(err, posts) {
        posts = posts || [];
        if (req.params[0] === 'rss') {
            return res.render('rss.xml', { posts: posts, layout: false });
        }
        res.render('index.html', { posts: posts, page: page });
    });
  });
};