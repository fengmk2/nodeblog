# H1

Below is a code

    var showdown = require('../lib/showdown');
    var fs = require('fs');

    var html = showdown.parse(fs.readFileSync(__dirname + '/showdown.test.md'));

    console.log(html);

also code too.

```
var showdown = require('../lib/showdown');
var fs = require('fs');

var html = showdown.parse(fs.readFileSync(__dirname + '/showdown.test.md'));

console.log(html);
```


## H2

> 哈哈

### 3

* item 1
* item 2
* item 3

1. sorted item 1
2. sorted item 2
3. sorted item 3

`END` over.