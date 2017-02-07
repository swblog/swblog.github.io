const iterator = require('./iterator');
const fs = require('fs');
let myGit;
try{
    myGit = require('simple-git')('./'); //这里使用git提交的时间进行修正，确保在不同仓库中的一致性。
}catch(e){}

let reg = /\.md$/;
//遍历读取文件
const createIndex = (path) => fs.readdirSync(path).map(file => {
   let filePath = path + '/' + file;
   let fileStat = fs.statSync(filePath);
   let ret = {
     path: filePath,
     mtime: new Date(fileStat.mtime).getTime()
   };
   if(fileStat.isDirectory()){
     ret.child = createIndex(filePath);
   }
   return ret;
 }).filter(o => {
   if(o.child){
     return true;
   }else if(reg.test(o.path)){
     return true;
   }
});

const reviseTime = function(list, callback){
  iterator(list, function(item, next, arr){
    console.log(item.path);
    myGit.log(['-1', item.path], (err, result) => {
      if(err){
        console.log('建议使用Git Bash执行该命令');
      }
      let originItem = list.filter(o=>o.path==item.path)[0] || item;
      let logLine = result && result.latest;
      if(logLine){
        //console.log('logLine', logLine);
        originItem.mtime = new Date(logLine.date).getTime();
        //originItem.message = logLine.message;
      }
      //console.log('originItem', originItem);

      if(originItem.child && originItem.child.length){
        reviseTime(originItem.child, next);
      }else{
        next();
      }

      if(arr.length===0){
        callback(list);
      }
    });

  });
}

module.exports = function(path, callback){
  let runningPath = process.cwd()+'/';
  let indexJson = createIndex(path.replace(runningPath, ''));
  if(myGit){
    reviseTime(indexJson, ()=>callback(indexJson));
  }else{
    callback(indexJson);
  }
};
