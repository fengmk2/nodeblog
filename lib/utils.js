
var crypto = require('crypto');
var markdown_parse = require('./showdown').parse;

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

exports.markdown = function(str) {
    return markdown_parse(str);
};

/**
 * render first paragraph markdown for detail
 */
exports.first_paragraph_markdown = function(markdown) {
    markdown = markdown.trim();
    var first = markdown.indexOf('##');
    if(first >= 0) {
        var index = markdown.indexOf('##', first + 2);
        if(index > 0) {
            markdown = markdown.substring(0, index) + '......';
        }
    }
    return markdown_parse(markdown);
};

exports.truncatechars = function(text, max) {
    if(!text) return '';
    text = text.trim();
    var len = Math.round(text.replace(/[^\x00-\xff]/g, "qq").length / 2);
    if(len > max) {
        for(var index = 0, j = 0, l = max - 2; j < l; index++) {
            if(/[^\x00-\xff]/.test(text[index])) {
                j += 1;
            } else {
                j += 0.5;
            }
        }
        text = text.substring(0, index) + '…';
    }
    return text;
};