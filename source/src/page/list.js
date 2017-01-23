const c_footer = require('card/common/footer');
const m_article = require('model/article');
const m_config = require('model/config');
const m_initOption = require('helper/init_option');
const c_pannelList = require('card/blog/pannel_list');
const c_articleList = require('card/blog/article_list');



module.exports = function(page, key) {
  let viewBody = $('<div class="container">' +
    '  <div class="row">' +
    '    <div class="col-md-8" data-selector="main"></div>' +
    '    <div class="col-md-4" data-selector="panel"></div>' +
    '  </div>' +
    '</div>');
  let viewList = viewBody.find('[data-selector="main"]');
  let viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
  viewList.setView(c_articleList({
    delay: true
  }));
  viewBody.addView(viewList);
  viewBody.addView(viewPannelList);

  let viewFoot = c_footer({
    getData: function() {
      return m_config.getConfig()
    }
  });
  page.setView({
    start: function(hasRender){
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
