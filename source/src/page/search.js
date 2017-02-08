const c_footer = require('card/common/footer');
const c_mainContainer = require('card/common/main_container');
const m_initOption = require('helper/init_option');
const c_pannelList = require('card/blog/pannel_list');
const m_pullArticle = require('card/blog/pull_article');

module.exports = function(page, key) {
  let viewBody = c_mainContainer();
  let viewList = viewBody.find('[data-selector="main"]');
  let viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
  viewList.setView({
    viewList: [m_pullArticle.container]
  });

  viewBody.addView(viewList);
  viewBody.addView(viewPannelList);

  let viewFoot = c_footer();
  let oldWord = '';
  page.setView({
    start: function(hasRender){
    let word = decodeURIComponent(BCD.getHash(1));
      if(hasRender && oldWord==word){
        return m_initOption.noRender(true);
      }
      m_pullArticle.init(word);
    },
    title: '搜索结果',
    viewList: [viewBody, viewFoot]
  })
};
