const exec = require('child_process').exec;
let myGit = new Promise(function(resolve){
  try{
      resolve(require('simple-git')); //这里使用git提交的时间进行修正，确保在不同仓库中的一致性。
  }catch(e){
    exec('npm install simple-git --save-dev', (error, stdout, stderr) => {
      try{
        resolve(require('simple-git'));
      }catch(e){
        console.log('安装simple-git失败，请手动执行npm install simple-git --save-dev');
        resolve();
      }
    });
  }
});

//
// //遍历读取文件
// const createIndex = (path) => fs.readdirSync(path).map(file => {
//    let filePath = path + '/' + file;
//    let fileStat = fs.statSync(filePath);
//    let ret = {
//      path: filePath,
//      mtime: new Date(fileStat.mtime).getTime()
//    };
//    if(fileStat.isDirectory()){
//      ret.child = createIndex(filePath);
//    }
//    return ret;
//  });
//
// myGit.then(function(git){
//   git('./').log(['--name-only', '--pretty=format:%cd', './blog'], (err, result) => {
//       if(err){
//         console.log('建议使用Git Bash执行该命令');
//       }
//       console.log('result', result.latest.hash);
//     });
// });



let article = require('../json/article.json');

const updateJSON = require('./update-index.js');

function structToList(obj){
  let list = [];
  if(obj.length){
    list.push.apply(list, obj.map(function(o){
      if(o.child){
        list.push.apply(list, structToList(o.child));
      }
      return o.path;
    }));
  }
  return list;
}

updateJSON();
//console.log('article', structToList(article));
