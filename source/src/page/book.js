const s_mainContainer = require('card/common/slidebar_container');
const m_article = require('model/article');
const c_articleList = require('card/blog/article_list');



module.exports = function(page, key) {
  page.html(s_mainContainer);
  let viewContent = page.find('[data-selector="main"]');
  let viewSlidebar = page.find('[data-selector="slidebar"]');
  let slidebar;
  viewSlidebar.setView({
    name: 'blog/slidebar',
    template: '<div data-on="?m=mkview" style="background-color: #ffffe8;"></div>'
  });

  viewContent.setView({
    name: 'blog/blog',
    template: '<div data-on="?m=mkview"></div>'
  });


  page.setView({
    start: function(hasRender){
      m_article.getArticleContent(key + '/$sidebar$.md').then((data)=>{
        if(!slidebar){
          slidebar = $.extend({}, data);
          let content = slidebar.content || '';
          let chapters = slidebar.chapters = [];

          slidebar.content = content.replace(/<%(([^>]|[^%]>)+)%>/g,function($0, $1){
            chapters.push($1);
            return '<a data-on="?m=replaceHash" data-url="#!/'+BCD.getHash(0)+'/'+$1+'.md">'+$1+'</a>';
          });
          viewSlidebar.reset(slidebar);
          setTimeout(function(){
            viewSlidebar.bindEvent();
          });
        }
        let fileName = BCD.getHash(1);
        if(fileName){
          m_article.getArticleContent(key + '/' + fileName).then((data)=>{
            viewContent.reset(data);
          });
        }else{
          return BCD.replaceHash('#!/'+BCD.getHash(0)+'/'+slidebar.chapters[0]+'.md');
        }
        // m_readHistory.addHistory(key);
        // page.setView({title: data.title});
        // document.title = data.title;
        // viewContent.reset(data);
      });
      // m_article.getListByCatalog(key, BCD.getHash(1)).then((data)=>{
      //   data.title = '"'+data.tag.replace(/^[^/]+\//, '')+'" 的最新文章';
      //   data.hrefHead = '#!/'+BCD.getHash(0);
      //   viewList.reset(data);
      // });
    }
  })
};
