/**
 * Template Engine for connect, base on ejs
 * 
 * Use case:
 * 
 * var render = require('./lib/render')
 *   , connect = require('connect');
 * 
 * connect(
 *     render({
 *         root: __dirname + '/views'
 *       , cache: true
 *       , layout: 'layout.html' // or false
 *       , helpers: {
 *          config: config,
 *          sitename: 'NodeBlog Engine'
 *       }
 *     });
 * );
 * 
 * res.render('index.html', {title: 'Index Page', items: items});
 * 
 * // no layout 
 * res.render('blue.html', {items: items, layout: false});
 * 
 * 
 */

var fs = require('fs')
  , path = require('path')
  , http = require('http')
  , ejs = require('ejs')
  , ServerResponse = http.ServerResponse;

var settings = {
    root: __dirname + '/views'
  , cache: true
  , layout: 'layout.html'
};

var cache = {};

module.exports = function(options) {
    options = options || {};
    for(var k in options) {
        settings[k] = options[k];
    }
    return function(req, res, next) {
        req.next = next;
        res.req = req;
        res.render = render;
        res._render = _render;
        next();
    };
};

function render(view, options) {
    options = options || {};
    if(settings.helpers) {
        for(var k in settings.helpers) {
            options[k] = settings.helpers[k];
        }
    }
    var self = this;
    // add request to options
    options.request = self.req;
    // render view template
    self._render(view, options, function(err, str) {
        if(err) {
            return self.req.next(err);
        }
        var layout = settings.layout;
        if(options.layout === false || !layout) {
            return self.end(str);
        }
        // render layout template, add view str to layout's locals.body;
        options.body = str;
        self._render(layout, options, function(err, str) {
            if(err) {
                return self.req.next(err);
            }
            self.end(str);
        });
    });
};

function _render_tpl(fn, options, callback) {
    try {
        var str = fn.call(options.scope, options);
        callback(null, str);
    } catch(err) {
        callback(err);
    }
}

function _render(view, options, callback) {
    var view_path = path.join(settings.root, view);
    var fn = settings.cache && cache[view];
    if(fn) {
        return _render_tpl(fn, options, callback);
    }
    // read template data from view file
    fs.readFile(view_path, 'utf-8', function(err, data) {
        if(err) {
            return callback(err);
        }
        data= parsePartial(data);
        fn = ejs.compile(data, {filename: view});
        if(settings.cache) {
            cache[view] = fn;
        }
        _render_tpl(fn, options, callback);
    });
};

// /<%- partial('view') %>/
var reg_meta= /[\\^$*+?{}.()|\[\]]/g,
     open= ejs.open || "<%",
     close= ejs.close || "%>",
     partial_pattern= new RegExp(open.replace(reg_meta, "\\$&")
                            +"[-=]\\s*partial\\((.+)\\)\\s*"
                            +close.replace(reg_meta, "\\$&"), 'g');
function parsePartial(data, view_name) {
        data= data.replace(partial_pattern, function(all, view) {
            view= view.match(/['"](.*)['"]/);    //get the view name
            if (!view || view[1]==view_name) {
                //throw new Error("Error when parsing view partial");
                return "";
            } else {
                hasPartial= true;
                var view_path= path.join(settings.root, view[1]),
                     s;
                try {
                     s= fs.readFileSync(view_path, 'utf-8');
                } catch(e) {
                     console.error("Error: cannot load view partial "+fp);
                     return "";
                }
                return parsePartial(s, view[1]);
            }
        });
    return data;
}