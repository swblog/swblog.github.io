const fs = require('fs');
const getIndex = require('./util/markdown-json-index');

fs.writeFile('./json/article.json',
  JSON.stringify(getIndex('blog'), null, 1),
  function (err) {
    if (err) throw err;
    console.log('It\'s saved to article.json!');
  }
);
