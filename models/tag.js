/**
 * Module dependencies.
 */

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;


var Tag = new Schema({
    name: {type: String, index: true}
  , posts_id: [ObjectId]
  , parent_id: {type: ObjectId, default: null}
});


/**
 * add tags corresponding to a post
 * @param {ObjectId} post_id
 * @param {String} tags
 */
Tag.statics.addPostTags= function(post_id, tags, callback) {
  if (!tags || !tags.length) {
    return;
  }
  for (var i=0, len=tags.length; i<len; i++) {
    if (tags[i].length<=0) continue;
    this.update({
      name: tags[i]
    }, {
      $push: {posts_id: post_id}
      //$addToSet: {posts_id: post_id}
    }, {
      upsert: true
    }, callback);
  }
}
/** 
 * delete tags of a post
 */
Tag.statics.delPostTags= function(post_id, tags, callback) {
  if (!tags || !tags.length) {
    return;
  }
  this.update({
    name: {$in: tags}
  }, {
    $pull: {posts_id: post_id}
  }, {
    multi: true
  }, callback);
}
/**
 * update tags for a post
 */
Tag.statics.updatePostTags= function(post_id, new_tags, old_tags, callback) {
  var still_tags={}
    , t;
  if (new_tags && old_tags) {
    //求 new_tags & old_tags 的差集以避免重复更新
    for (var i=0, ii=new_tags.length; i<ii; i++) {
      still_tags[new_tags[i]]=1;
    }
    for (var i=0, ii=old_tags.length; i<ii; i++) {
      if (still_tags[old_tags[i]]) {
        still_tags[old_tags[i]]=2;
      }
    }
    var diff= function(n) {
      return still_tags[n]!=2;
    }
    new_tags= new_tags.filter(diff);
    old_tags= old_tags.filter(diff);
  }
  Tag.statics.delPostTags.call(this, post_id, old_tags, callback);
  Tag.statics.addPostTags.call(this, post_id, new_tags, callback);
}

mongoose.model('Tag', Tag);