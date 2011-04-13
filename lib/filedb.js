
var cache = {};

module.exports = {
  save: function(type, data) {
	if (cache[type] === undefined) {
	  cache[type] = {};
	  cache[type].auto_id = 0;
	}
	var type_cache = cache[type];
	if (!data.id) {
	  data.id = type_cache.auto_id + 1;
	}
	if (type_cache[data.id] === undefined) {
	  type_cache.auto_id += 1;
	}
	type_cache[data.id] = data;
  },
  _append: function(type, auto_id, data) {
	var buffer = [];
	var count = 0;
	for (var k in data) {
      count++;
      var v = data[k];
      buffer.push('$' + k.length + '\r\n' + k);
      if (v == null) {
    	buffer.push('$-1');
      } else {
	    if (typeof v !== 'string') {
	      v = v.toString();	  
	    }
	    buffer.push('$' + v.length + '\r\n' + v);
      }
	}
    fs.write(this.fd, );
  }
};