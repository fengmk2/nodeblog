/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , markdown = require('./lib/markdown');

var Post = new Schema({
	title: String
  , author: ObjectId
  , content: String
  , is_markdown: {type: Boolean, default: true}
  , tags: [String]
  , public: {type: Boolean, default: true}
  , weblog_post: String
  , weblog_sync: {type: Boolean, default: true}
  , create_at: {type: Date, default: Date.now, index: true}
  , update_at: {type: Date, default: Date.now}
});
Post.virtual('html').get(function() {
	return this.is_markdown && this.content ? markdown.parse(this.content) : this.content;
});
mongoose.model('Post', Post);

var User = new Schema({
	screen_name: String
  , uid: String
  , t_url: String
  , profile_image_url: String
  , info: {}
  , metaweblog: {type: {}, default: Object}
  , setting: {type: {}, default: Object}
  , create_at: {type: Date, default: Date.now}
  , update_at: {type: Date, default: Date.now}
});
mongoose.model('User', User);

mongoose.connect('mongodb://localhost/nodeblog');
exports.Post = mongoose.model('Post');
exports.User = mongoose.model('User');
