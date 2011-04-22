// config for blog settings

var path = require('path');

// for support vhost
//exports.subdomain = '*.nodeblogtest.org';

exports.DATA_DIR = path.join(__dirname, 'data');

exports.db_options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '123456',
	database: 'nodeblog'
};

exports.session_secret = 'weorulx123dfwlfjlsjdfppqlasAWDOfjnjxjclvjlsdfjoasdufowefjljdf';
exports.session_dir = path.join(exports.DATA_DIR, '.sessions');
exports.weibo_appkeys = {
	tsina: ['3538199806', '18cf587d60e11e3c160114fd92dd1f2b'],
	tqq: ['b6d893a83bd54e598b5a7c359599190a', '34ad78be42426de26e5c4b445843bb78'],
	twitter: ['i1aAkHo2GkZRWbUOQe8zA', 'MCskw4dW5dhWAYKGl3laRVTLzT8jTonOIOpmzEY']
};

exports.admins = ['tsina:1640328892'];