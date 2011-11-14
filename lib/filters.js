
var markdown_parse = require('github-flavored-markdown').parse;

exports.markdown = function(str) {
    return markdown_parse(str);
};