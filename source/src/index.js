/**
 * @file index 入口文件，路由定义
 * @author ljquan@qq.com
 */
require('css/blog.css');
require('helper/common_event.js');
const m_article = require('model/article');
const m_config = require('model/config');
const c_header = require('card/common/navigator');
const c_pageList = require('page/list.js');
const c_pageContent = require('page/content.js');
let viewHeader = c_header({
  check: function(obj) {
    if(!!obj.author){
      m_config.init(obj);
      return true;
    }
  }
});
$('body').append(viewHeader);

BCD.ajaxCache('./json/article.json', function(data) {
  m_article.init(data);
  //入口
  BCD.app({
    setTitle: function(str){
      viewHeader.reset();
      document.title = str;
    },
    initPage: function(key, next) {

      var page = this;
      if(key=='index'){
        c_pageList(page, key);
        next();
      }else if(key=='tag'){
        c_pageList(page, key);
        next();
      }else{
        let path = decodeURIComponent(key);
        if(m_article.getCatalog(path)){
          c_pageList(page, path);
          return next();
        }else if(m_article.getArticle(path)){
          c_pageContent(page, path);
          return next();
        }
        
        BCD.replaceHash('#!/index');
        next(-1);
      }
    }
  });
});
