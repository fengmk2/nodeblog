
var crypto = require('crypto');

/**
 * Check if obj author
 * 
 * @param {Object} req
 * @param {Object} res
 * @api private
 */
exports.check_author = function check_author(req, obj) {
    var user = req.session.user;
    if(user && (user._id === obj.author_id || user.is_admin)) {
        return true;
    }
    return false;
};

/**
 * Check if admin
 * 
 * @params {Object} req
 * @api private
 */
exports.check_admin = function(req) {
    return req.session.user && req.session.user.is_admin;
};

/**
 * Check request sent by XMLHttpRequest
 * 
 * 'x-requested-with': 'XMLHttpRequest',
 * 
 * @params {Object} req
 * @api public
 */
exports.isxhr = function(req) {
    return req.headers['x-requested-with'] === 'XMLHttpRequest';
};

var md5 = exports.md5 = function md5(s) {
    var hash = crypto.createHash('md5');
    hash.update(s);
    return hash.digest('hex');
};

exports.gravatar = function(email) {
    return 'http://www.gravatar.com/avatar/' + md5(email || '');
};