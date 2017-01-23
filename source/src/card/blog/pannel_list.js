const m_article = require('model/article');
const c_pannel = require('card/blog/pannel');
module.exports = (view) => {
  let viewPannelLastPost = c_pannel({
    data: {
      title: '最新文章',
      list: m_article.getLastPost().map(o => {
        return {
          href: o.href,
          title: o.title,
          time: o.time
        }
      })
    }
  });
  let viewPannelCatalog = c_pannel({
    data: {
      title: '分类',
      list: m_article.getCatalogs().filter(o => o.tagList.length === 1).map(o => {
        return {
          title: o.catalog,
          href: o.href
        }
      })
    }
  });
  let viewPannelTag = c_pannel({
    data: {
      isInline: true,
      title: '标签',
      list: m_article.getTags()
    }
  });

  return view.setView({
    viewList: [viewPannelLastPost, viewPannelCatalog, viewPannelTag]
  });
}
