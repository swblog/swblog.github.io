const m_util = require('common/util/index');
const m_search = require('helper/search');
const swPostMessage = require('helper/sw_post_message.js');
let catalogList = []; //目录列表
let catalogDict = {};
let articleList = []; //文件列表
let articleDict = {};
let sidebarList = []; //sidebar文件列表(sidebar文件也可以在articleDict中索引到)
let bookList = [];    //书籍列表
let bookDict = {};
let tagList = [];
let startTime = Date.now();
let isPreload = false;
const sidebarName = '$sidebar$';
const getSidebarPath = (path)=> path+'/'+sidebarName+'.md';

BCD.addEvent('mkview', function(ele, option, data) {
  let name = m_util.getRandomName();
  let result;
  if ('idx' in option) {
    let item = data.list[option.idx];
    result = item.summary;
    if(result.length < item.content.length) {
      result += '...';
    }
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

const getPath = (pathWithSearch) => decodeURIComponent(pathWithSearch.replace(location.origin+'/', '').replace(/\?[^?]+/, ''));


const getSortContent = (content, paragraph=10) => {
  let len = 500;
  let minLen = len/2;
  let ret = content.substring(0, len);
  let partCount = 0;
  let partIndex = 0;
  ret.replace(/([^\n]*)(\n|<br>|<\/p>)/g,function($0, $1, $2, idx){
    partCount++;
    if(partCount>	paragraph && $1.length>10 && partIndex===0){
      partIndex = idx;
    }
    if(partCount==15 && partIndex===0){
      partIndex = idx;
    }
  });
  if(partIndex>0){
    ret = ret.substring(0, partIndex);
    if (ret.length < len*0.7){
      return ret;
    }
  }
  let getContent = (str, reg) => {
    let arr = str.split(reg).filter(o => !!o);
    let count = 0;
    if (arr && arr.length > 2) {
      let idx = arr.length - 1;
      if(arr.some((o, i) => {
        count += o.length;
        if (count > minLen && i > 1) {
          idx = i;
          return true;
        }
      })){
        return str.substr(0, str.lastIndexOf(arr[idx])).replace(/[#\s]+$/, '');
      }
      return str;
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
  return ret;
}


const preload = (obj) => {
  for (var pathWithSearch in obj) {
    var path = getPath(pathWithSearch);
    let item;
    if (item = articleDict[path]) {
      item.content = obj[pathWithSearch];
      item.tfList = m_search.getKeyWords(item.content);
      item.summary = getSortContent(obj[pathWithSearch]);
    }
  }
  let totalList = sidebarList.concat(articleList);
  let existDict = {};
  totalList.forEach(o=>{
    existDict[location.origin + '/' + o.path] = 1;
  });

  swPostMessage({
    m: 'delete_not_exist_article',
    dict: existDict
  });
  if(isPreload){
    console.log('文章同步成功！可以离线使用');
    return false;
  }else{
    isPreload = true;
    console.log('本地文章加载成功');
  }
  return true;
};

const init = (list) => {
  catalogList = []; //目录列表
  articleList = []; //文件列表
  sidebarList = [];
  bookList = [];
  let tagSet = new Set();
  let processArticle = (o) => {
    let {
      path = '', mtime
    } = o;
    if (o.isDirectory) {
      let tags = path.split('/').slice(1);
      tags.forEach(o => tagSet.add(o));
      let item = {
        path,
        time: m_util.getTime(mtime),
        href: '#!/' + encodeURIComponent(o.path),
        title: path.slice(path.lastIndexOf('/') + 1),
        tagList: tags
      };
      catalogList.push(item);
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
      if(articleDict[path]){
        $.extend(articleDict[path], item);
      }else{
        articleDict[path] = item;
      }
      articleList.push(item);
    }
  };
  list.forEach(processArticle);
  articleList = articleList.filter(o=>{
    if(o.title==sidebarName){
      sidebarList.push(o);
      return false;
    }
    return true;
  });
  catalogList = catalogList.filter(o=>{
    if(articleDict[getSidebarPath(o.path)]){
      bookDict[o.path] = o;
      bookList.push(o);
      return false;
    }
    catalogDict[o.path] = o;
    return true;
  });
  articleList = articleList.sort((a, b) => {
    return b.mtime - a.mtime;
  });
  tagList = [...tagSet];
};

let processCount = 0;
//先用缓存，请求回来再更新
const initArticle = new Promise((resolve)=>{
  BCD.ajaxCache('./json/article.json', (data) => {
    init(data);
    processCount++;
    if(processCount===2){ //如果网络请求失败，这里不会被执行
      let totalList = sidebarList.concat(articleList);
      swPostMessage({
        m: 'preloadAtricle',
        list: totalList.map(getURL)
      }, preload);
    }
    resolve();
    return 1; //缓存数据到localStorage
  }, 0, 1E3, true);
});

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
      item.tfList = m_search.getKeyWords(str);
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
      list: list.map(o => articleDict[o.path]).filter(o => !!(o && o.content))
    };
  });
};

const getChildCatalog = (path) => {
  let catalog = catalogDict[path];
  if (catalog) {
    let tagList = catalog.tagList;
    let tagLength = tagList.length + 1;
    return bookList.concat(catalogList).filter(o => o.tagList.length &&
      tagList.every((tag, i) => o.tagList.length==tagLength && tag == o.tagList[i]));
  }
  return [];
};

const getCatalogArticles = (path) => {
  let catalog = catalogDict[path];
  if (catalog) {
    let tagList = catalog.tagList;
    return articleList.filter(o => o.tagList.length &&
      tagList.every((tag, i) => tag == o.tagList[i])).sort((a, b)=>a.tagList.length - b.tagList.length);
  }
  return [];
};

const testItem = (reg, item) => {
  let testType = 0;
  let obj = {};
  let searchWeight = 0;
  let weightDict = {};
  if (reg.test(item.title)) {
    obj.title = item.title.replace(reg, function($0) {
      if(!weightDict[$0]){
        weightDict[$0] = 2;
      }
      return '<span class="text-danger">' + $0 + '</span>';
    });
    testType += 1;
  }
  if (item.content && reg.test(item.content)) {
    let pointList = [];
    obj.content = item.content.replace(reg, function($0, point) {
      if(!weightDict[$0]){
        weightDict[$0] = 1;
      }else if(weightDict[$0]==2){
        weightDict[$0]++;
      }
      let weight = /\w/.test($0) ? 2 : $0.length;
      pointList.push({
        point,
        weight
      });
      return '<span class="text-danger">' + $0 + '</span>';
    });
    pointList = pointList.sort((a, b) =>b.weight - a.weight);
    let start = pointList[0].point - 20;
    let summary = item.content.substr(start < 0 ? 0 : start);
    start = summary.search(/[。\n\r]/);
    if (start < 20) {
      summary = getSortContent(summary.substr(start).replace(/^[。\s]*/, ''), 5);
    } else {
      summary = getSortContent(summary.substr(10).replace(/^[。\s]*/, ''), 5);
    }
    obj.summary = summary.replace(reg, function($0) {
      return '<span class="text-danger">' + $0 + '</span>';
    });
    testType += 2;
  }
  obj.testType = testType;
  for(var key in weightDict){
    searchWeight += /\w/.test(key) ? weightDict[key] : key.length * weightDict[key];
  }
  obj.searchWeight = searchWeight;
  return Object.assign({}, item, obj);
};


const searchList = (word, callback, isCommend=false) => {
  let reg = m_search.getGlobalRegex(word);
  let fitList = [];
  let remainList = [];
  let ajaxList = [];
  let totalList = articleList.filter(o=>o);

  const searchCallback = (list) => callback({
    totalNum: totalList.length,
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
  totalList.forEach(o => {
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
  if(isCommend){
    return callback(ajaxList.concat(fitList).filter(o => o.testType > 0).sort((a,b)=>b.searchWeight-a.searchWeight));
  }
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
  getName,
  isPreload,
  startTime,
  initArticle,
  catalogDict,
  articleDict,
  hasCatalog: (path) => !!catalogDict[path],
  hasArticle: (path) => !!articleDict[path],
  hasBook: (path) => !!bookDict[path],
  getCatalogMessage: (path)=> catalogDict[path],
  getCatalogs: () => catalogList,
  getBooks: () => bookList,
  getTagArticles,
  getTags: () => tagList,
  getSidebarPath,
  getArticleList: () => articleList.map(o=>articleDict[o.path]),
  getListByCatalog: getList(getCatalogArticles),
  getChildCatalog,
  getListByTag: getList(getTagArticles),
  getArticleContent: (path) => fetchContent([articleDict[path]])
    .then(() => articleDict[path]),
  searchDirect,
  searchList
};
