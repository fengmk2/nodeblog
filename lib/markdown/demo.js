var md = require('../markdown'),
	fs = require('fs');

var demo_source = fs.readFileSync('demo.md', 'utf-8');
console.log(md.parse(demo_source));