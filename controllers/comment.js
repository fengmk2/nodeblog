/**
 * Module dependencies.
 */

var models = require('../models')
  , Comment = models.Comment
  , crypto = require('crypto')
  , check_author = require('./common').check_author;

function md5(s) {
    var hash = crypto.createHash('md5');
    hash.update(s);
    return hash.digest('hex');
};

exports.load = function(id, callback) {
    Comment.findById(id, callback);
};

exports.create = function(req, res, next){
    var content = req.body.content;
    var user = req.session.user;
    var comment = new Comment({content: content});
    if(user) {
        comment.author_id = user._id;
    } else {
        var email = req.body.email;
        comment.user_info = {
            name: req.body.name,
            email: email,
            site: req.body.site
        };
        if(email) {
            comment.user_info.profile_image_url = 'http://www.gravatar.com/avatar/' + md5(email);
        }
    }
    comment.parent_id = req.post.id;
    
    comment.save(function(err) {
        if(err) return next(err);
        res.redirect('/post/' + comment.parent_id + '#comment_' + comment.id);
    });
};

exports.save = function(req, res, next){
    if(!check_author(req, res)) return res.redirect('/post/' + req.post.id);
    var comment = req.comment;
    comment.content = req.body.content;
    comment.save(function(err) {
        if(err) return next(err);
        res.redirect('/post/' + comment.parent_id + '#comment_' + comment.id);
    });
};


exports.delete = function(req, res){
//    if(!check_author(req, res)) {
//        return res.send(JSON.stringify({success: false, error: 'No permissions.'}));
//    }
    req.comment.remove(function(err) {
        var success = true;
        if(err) {
            err = err.message || err;
            success = false;
        }
        res.send(JSON.stringify({success: success, error: err}));
    });
};