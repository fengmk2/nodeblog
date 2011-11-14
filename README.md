# A blog base on nodejs. Demo: http://nodeblog.org, http://nodeblog.cnodejs.net

## Features

 * Write, Read, List, Search blog.
 * Comments
 * Support image and file upload.
 * DIY template
 * Support nodester.com, no.de... nodejs host services
 * Simple to install
 * Support post to twitter, facebook, weibo, tqq and so on.
 * Speed
 * Support MetaWeblog API Sync
 * Support 42qu.com

## Requirements

 * [node.js](http://nodejs.org/)
 * [mongodb](http://www.mongodb.org/)

### Ubuntu
    
    $ sudo apt-get install mongodb

### CentOS

    # install mongodb
    # see: http://www.mongodb.org/display/DOCS/CentOS+and+Fedora+Packages

## Node Modules Install

    $ sudo npm install connect ejs weibo metaweblog mongoskin github-flavored-markdown

## Install NodeBlog
    
    $ git clone git://github.com/fengmk2/nodeblog.git
    $ cd nodeblog
    $ cp config.js.tpl config.js
    $ node server.js

## DIY template 

 * http://www.csstemplatesfree.org/templates/a_bit_boxy/index.html
 * http://www.dcarter.co.uk/templates.html
 * http://www.csstemplatesfree.org/templates/simple_square/index.html
 * http://www.instapaper.com/extras

## Snapshot

![Index](http://ww1.sinaimg.cn/large/6cfc7910jw1dn1p7j7demj.jpg)
![Settings](http://ww1.sinaimg.cn/large/6cfc7910jw1dn1p8enjrmj.jpg)
![new post](http://ww3.sinaimg.cn/large/6cfc7910jw1dn1p9wmumkj.jpg)
![comments](http://ww2.sinaimg.cn/large/6cfc7910jw1dn1pbjnfeij.jpg)

