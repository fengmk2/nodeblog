var Client = require('mysql').Client,
	config = require('./config.js');

Client.prototype.Literal = function(val) {
	this.value = val;
};

Client.prototype.literal = function(val) {
	return new this.Literal(val);
};

Client.prototype.escape = function(val) {
	if(val instanceof Client.prototype.Literal){ // 文本参数不作任何转换
		return val.value;
	}
	if (val === undefined || val === null) {
		return 'NULL';
	}

	switch (typeof val) {
	case 'boolean': return (val) ? 'true' : 'false';
	case 'number': return val+'';
	}

	if (typeof val === 'object') {
		val = val.toString();
	}

	val = val.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function(s) {
		switch(s) {
		case "\0": return "\\0";
		case "\n": return "\\n";
		case "\r": return "\\r";
		case "\b": return "\\b";
		case "\t": return "\\t";
		case "\x1a": return "\\Z";
		default: return "\\"+s;
		}
	});
	return "'"+val+"'";
};

/*
 * 添加一条记录到指定的表，若发现已存在，则更新
 * not_updates: 不更新的字段
 * 
 */
Client.prototype.insert_or_update = function(table, data, not_updates, callback) {
	if(!callback) {
		callback = not_updates;
		not_updates = null;
	}
	not_updates = not_updates || [];
	var sql = table + ' set ';
	var update_sql = '';
	var params = [];
	for(var k in data) {
		sql += ' `' + k + '`=?,';
		params.push(data[k]);
		if(not_updates.indexOf(k) < 0) {
			update_sql += ' `' + k + '`=values(`' + k + '`),';
		}
	}
	sql = sql.substring(0, sql.length - 1);
	if(update_sql) {
		sql = 'INSERT INTO ' + sql + ' ON DUPLICATE KEY UPDATE ' + update_sql.substring(0, update_sql.length - 1);
	} else {
		sql += 'INSERT IGNORE INTO ' + sql;
	}
	this.query(sql, params, callback);
};

Client.prototype.update = function(table, keys, data, callback) {
	var sql = 'update ' + table + ' set ';
	if(typeof keys === 'string') {
		keys = [keys];
	}
	var wheres = [];
	var params = [];
	for(var k in data) {
		if(keys.indexOf(k) < 0) {
			sql += ' `' + k + '`=?,';
			params.push(data[k]);
		}
	}
	sql = sql.substring(0, sql.length - 1);
	keys.forEach(function(key) {
		wheres.push(key + '=?');
		params.push(data[key]);
	});
	sql += ' where ' + wheres.join(' and ');
	this.query(sql, params, callback);
};

Client.prototype.get_obj = function(table, key_values, callback) {
	var conditions = [];
	var params = [];
	for(var k in key_values){
		conditions.push('`' + k + '`=?');
		params.push(key_values[k]);
	}
	mysql_db.query('select * from ' + table + ' where ' 
			+ conditions.join(' and '), params, 
			function(err, rows){
		var obj = null;
		if(err) {
			console.log(err);
		} else if(rows.length = 1){
			obj = rows[0];
		}
		callback(err, obj);
	});
};

Client.prototype.get_objs = function(table, key, values, callback) {
	var objs = {};
	if(values.length == 0) {
		callback(objs);
	} else {
		var qs = [];
		for(var i=0; i<values.length; i++){
			qs.push('?');
		}
//		console.log('select * from ' + table + ' where `' + key + '` in (' 
//				+ qs.join(',') + ')', values)
		mysql_db.query('select * from ' + table + ' where `' + key + '` in (' 
				+ qs.join(',') + ')', values, function(err, rows){
			if(err) {
				console.log(err);
			}
			rows.forEach(function(row){
				objs[row[key]] = row;
			});
			callback(err, objs);
		});
	}
};

Client.prototype.list_objs = function(table, offset, limit, callback) {
    if(arguments.length == 2) {
        callback = arguments[1];
        offset = 0;
        limit = 10;
    }
    mysql_db.query('select * from ' + table 
        + ' order by id desc limit ' + offset + ', ' + limit, callback);
};


var mysql_db = new Client(config.db_options);
mysql_db.connect();

module.exports = mysql_db;
