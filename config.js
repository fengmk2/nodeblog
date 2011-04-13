// config for blog settings

var path = require('path');

exports.DATA_DIR = path.join(__dirname, 'data');

exports.db_options = {
	host: 'localhost',
	port: 3306,
	user: 'root',
	password: '123456',
	database: 'nodeblog'
};
