const c_footer = require('card/common/footer');
const m_article = require('model/article');
const m_config = require('model/config');
const c_pannelList = require('card/blog/pannel_list');
const c_content = require('card/blog/content');
const m_initOption = require('helper/init_option');



module.exports = function(page, key) {
  let viewBody = $('<div class="container">' +
    '  <div class="row">' +
    '    <div class="col-md-8" data-selector="main"></div>' +
    '    <div class="col-md-4" data-selector="panel"></div>' +
    '  </div>' +
    '</div>');
  let viewContent = viewBody.find('[data-selector="main"]');
  let viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
  viewContent.setView(c_content({
    delay: true
  }));
  viewBody.addView(viewContent);
  viewBody.addView(viewPannelList);

  let viewFoot = c_footer({
    getData: function() {
      return m_config.getConfig()
    }
  });
  page.setView({
    start: function(hasRender){
      if(m_article.getArticle(key)){
        m_article.getArticleContent(key).then((data)=>{
          viewContent.reset(data);
        });
      }
      return m_initOption.notRender(hasRender);
    },
    title: '文章列表',
    viewList: [viewBody, viewFoot]
  })
};
