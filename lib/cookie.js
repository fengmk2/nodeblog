/**
 * Response Cookie utils for Connect
 */

var utils = require('connect').utils;

module.exports = function() {
    return function(req, res, next) {
        res.clearCookie = clearCookie;
        res.cookie = cookie;
        next();
    };
};

/**
 * Clear cookie `name`.
 *
 * @param {String} name
 * @param {Object} options
 * @param {ServerResponse} for chaining
 * @api public
 */
function clearCookie(name, options){
    options = options || {};
    options.expires = new Date(1);
    return this.cookie(name, '', options);
};

/**
 * Set cookie `name` to `val`, with the given `options`.
 *
 * Options:
 *
 *    - `maxAge`   max-age in milliseconds, converted to `expires`
 *    - `path`     defaults is "/"
 *
 * Examples:
 *
 *    // "Remember Me" for 15 minutes
 *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
 *
 *    // save as above
 *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
 *
 * @param {String} name
 * @param {String} val
 * @param {Options} options
 * @api public
 */
function cookie(name, val, options){
    options = options || {};
    if ('maxAge' in options) {
        options.expires = new Date(Date.now() + options.maxAge);
    }
    options.path = options.path || '/';
    var cookie = utils.serializeCookie(name, val, options);
    this.writeHead('Set-Cookie', cookie);
    return this;
};