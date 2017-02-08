const m_util = require('common/util/index');
const m_search = require('helper/search');
const swPostMessage = require('helper/sw_post_message.js');
let pathList = []; //路径列表
let catalogList = []; //目录列表
let articleList = []; //文件列表
let originList = []; //原始文件结构列表
let tagList = [];
let articleDict = {};
let catalogDict = {};

BCD.addEvent('mkview', function(ele, option, data) {
  let name = m_util.getRandomName();
  let result;
  if ('idx' in option) {
    result = data.list[option.idx].summary;
  } else {
    result = data.content;
  }

  ele.attr('id', name);
  setTimeout(function() { //dom元素展示出来之后再绑定，不然流程图等会有样式问题
    editormd.markdownToHTML(name, {
      markdown: result, //+ "\r\n" + $("#append-test").text(),
      // htmlDecode: true, // 开启 HTML 标签解析，为了安全性，默认不开启
      htmlDecode: "style,script,iframe", // you can filter tags decode
      //toc             : false,
      tocm: true, // Using [TOCM]
      //tocContainer    : "#custom-toc-container", // 自定义 ToC 容器层
      //gfm             : false,
      //tocDropdown     : true,
      // markdownSourceCode : true, // 是否保留 Markdown 源码，即是否删除保存源码的 Textarea 标签
      emoji: true,
      taskList: true,
      tex: true, // 默认不解析
      flowChart: true, // 默认不解析
      sequenceDiagram: true // 默认不解析
    });
    if (result.indexOf('[TOC]') > -1 && location.hash.indexOf('.md') > 0) { //兼容TOC目录
      let baseHash = location.hash.replace(/\.md\/.*/, '.md');
      $('#' + name).html($('#' + name).html()
        .replace(/href="#([^"]*)/g, function($0, $1) {
          if ($1) {
            return 'href="' + baseHash + '/' + $1;
          }
          return $0
        }).replace(/name="([^"]*)/g, function($0, $1) {
          if ($1) {
            return 'name="' + baseHash.substr(1) + '/' + $1;
          }
          return $0
        }));
    }
  }, 0);
});

const getName = (path) => {
  let arr = path.match(/([^/.]+)[.\w]+$/);
  return arr ? arr[1] : '';
}

const getURL = (o) => o.path + '?mtime=' + o.mtime;

const getPath = (pathWithSearch) => pathWithSearch.replace(/\?[^?]+/, '');


