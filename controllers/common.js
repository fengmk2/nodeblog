/**
 * Check if req.post author
 * 
 * @param {Object} req
 * @param {Object} res
 * @api private
 */
exports.check_author = function check_author(req, res) {
    var user = req.session.user;
    if(user && (user._id == req.post.author_id || user.is_admin)) {
        return true;
    }
    return false;
};
