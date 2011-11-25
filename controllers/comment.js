/**
 * Module dependencies.
 */

var utils = require('../lib/utils')
  , db = require('../db');


module.exports = function(app) {
    app.post('/', function(req, res, next) {
        var comment = {
            parent_id: req.body.parent_id
          , content: req.body.content
          , create_at: new Date()
        };
        var user = req.session.user;
        if(user) {
            comment.user_info = {
                name: user.screen_name
              , site: user.t_url
              , profile_image_url: user.profile_image_url
            };
        } else {
            var email = req.body.email;
            comment.user_info = {
                name: req.body.name
              , email: email
              , site: req.body.site
            };
            if(email) {
                comment.user_info.profile_image_url = utils.gravatar(email);
            }
            req.session.comment_user = comment.user_info;
        }
        db.comments.insert(comment, function(err) {
            if(err) return next(err);
            res.writeHead(302, {Location: '/post/' + comment.parent_id + '#comment_' + comment._id});
            res.end();
        });
    });
    
    app.post('/:id/delete', function(req, res, next) {
        if(!utils.check_admin(req)) {
            return res.end(JSON.stringify({success: false, error: 'No permissions.'}));
        }
        db.comments.remove({_id: db.ObjectID(req.params.id)}, function(err) {
            var success = true;
            if(err) {
                err = err.message || err;
                success = false;
            }
            res.end(JSON.stringify({success: success, error: err}));
        });
    });
};
