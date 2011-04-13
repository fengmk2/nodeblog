
var db = require('../db');

function Model(data) {
  if(data) {
	for (var k in data) {
	  if (this.fields[k] !== undefined) {
		this[k] = data[k];
	  }
	}
  }
};

Model.prototype = {
  type: null, // child class must set this 
  fields: {id: 'int'},
  save: function(callback) {
	var data = {};
	for(var k in this.fields) {
	  var v = this[k];
	  if (v !== undefined) {
	    data[k] = v;
	  }
	}
	if(data.id) {
	  db.update(this.type, 'id', data, callback);
	} else {
	  db.insert_or_update(this.type, data, callback);
	}
  },
  remove: function() {
	  
  },
  
  // static method
  get: function(id) {
	  
  },
  list: function(offset, count) {
	//
  }
};