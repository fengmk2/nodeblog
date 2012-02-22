<div class="slide">
# h1
</div>



## h2

代码啊
```
var showdown = require('../lib/showdown');
var fs = require('fs');

var html = showdown.parse(fs.readFileSync(__dirname + '/showdown.test.md'));

console.log(html);
```

```
code 2

ddd
```

PS: 提了pull request，但是估计在没有真实攻击示例放出来之前，是不会被接受的。

```
/**
 * Parse the given str.
 */
`abc`
exports.parse = function(str, options) {
  if (null == str || '' == str) return {};
  return 'object' == typeof str
    ? parseObject(str)
    : parseString(str, options);
};
```
