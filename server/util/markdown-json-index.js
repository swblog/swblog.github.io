const fs = require('fs');
const git = require('simple-git');
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
   }else{
     let path= require('path');
     filePath = path.resolve('./');
     console.log(filePath);
     git(filePath).log(['-1'], (err, result) => {
       console.log('err', err);
       console.log('result', result);
     });
   }
   return ret;
 }).filter(o => {
   if(o.child){
     return true;
   }else if(reg.test(o.path)){
     return true;
   }
});

module.exports = function(path, ext){
  if(ext){
    reg = new RegExp('\.'+ ext +'$');
  }
  let runningPath = process.cwd()+'/';
  return createIndex(path.replace(runningPath, ''));
};
