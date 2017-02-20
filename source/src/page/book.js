const s_mainContainer = require('card/common/slidebar_container');
const m_article = require('model/article');
const m_readHistory = require('model/read_history');
const c_articleList = require('card/blog/article_list');



module.exports = function (page, key) {
  page.html(s_mainContainer);
  let viewContent = page.find('[data-selector="main"]');
  let viewSlidebar = page.find('[data-selector="slidebar"]');
  let slidebar;
  let currentHash;
  viewSlidebar.setView({
    name: 'blog/slidebar',
    template: '<div data-on="?m=mkview"></div>'
  });

  viewContent.setView({
    name: 'blog/blog',
    template: '<div data-on="?m=mkview"></div>'
  });


  page.setView({
    title: m_article.getName(key),
    start: function () {
      if (currentHash !== location.hash) {
        viewContent.empty();
        currentHash = location.hash;
      }
      this.show();
      m_article.getArticleContent(m_article.getSidebarPath(key)).then((data) => {
        let baseHash = '#!/' + BCD.getHash(0);
        if (!slidebar) {
          slidebar = $.extend({}, data);
          let content = slidebar.content || '';
          let chapters = slidebar.chapters = [];

          slidebar.content = content.replace(/<%(([^>]|[^%]>)+)%>/g, function ($0, $1) {
            let item = {};
            let fileName = '';
            if ($1.indexOf(']')>0) { //这种格式：[描述](相对与当前目录的地址)
              let arr = $1.substr(1, $1.length - 2).split(/\]\s*\(/);
              item.title = arr[0] || '';
              item.href  = baseHash + '/' + (arr[1] || '');
              fileName = arr[1];
            } else {
              item.title = $1;
              item.href = baseHash + '/' + $1 + '.md';
              fileName = $1 + '.md';
            }
            item.path = key+'/'+fileName;
            if(m_article.hasArticle(item.path)){
              chapters.push(item);
            }
            return '<a data-on="?m=replaceHash" data-url="' + item.href + '">' + item.title + '</a>'+
            '<span data-path="'+item.path+'" class="icon glyphicon glyphicon-ok" aria-hidden="true" '+
            'style="'+(m_readHistory.hasRead(item.path) ? '' : 'display:none')+'"></span>';
          });
          viewSlidebar.reset(slidebar);
          setTimeout(function () {
            viewSlidebar.bindEvent();
          });
        }
        let fileName = key + location.hash.replace(baseHash, '');
        if (m_article.hasArticle(fileName)) {
          m_article.getArticleContent(fileName).then((data) => {
            m_readHistory.addHistory(fileName);
            $(viewSlidebar.find('li.active')).removeClass('active');
            let currentDom = $('.slidebar [data-path="'+fileName+'"]');
            currentDom.parent('li').addClass('active');
            currentDom.show();
            viewContent.reset(data);
          });
        } else if (slidebar.chapters[0]) {
          return BCD.replaceHash(slidebar.chapters[0].href);
        } else {
          viewContent.reset({
            content: '敬请期待',
            title: fileName
          });
        }
      });
    }
  })
};
