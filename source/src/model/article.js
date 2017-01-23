const m_util = require('common/util/index');
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
  if('idx' in option){
    result = data.list[option.idx].summary;
  }else{
    result = data.content;
  }

  ele.attr('id', name);
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
    sequenceDiagram: true, // 默认不解析
  });
});

const getName = (path) => {
  let arr = path.match(/([^/.]+)[.\w]+$/);
  return arr ? arr[1] : '';
}


const getSortContent = (content) => {
  let ret = content.substring(0, 500);
  let getContent = (str, reg) => {
    let arr = str.split(reg).filter(o => !!o);
    let count = 0;
    if (arr && arr.length > 2) {
      let idx = arr.length - 1;
      arr.some((o, i) => {
        count += o.length;
        if (count > 250 && i > 1) {
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
        href:'#!/'+encodeURIComponent(o.path),
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
        href:'#!/'+encodeURIComponent(o.path),
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
};


const getTagArticles = (tag) => {
  if (tag) {
    return articleList.filter(o => o.tagList &&
      o.tagList.indexOf(tag) > -1);
  }
  return articleList;
};

const fetchContent = (list)=>{
  let ajaxList = list.filter(o => articleDict[o.path] && !articleDict[o.path].content).map(o => $.ajax({
    url: o.path,
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


const getList = (method)=>(tag, page = 0, count = 10) => {
  page = parseInt(page||0);
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
  if(catalog){
    return articleList.filter(o => o.tagList.length &&
      o.tagList.every((tag, i)=>tag==tagList[i]));
  }
  return [];
};

const getLastPost = () => {
  getTagArticles(tag).slice(start, start + count);
};

module.exports = {
  init,
  catalogDict,
  articleDict,
  getCatalog: (path) =>  catalogDict[path],
  getArticle: (path) =>  articleDict[path],
  getCatalogs: () => catalogList,
  getTagArticles,
  getTags: () => tagList,
  getLastPost: () => articleList.slice(0, 5),
  getListByCatalog: getList(getCatalogArticles),
  getListByTag: getList(getTagArticles),
  getArticleContent: (path) => fetchContent([articleDict[path]])
  .then(()=>articleDict[path])
};
