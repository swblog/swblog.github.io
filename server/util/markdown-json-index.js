const iterator = require('./iterator');
const fs = require('fs');
let myGit;
try{
    myGit = require('simple-git')('./');
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
      let originItem = arr.filter(o=>o.path==item.path)[0] || item;
      let logLine = result && result.latest;
      if(logLine){
        console.log('logLine', logLine);
        originItem.mtime = new Date(logLine.date).getTime();
        originItem.message = logLine.message;
      }else{
        console.log('logLine null');
      }
      console.log('originItem', originItem);

      if(originItem.child && originItem.child.length){
        reviseTime(originItem.child, next);
      }else{
        next();
      }

      if(arr.length===0){
        console.log('callback');
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
