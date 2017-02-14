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


module.exports = {
  addHistory,
  hasRead: (path)=> !!readHistory[path],
  getReadTime: (path)=> readHistory[path]
};
