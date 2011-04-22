# Usage

To get started simply require('express-resource'), and this module will monkey-patch Express, enabling resourceful routing by providing the app.resource() method. A "resource" is simply an object, which defines one of more of the supported "actions" listed below:

    exports.index = function(req, res){
      res.send('forum index');
    };
    
    exports.new = function(req, res){
      res.send('new forum');
    };
    
    exports.create = function(req, res){
      res.send('create forum');
    };
    
    exports.show = function(req, res){
      res.send('show forum ' + req.params.id);
    };
    
    exports.edit = function(req, res){
      res.send('edit forum ' + req.params.id);
    };
    
    exports.update = function(req, res){
      res.send('update forum ' + req.params.id);
    };
    
    exports.destroy = function(req, res){
      res.send('destroy forum ' + req.params.id);
    };
    
The app.resource() method returns a new Resource object, which can be used to further map pathnames, nest resources, and more.

    var express = require('express')
      , Resource = require('express-resource')
      , app = express.createServer();

    app.resource('forums', require('./forum'));
    
## Default Action Mapping

Actions are then mapped as follows (by default), providing req.params.forum which contains the substring where ":forum" is shown below:

    GET     /forums              ->  index
    GET     /forums/new          ->  new
    POST    /forums              ->  create
    GET     /forums/:forum       ->  show
    GET     /forums/:forum/edit  ->  edit
    PUT     /forums/:forum       ->  update
    DELETE  /forums/:forum       ->  destroy

## Top-Level Resource

Specify a top-level resource by omitting the resource name:

    app.resource(require('./forum'));
    
Top-level actions are then mapped as follows (by default):

    GET     /                 ->  index
    GET     /new              ->  new
    POST    /                 ->  create
    GET     /:id              ->  show
    GET     /:id/edit         ->  edit
    PUT     /:id              ->  update
    DELETE  /:id              ->  destroy