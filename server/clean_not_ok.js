const fs = require('fs');
const {
  getIndex,
  iterator
} = require('./util');

function clean() {
  let newArticleJsonList = getIndex('blog');
  newArticleJsonList.forEach(function (item) {
    if (item.isDirectory !== 1) {
      let path = item.path;
      let content = fs.readFileSync(path,'utf-8');

      if(/^\s*---\n|^[^-#`]+\n---/.test(content)){
        let start = content.indexOf('---');
        let end;
        if(start===0){
          start = start+3;
          end = content.substring(start).indexOf('---') + start;
        }else{
          end = start;
          start = 0;
        }
        let arr = content.substring(start, end).match(/([^:\n]+:[^\n]+)/g);
        if(arr){
          let attrDict = {};
          arr.forEach(function(o){
            let point = o.indexOf(':');
            attrDict[o.substring(0, point)] = o.substring(point+1);
          });
          let title = attrDict.title;
          content = content.substring(end+3).trim();
          if(attrDict.dest_url){
            content = '链接：['+attrDict.dest_url+']('+attrDict.dest_url+')\n' + content;
          }
          if(attrDict.title){
            content = '## ' + attrDict.title + '\n' + content;
          }
          console.log('去除可能导致Github 返回404的部分' + path);
          fs.writeFileSync(path, content);
        }
      }
    }
  });

}


if (module.parent) {
  module.exports = clean;
} else {
  clean();
}
