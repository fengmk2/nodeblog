/*!
 * nodeblog - showdown.test.js
 * Copyright(c) 2012 fengmk2 <fengmk2@gmail.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var showdown = require('../lib/showdown');
var fs = require('fs');

var md = fs.readFileSync(__dirname + '/showdown.test.code.md').toString();
var html = showdown.parse(md);

console.log(md);

console.log('\n\n-------- ==============> ---------------\n\n');

console.log(html);