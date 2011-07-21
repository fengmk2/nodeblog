# A blog base on nodejs.

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

 * [libxml2](http://www.xmlsoft.org/), libxml2-devel
 * [node.js](http://nodejs.org/)
 * v8 (comes bundled with node, no need to install)
 * [scons](http://www.scons.org/) (for building)
 * [mongodb](http://www.mongodb.org/)

### Ubuntu
    
    $ sudo apt-get install libxml2 libxml2-dev scons mongodb

### CentOS

    $ sudo yum install libxml2 libxml2-devel 
    
    # install scons
    $ wget http://prdownloads.sourceforge.net/scons/scons-2.1.0.alpha.20101125.tar.gz
    $ cd scons-2.1.0.alpha.20101125
    $ sudo python setup.py install
    
    # install mongodb
    # see: http://www.mongodb.org/display/DOCS/CentOS+and+Fedora+Packages


install libxmljs on no.de: http://discuss.joyent.com/viewtopic.php?pid=225354#p225354

    Next: tell scons to import your external environment. This allows it to use your path.
    Change line 56 from:
    Code:
    env = Environment(BUILDERS = {'Test' : testBuilder})
    
    to:
    Code:
    env = Environment(ENV = os.environ, BUILDERS = {'Test' : testBuilder})

    
## Node Modules Install

    $ sudo npm install express express-resource tenjin weibo metaweblog mongoose github-flavored-markdown

## Install NodeBlog
    
    $ git clone git://github.com/fengmk2/nodeblog.git
    $ git submodule init
    $ git submodule update

## DIY template 

 * http://www.csstemplatesfree.org/templates/a_bit_boxy/index.html
 * http://www.dcarter.co.uk/templates.html
 * http://www.csstemplatesfree.org/templates/simple_square/index.html
 * http://www.instapaper.com/extras

## Snapshot

 
