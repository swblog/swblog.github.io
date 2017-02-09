const m_config = require('model/config');
const m_article = require('model/article');
let storageKey = 'read_history';
let readHistory = {};
const init = ()=> {
  try{
    readHistory = $.extend({}, JSON.parse(localStorage.getItem(storageKey)), readHistory);
  }catch(e){}
};

m_config.getConfig.then(()=>{
  storageKey = 'read_history_' + m_config.username;
  init();
})

const addHistory = (path)=>{
  readHistory[path] = Date.now();
  localStorage.setItem(storageKey, JSON.stringify(readHistory));
};

const getRecommend = ()=>{
  let list = [];
  let currentPath = decodeURIComponent(location.hash.replace('#!/', ''));
  let articleList = m_article.getArticleList();
  articleList.some(function(o){
    if(!readHistory[o.path] && o.path!=currentPath){
      list.push(o);
      if(list.length > 10){
        return true;
      }
    }
  });
  return list;
};
module.exports = {
  addHistory,
  getRecommend
};
