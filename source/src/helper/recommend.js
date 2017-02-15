const m_article = require('model/article');
const m_search = require('helper/search');
const m_readHistory = require('model/read_history');

const filter = (list) => {
  let arr = [];
  let itemSet = new Set(list);
  let uniqList = [...itemSet];
  let currentPath = decodeURIComponent(location.hash.replace('#!/', ''));
  uniqList.some(function (o) {
    if (!m_readHistory.hasRead(o.path) && o.path != currentPath) {
      arr.push(o);
      if (arr.length > 10) {
        return true;
      }
    }
  });
  return arr;
};

const getCorrelation = (a_tfList) => {
  let tfDict = {};
  a_tfList.forEach(o => {
    tfDict[o.token] = o.frequency;
  });
  return (b_tfList) => {
    let total = b_tfList.reduce((sum, item) => sum += item.frequency, 0);
    return b_tfList.reduce((weight, item) => {
      weight += (tfDict[item.token] || 0) * item.frequency / total;
      return weight;
    }, 0);
  };
};

const getSimilarArticles = (a_tfList) => {
  let list = m_article.getArticleList().filter(o => o.tfList && o.tfList.length);
  let calModel = getCorrelation(a_tfList);
  let weightList = list.map(o => {
    return {
      article: o,
      weight: calModel(o.tfList)
    }
  }).sort((a, b) => b.weight - a.weight);
  console.table(weightList.slice(0, 20).map(o => {
    return {
      title: o.article.title,
      weight: o.weight
    }
  }));
  return weightList.map(o => o.article);
}

const getMutiSamples = () => {
  let tagDict = {};
  let retList = [];
  let originList = m_article.getArticleList();
  let list = originList.filter(o => !m_readHistory.hasRead(o.path));
  if (list.some(o => {
      let tagList = o.tagList || [];
      let tagName = tagList[tagList.length - 1];
      if (tagDict[tagName]) {
        tagDict[tagName].push(o);
      } else {
        tagDict[tagName] = [];
        retList.push(o);
      }
      if (retList.length == 10) {
        return true;
      }
    })) {
    return retList;
  } else {
    let tagList = Object.keys(tagDict);
    for (var i = 0; i < 10; i++) {
      for (var j = 0; j < tagList.length; j++) {
        let item;
        let tagName = tagList[j];
        if (item = tagDict[tagName][i]) {
          retList.push(item);
          if (retList.length == 10) {
            return retList;
          }
        }
      }
    }
  }
  return retList.concat(originList.slice(0, 10-retList.length));
}

const getRecommend = (callback) => {
  let key = decodeURIComponent(BCD.getHash(0));
  let articleList = getMutiSamples();
  let delayTime = 2E3 - (Date.now() - m_article.startTime);
  delayTime = m_article.isPreload ? 0 : (delayTime < 0 ? 0 : delayTime);

  switch (true) {
  case key == 'tag':
    let word = decodeURIComponent(BCD.getHash(1));
    setTimeout(function () {
      m_article.searchList(word, (list) => {
        callback(filter(list.concat(articleList)));
      }, true);
    }, delayTime);
    break;
  case m_article.hasArticle(key):
    setTimeout(function () {
      m_article.getArticleContent(key).then((data) => {
        let tagList = data.tagList;
        let keyWords = (data.tfList || []).slice(0, 10).map(o => o.token);
        console.log('本文关键词为：', keyWords.join(','));
        callback(filter(getSimilarArticles(data.tfList).concat(articleList)));
      });
    }, delayTime);
    break;
  case m_article.hasCatalog(key):
    setTimeout(function () {
      m_article.getListByCatalog(key, 0, 999).then((data) => {
        //在目录列表中已经有当前目录文章的展示了，在这里优先展示搜索到的内容
        let catalog = m_article.getCatalogMessage(key);
        let alist = data.list || [];
        m_article.searchList(catalog.tagList.join(' '), (list) => {
          callback(filter(list.concat(alist.concat(articleList))));
        }, true);
      });
    }, delayTime);
    break;

  default:
    callback(articleList);
    break;

  }



};
module.exports = {
  getRecommend
};
