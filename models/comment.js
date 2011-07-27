/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , markdown = require('github-flavored-markdown').parse;

var Comment = new Schema({
    author_id: ObjectId
  , user_info: {type: {}}
  , content: String
  , parent_id: {type: ObjectId, index: true}
  , is_markdown: {type: Boolean, default: true}
  , create_at: {type: Date, default: Date.now, index: true}
  , update_at: {type: Date, default: Date.now}
});
Comment.virtual('html').get(function() {
    return this.is_markdown && this.content ? markdown(this.content) : this.content;
});
mongoose.model('Comment', Comment);