# View Theme

## Howto use a View Theme

1. add view templates under /views/{your theme}

2. add corresponding css\js\img files under /public/{your theme}

3. set the 'view_theme' option in /config.js


## Structure of View Theme templates

normally a View Theme should contain following templates: 

* index

* 404
error page for 404

* archive 
for posts list. usually used to display searching\catgorizing results

* post/item
for a single post

* page
for static pages


## P.S.

You can use <%- partial('inclued_template') %> in template file to include an another file.