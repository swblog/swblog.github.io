const fs = require('fs');
const {
  getIndex,
  iterator
} = require('./util');
const exec = require('child_process').exec;
let myGit = new Promise(function (resolve) {
  try {
    resolve(require('simple-git')); //这里使用git提交的时间进行修正，确保在不同仓库中的一致性。
  } catch (e) {
    exec('npm install simple-git --save-dev', (error, stdout, stderr) => {
      try {
        resolve(require('simple-git'));
      } catch (e) {
        console.log('安装simple-git失败，请手动执行npm install simple-git --save-dev');
        resolve();
      }
    });
  }
});


function resetMTime(oldArticlJsonList, callback) {
  let oldArticlDict = {};
  if (oldArticlJsonList) {
    oldArticlJsonList.forEach(function (item) {
      oldArticlDict[item.path] = item.mtime;
    });
  }

  let newArticleJsonList = getIndex('blog');
  let needToUpdate = []; //存放索引
  newArticleJsonList.forEach(function (item) {
    if (oldArticlDict[item.path] !== item.mtime) {
      needToUpdate.push(item);
    }
  });
  if (needToUpdate.length) {
    myGit.then(function (git) {
      let currentGit = git('./');
      iterator(needToUpdate, function (item, next, arr) {
        console.log('reset mtime:', item.path);
        currentGit.log(['-1', item.path], (err, result) => {
          if (err) {
            console.log('建议使用Git Bash执行该命令');
          }
          let logLine = result && result.latest;
          if (logLine) {
            //console.log('item.mtime', item.mtime);
            item.mtime = new Date(logLine.date).getTime();
            //console.log('logLine.date', item.mtime);
            fs.utimesSync(item.path, item.mtime / 1000, item.mtime / 1000);
            //originItem.message = logLine.message;
          }

          if (arr.length === 0) {
            callback && callback(newArticleJsonList);
          } else {
            next();
          }
        });

      });

    });
  } else {
    callback && callback(newArticleJsonList);
  }
}

if (module.parent) {
  module.exports = resetMTime;
} else {
  resetMTime();
}
