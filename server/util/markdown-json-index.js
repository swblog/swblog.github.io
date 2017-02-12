const fs = require('fs');
let reg = /\.md$/;
//遍历读取文件
const getIndex = (path) => {
  let list = [];
  list.push.apply(list, fs.readdirSync(path).map(file => {
    let filePath = path + '/' + file;
    let fileStat = fs.statSync(filePath);
    let ret = {
      path: filePath,
      mtime: new Date(fileStat.mtime).getTime()
    };
    if (fileStat.isDirectory()) {
      let child = getIndex(filePath);
      ret.isDirectory = 1;
      ret.num = child.length;
      list.push.apply(list, child);
    }
    return ret;
  }).filter(o => {
    if (o.isDirectory) {
      return o.num > 0;
    } else if (reg.test(o.path)) {
      return true;
    }
  }));
  return list;
};


module.exports = function (path, callback) {
  let runningPath = process.cwd() + '/';
  return getIndex(path.replace(runningPath, ''));
};
