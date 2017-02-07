const fs = require('fs');
const {
  getIndex,
  iterator
} = require('./util');
const exec = require('child_process').exec;
const articleJson = './json/article.json';

const pushGit = function () {
  const cmdList = ['git pull origin master', 'git add .', 'git commit -am "[update] article"', 'git push origin master'];
  iterator(cmdList, function (item, next, list) {
    exec(item, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return exec('start ./server/helper/update.sh', (error, stdout, stderr) => {
          if (error) {
            console.log('push到远程git仓库出现异常，请手动提交');
          }
        });
      }
      console.log('>', item);
      console.log(stdout || stderr);
      if(list.length > 0){
        next();
      }else{
        console.log('已经push到远程git仓库');
      }
    });
  });
};

fs.writeFile(articleJson,
  JSON.stringify(getIndex('blog'), null, 1),
  function (err) {
    if (err) throw err;
    console.log('文章索引更新成功', 'It\'s saved to '+articleJson+'!');
    pushGit();
  }
);
