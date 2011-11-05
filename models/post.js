/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId
  , markdown = require('github-flavored-markdown').parse;

var Post = new Schema({
    title: String
  , author_id: ObjectId
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
    return this.is_markdown && this.content ? markdown(this.content) : this.content;
});
/**
 * find by tag
 */
Post.statics.findByTag= function(tagName, callback) {
  //先通过collection Tag定位
  var Tag=mongoose.model('Tag')
    , self= this;

  var afterTags= function(err, tags) {
    //根据检索出的post id列表查找实际post
    if (err) return callback(err);
    var posts_id=[];
    if (Array.isArray(tags)) {
      for (var i=0, len=tags.length; i++; i<len) {
        posts_id= posts_id.concat(tags[i].posts_id);
      }
    } else {
      posts_id= tags.posts_id;
    }
    self.find({
      _id: {$in: posts_id}
    }, callback);
  };

  if (Array.isArray(tagName)) {
    Tag.find({
      name: {$in: tagName}
    }, ['posts_id'], afterTags);
  } else {
    Tag.findOne({
      name: tagName
    }, ['posts_id'], afterTags);
  }
}
mongoose.model('Post', Post);