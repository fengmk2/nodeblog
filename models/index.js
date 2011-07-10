/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , db = require('../config').db_options;
require('./post'), require('./user');

var uri = 'mongodb://';
if(db.user && db.password) {
    uri += db.user + ':' + db.password + '@';
}
db.host = db.host || 'localhost';
uri += db.host;
if(db.port) {
    uri += ':' + port;
}
uri += '/' + db.database;

mongoose.connect(uri, function(err) {
    if(err) {
        console.error(uri + ' error: ' + err.message);
        console.error(err);
        process.exit(1);
    } else {
        console.log(uri + ' success.');
    }
});

exports.Post = mongoose.model('Post');
exports.User = mongoose.model('User');