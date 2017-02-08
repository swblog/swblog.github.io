const c_footer = require('card/common/footer');
const c_mainContainer = require('card/common/main_container');
const m_article = require('model/article');
const m_initOption = require('helper/init_option');
const c_pannelList = require('card/blog/pannel_list');
const c_articleList = require('card/blog/article_list');



module.exports = function(page, key) {
  let viewBody = c_mainContainer();
  let viewList = viewBody.find('[data-selector="main"]');
  let viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
  viewList.setView(c_articleList({
    delay: true
  }));
  viewBody.addView(viewList);
  viewBody.addView(viewPannelList);

  let viewFoot = c_footer();
  page.setView({
    start: function(hasRender){
      viewList.empty();
      let hrefHead = location.hash.replace(/\/\d*$/, '');
      if(key=='index'){
        m_article.getListByTag(0, BCD.getHash(1)).then((data)=>{
          data.title = "最新文章";
          data.hrefHead = hrefHead;
          viewList.reset(data);
        });
      }else if(key=='tag'){
        let tag = BCD.getHash(1);
          m_article.getListByTag(tag, BCD.getHash(2)).then((data)=>{
            data.title = '"'+tag+'" 的最新文章';
            data.hrefHead = hrefHead;
            viewList.reset(data);
          });
      }else if(m_article.getCatalog(key)){
        m_article.getListByCatalog(key, BCD.getHash(1)).then((data)=>{
          data.title = '"'+data.tag.replace(/^[^/]+\//, '')+'" 的最新文章';
          data.hrefHead = hrefHead;
          viewList.reset(data);
        });
      }
      return m_initOption.notRender(hasRender);
    },
    title: '文章列表',
    viewList: [viewBody, viewFoot]
  })
};
