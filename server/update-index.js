const fs = require('fs');
const {
  getIndex,
  iterator
} = require('./util');
const exec = require('child_process').exec;


const pushGit = function () {
  const cmdList = ['git pull origin master', 'git add .', 'git commit -am "[update] article"', 'git push origin master'];
  iterator(cmdList, function (item, next, list) {
    exec(item, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return exec('start ./server/helper/update.sh');
      }
      next();
      console.log(`stdout: ${stdout}`);
      console.log(`stderr: ${stderr}`);
    });
  });
};

fs.writeFile('./json/article.json',
  JSON.stringify(getIndex('blog'), null, 1),
  function (err) {
    if (err) throw err;
    console.log('It\'s saved to article.json!');
    pushGit();
  }
);