const getSortContent = (content, len=500) => {
  let minLen = len/2;
  let ret = content.substring(0, len);
  let getContent = (str, reg) => {
    let arr = str.split(reg).filter(o => !!o);
    let count = 0;
    if (arr && arr.length > 2) {
      let idx = arr.length - 1;
      arr.some((o, i) => {
        count += o.length;
        if (count > minLen && i > 1) {
          idx = i;
          return true;
        }
      });
      return str.substr(0, str.lastIndexOf(arr[idx])).replace(/[#\s]+$/, '') + '...';
    }
  }
  let con = getContent(ret, /\s*#+\s*/);
  if (con) {
    return con;
  }
  con = getContent(ret, /\s+/);
  if (con) {
    return con;
  }
  return content.length > 300 ? ret + '...' : content;
}

const preload = (obj) => {
  for (var pathWithSearch in obj) {
    var path = getPath(pathWithSearch);
    if (articleDict[path]) {
      articleDict[path].content = obj[pathWithSearch];
      articleDict[path].summary = getSortContent(obj[pathWithSearch]);
    }
  }
  console.log('articleDict', articleDict);
};

const init = (list) => {
  originList = list;
  catalogList = []; //目录列表
  articleList = []; //文件列表
  let tagSet = new Set();
  let processArticle = (o) => {
    let {
      path = '', mtime
    } = o;
    if (o.child) {
      let tags = path.split('/').slice(1);
      tags.forEach(o => tagSet.add(o));
      let item = {
        path,
        href: '#!/' + encodeURIComponent(o.path),
        catalog: path.slice(path.lastIndexOf('/') + 1),
        tagList: tags
      };
      catalogDict[path] = item;
      catalogList.push(item);
      o.child.forEach(processArticle);
    } else {
      let tags = path.split('/').slice(1, -1);
      tags.forEach(o => tagSet.add(o));
      let item = {
        path,
        mtime,
        href: '#!/' + encodeURIComponent(o.path),
        title: getName(path),
        time: m_util.getTime(mtime),
        tagList: tags
      };
      articleDict[path] = item;
      articleList.push(item);
    }
  };
  list.forEach(processArticle);
  articleList = articleList.sort((a, b) => {
    return b.mtime - a.mtime;
  });
  tagList = [...tagSet];
  // swPostMessage({
  //   m: 'preload',
  //   list: articleList.map(getURL)
  // }, preload);
};

//获取包含相关tag文章列表
const getTagArticles = (tag) => {
  if (tag) {
    return articleList.filter(o => o.tagList &&
      o.tagList.indexOf(tag) > -1);
  }
  return articleList;
};

const fetchContent = (list) => {
  let ajaxList = list.filter(o => articleDict[o.path] && !articleDict[o.path].content).map(o => $.ajax({
    url: getURL(o),
    success(str) {
      let item = Object.assign({}, o);
      item.content = str;
      item.summary = getSortContent(str);
      articleDict[o.path] = item;
    }
  }));
  return new Promise(function(resolve) {
    $.when.apply(this, ajaxList).then(resolve, resolve);
  });
};


const getList = (method) => (tag, page = 0, count = 10) => {
  page = parseInt(page || 0);
  let start = page * count;
  let totalList = method(tag);
  let list = totalList.slice(start, start + count);
  return fetchContent(list).then(() => {
    return {
      tag,
      page,
      count,
      num: totalList.length,
      list: list.map(o => articleDict[o.path]).filter(o => !!o)
    };
  });
};

const getCatalogArticles = (path) => {
  let catalog = catalogDict[path];
  let tagList = catalog.tagList;
  if (catalog) {
    return articleList.filter(o => o.tagList.length &&
      tagList.every((tag, i) => tag == o.tagList[i]));
  }
  return [];
};

const testItem = (reg, item) => {
  let testType = 0;
  let obj = {};
  let searchWeight = 0;
  if (reg.test(item.title)) {
    obj.title = item.title.replace(reg, function($0) {
      let weight = /\w/.test($0) ? 2 : $0.length;
      searchWeight += weight * 3;
      return '<span class="text-danger">' + $0 + '</span>';
    });
    testType += 1;
  }
  if (item.content && reg.test(item.content)) {
    let pointList = [];
    obj.content = item.content.replace(reg, function($0, point) {
      let weight = /\w/.test($0) ? 2 : $0.length;
      searchWeight += weight;
      pointList.push({
        point,
        weight
      });
      return '<span class="text-danger">' + $0 + '</span>';
    });
    pointList = pointList.sort((a, b) =>b.weight - a.weight);
    let start = pointList[0].point - 20;
    let summary = item.content.substr(start < 0 ? 0 : start);
    start = summary.search(/[。\s]/);
    if (start < 20) {
      summary = getSortContent(summary.substr(start).replace(/^[。\s]*/, ''), 100);
    } else {
      summary = getSortContent(summary.substr(10).replace(/^[。\s]*/, ''), 100);
    }
    obj.summary = summary.replace(reg, function($0) {
      return '<span class="text-danger">' + $0 + '</span>';
    });
    testType += 2;
  }
  obj.testType = testType;
  obj.searchWeight = searchWeight;
  return Object.assign({}, item, obj);
};


const searchList = (word, callback) => {
  let reg = m_search.getGlobalRegex(word);
  let fitList = [];
  let remainList = [];
  let ajaxList = [];

  const searchCallback = (list) => callback({
    totalNum: articleList.length,
    checkNum: list.length,
    searchWord: word,
    list: list.filter(o => o.testType > 0).sort((a,b)=>b.searchWeight-a.searchWeight)
  });
  const batchProcess = (list, next) => {
    let subList = list.splice(0, 10);
    fetchContent(subList).then(() => {
      searchCallback(subList.map(o => testItem(reg, articleDict[o.path])));
      if (list.length) {
        batchProcess(list, next);
      } else if (next) {
        next();
      }
    })
  };
  articleList.forEach(o => {
    let item = articleDict[o.path];
    if (item) {
      let testObj = testItem(reg, item);
      if (item.content) {
        fitList.push(testObj);
      } else if (testObj.testType > 0) {
        ajaxList.push(item);
      } else {
        remainList.push(o);
      }
    }
  });

  searchCallback(fitList);
  batchProcess(ajaxList, function() {
    batchProcess(remainList);
  })
  return remainList;
};



//搜索直达
const searchDirect = (word) => {
  let reg = m_search.getGlobalRegex(word);
  return articleList.filter(o => reg.test(o.title)).map(o => {
    return {
      href: o.href,
      title: o.title.replace(reg, function($0) {
        return '<span class="text-danger">' + $0 + '</span>';
      })
    };
  })
};


module.exports = {
  init,
  catalogDict,
  articleDict,
  getCatalog: (path) => catalogDict[path],
  getArticle: (path) => articleDict[path],
  getCatalogs: () => catalogList,
  getTagArticles,
  getTags: () => tagList,
  getLastPost: () => articleList.slice(0, 5),
  getListByCatalog: getList(getCatalogArticles),
  getListByTag: getList(getTagArticles),
  getArticleContent: (path) => fetchContent([articleDict[path]])
    .then(() => articleDict[path]),
  searchDirect,
  searchList
};
