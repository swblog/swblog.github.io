const fs = require('fs');
const os = require('os');
const {
  getIndex,
  iterator
} = require('./util');
const exec = require('child_process').exec;
const resetMTime = require('./reset_mtime.js');
const articleJson = './json/article.json';
let oldArticlJsonList;
if (fs.existsSync(articleJson)) {
  try{
    oldArticlJsonList = JSON.parse(fs.readFileSync(articleJson));
  }catch(e){}  
}


const pushGit = function (cmdList) {
  //const cmdList = ['git pull origin master', 'git add .', 'git commit -am "[update] article"', 'git push origin master'];
  return new Promise(function (resolve) {
    iterator(cmdList, function (item, next, list) {
      exec(item, (error, stdout, stderr) => {
        if (error && os.platform() === 'win32' && !/commit/.test(error)) { //git commit -am "[update] article"的异常可以忽略
          if (/pull/.test(error)) { //如果第一次执行git pull说明是commit 文章，否则是提交代码
            return resolve();
          }
          console.error(`exec error: ${error}`);
          return exec('start ./server/helper/update.sh', (error, stdout, stderr) => {
            if (error) {
              console.log('push到远程git仓库出现异常，请手动提交');
            }
          });
        }
        console.log('>', item);
        console.log(stdout || stderr);
        if (list.length > 0) {
          next();
        } else {
          resolve();
        }
      });
    });
  });
};

const updateJSON = (callback) =>
  pushGit(['git pull origin master', 'git add .', 'git commit -am "[update] article"']).then(() =>
    resetMTime(oldArticlJsonList, function (data) {
      fs.writeFile(articleJson,
        JSON.stringify(data, null, 1),
        function (err) {
          if (err) throw err;
          console.log('文章索引更新成功', 'It\'s saved to ' + articleJson + '!');
          if (callback) callback();
        }
      );
    }));


if (module.parent) {
  module.exports = updateJSON;
} else {
  updateJSON(function () {
    pushGit(['git add .', 'git commit -am "[update] article"', 'git push origin master']).then(() => console.log('已经push到远程git仓库'));
  });
}
