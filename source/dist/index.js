/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * @file index 入口文件，路由定义
	 * @author ljquan@qq.com
	 */
	
	__webpack_require__(1);
	var m_article = __webpack_require__(4);
	var m_config = __webpack_require__(7);
	var c_header = __webpack_require__(8);
	var c_pageList = __webpack_require__(9);
	var c_pageContent = __webpack_require__(16);
	var c_pageBlog = __webpack_require__(18);
	var c_pageSearch = __webpack_require__(19);
	var viewHeader = c_header();
	$('body').append(viewHeader);
	
	m_config.getConfig(function () {
	  BCD.ajaxCache('./json/article.json', function (data) {
	    m_article.init(data);
	    //入口
	    BCD.app({
	      setTitle: function setTitle(str) {
	        viewHeader.reset();
	        document.title = str;
	      },
	      initPage: function initPage(key, next) {
	
	        var page = this;
	        if (key == 'index') {
	          c_pageList(page, key);
	          next();
	        } else if (key == 'tag') {
	          c_pageList(page, key);
	          next();
	        } else if (key == 'blog') {
	          c_pageBlog(page);
	          next();
	        } else if (key == 'search') {
	          c_pageSearch(page, key);
	          next();
	        } else {
	          var path = decodeURIComponent(key);
	          if (m_article.getCatalog(path)) {
	            c_pageList(page, path);
	            return next();
	          } else if (m_article.getArticle(path)) {
	            c_pageContent(page, path);
	            return next();
	          }
	
	          BCD.replaceHash(m_config.getIndex());
	          next(-1);
	        }
	      }
	    });
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_util = __webpack_require__(2);
	//data-on="?m=go" data-url="<%=o.href%>"
	var go = function go(ele, option, data) {
	  ele.on('click', function (e) {
	    BCD.go(ele.data('url'));
	    m_util.stopBubble(e);
	  });
	};
	BCD.addEvent('go', go);
	//data-on="?m=back"
	var back = function back(ele, option, data) {
	  ele.on('click', function (e) {
	    history.back();
	    m_util.stopBubble(e);
	  });
	};
	BCD.addEvent('back', back);
	
	var replaceHash = function replaceHash(ele, option, data) {
	  ele.on('click', function (e) {
	    BCD.replaceHash(ele.data('url'));
	    m_util.stopBubble(e);
	  });
	};
	BCD.addEvent('replaceHash', go);
	//事件绑定
	module.exports = {
	  go: go,
	  back: back,
	  replaceHash: replaceHash
	};

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_event = __webpack_require__(3);
	var getTime = function getTime(date) {
	  date = new Date(date);
	  var now = new Date();
	  var diff = now - date;
	  switch (true) {
	    case diff < 6E4:
	      return '刚刚';
	    case diff < 36E5:
	      return Math.round(diff / 6E4) + '分钟前';
	    case diff < 864E5:
	      return Math.round(diff / 36E5) + '小时前';
	    case diff < 1728E5 && now.getDate() - date.getDate() != 2:
	      return '昨天';
	    case date.getFullYear() === new Date().getFullYear():
	      return BCD.time.formatDate(date, "%M月%d日");
	    default:
	      return BCD.time.formatDate(date, "%y年%M月%d日");
	  }
	};
	
	var leftFillString = function leftFillString(num, length) {
	  return ("0000000000" + num).substr(-length);
	};
	var getRandomName = function getRandomName() {
	  return ("aaaaaaaaaa" + Math.random().toString(36).replace(/[.\d]/g, '')).substr(-10);
	};
	module.exports = {
	  getTime: getTime,
	  leftFillString: leftFillString,
	  getRandomName: getRandomName,
	  stopBubble: m_event.stopBubble,
	  stopBubbleEx: m_event.stopBubbleEx
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * @module {Object} event  事件相关的处理函数
	 * @return {object} 方法集合
	 * @property {function} stopBubble 停止冒泡并禁止默认事件
	 * @property {function} stopBubbleEx 停止冒泡
	 * @author ljquan@qq.com
	 */
	
	module.exports = {
	    /**
	     * 停止冒泡并禁止默认事件
	     * @param  {event} e 事件
	     * @return {null}
	     */
	    stopBubble: function stopBubble(e) {
	        if (e && e.stopPropagation) {
	            e.stopPropagation();
	        }
	        e.preventDefault();
	    },
	    /**
	     * 停止冒泡
	     * @param  {event} e 事件
	     * @return {null}
	     */
	    stopBubbleEx: function stopBubbleEx(e) {
	        if (e && e.stopPropagation) {
	            e.stopPropagation();
	        }
	    }
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var m_util = __webpack_require__(2);
	var m_search = __webpack_require__(5);
	var swPostMessage = __webpack_require__(6);
	var pathList = []; //路径列表
	var catalogList = []; //目录列表
	var articleList = []; //文件列表
	var originList = []; //原始文件结构列表
	var tagList = [];
	var articleDict = {};
	var catalogDict = {};
	
	BCD.addEvent('mkview', function (ele, option, data) {
	  var name = m_util.getRandomName();
	  var result = void 0;
	  if ('idx' in option) {
	    result = data.list[option.idx].summary;
	  } else {
	    result = data.content;
	  }
	
	  ele.attr('id', name);
	  setTimeout(function () {
	    //dom元素展示出来之后再绑定，不然流程图等会有样式问题
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
	    if (result.indexOf('[TOC]') > -1 && location.hash.indexOf('.md') > 0) {
	      (function () {
	        //兼容TOC目录
	        var baseHash = location.hash.replace(/\.md\/.*/, '.md');
	        $('#' + name).html($('#' + name).html().replace(/href="#([^"]*)/g, function ($0, $1) {
	          if ($1) {
	            return 'href="' + baseHash + '/' + $1;
	          }
	          return $0;
	        }).replace(/name="([^"]*)/g, function ($0, $1) {
	          if ($1) {
	            return 'name="' + baseHash.substr(1) + '/' + $1;
	          }
	          return $0;
	        }));
	      })();
	    }
	  }, 0);
	});
	
	var getName = function getName(path) {
	  var arr = path.match(/([^/.]+)[.\w]+$/);
	  return arr ? arr[1] : '';
	};
	
	var getURL = function getURL(o) {
	  return o.path + '?mtime=' + o.mtime;
	};
	
	var getPath = function getPath(pathWithSearch) {
	  return pathWithSearch.replace(/\?[^?]+/, '');
	};
	
	var getSortContent = function getSortContent(content) {
	  var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
	
	  var minLen = len / 2;
	  var ret = content.substring(0, len);
	  var getContent = function getContent(str, reg) {
	    var arr = str.split(reg).filter(function (o) {
	      return !!o;
	    });
	    var count = 0;
	    if (arr && arr.length > 2) {
	      var idx = arr.length - 1;
	      arr.some(function (o, i) {
	        count += o.length;
	        if (count > minLen && i > 1) {
	          idx = i;
	          return true;
	        }
	      });
	      return str.substr(0, str.lastIndexOf(arr[idx])).replace(/[#\s]+$/, '') + '...';
	    }
	  };
	  var con = getContent(ret, /\s*#+\s*/);
	  if (con) {
	    return con;
	  }
	  con = getContent(ret, /\s+/);
	  if (con) {
	    return con;
	  }
	  return content.length > 300 ? ret + '...' : content;
	};
	
	var preload = function preload(obj) {
	  for (var pathWithSearch in obj) {
	    var path = getPath(pathWithSearch);
	    if (articleDict[path]) {
	      articleDict[path].content = obj[pathWithSearch];
	      articleDict[path].summary = getSortContent(obj[pathWithSearch]);
	    }
	  }
	  console.log('articleDict', articleDict);
	};
	
	var init = function init(list) {
	  originList = list;
	  catalogList = []; //目录列表
	  articleList = []; //文件列表
	  var tagSet = new Set();
	  var processArticle = function processArticle(o) {
	    var _o$path = o.path,
	        path = _o$path === undefined ? '' : _o$path,
	        mtime = o.mtime;
	
	    if (o.child) {
	      var tags = path.split('/').slice(1);
	      tags.forEach(function (o) {
	        return tagSet.add(o);
	      });
	      var item = {
	        path: path,
	        href: '#!/' + encodeURIComponent(o.path),
	        catalog: path.slice(path.lastIndexOf('/') + 1),
	        tagList: tags
	      };
	      catalogDict[path] = item;
	      catalogList.push(item);
	      o.child.forEach(processArticle);
	    } else {
	      var _tags = path.split('/').slice(1, -1);
	      _tags.forEach(function (o) {
	        return tagSet.add(o);
	      });
	      var _item = {
	        path: path,
	        mtime: mtime,
	        href: '#!/' + encodeURIComponent(o.path),
	        title: getName(path),
	        time: m_util.getTime(mtime),
	        tagList: _tags
	      };
	      articleDict[path] = _item;
	      articleList.push(_item);
	    }
	  };
	  list.forEach(processArticle);
	  articleList = articleList.sort(function (a, b) {
	    return b.mtime - a.mtime;
	  });
	  tagList = [].concat(_toConsumableArray(tagSet));
	  // swPostMessage({
	  //   m: 'preload',
	  //   list: articleList.map(getURL)
	  // }, preload);
	};
	
	//获取包含相关tag文章列表
	var getTagArticles = function getTagArticles(tag) {
	  if (tag) {
	    return articleList.filter(function (o) {
	      return o.tagList && o.tagList.indexOf(tag) > -1;
	    });
	  }
	  return articleList;
	};
	
	var fetchContent = function fetchContent(list) {
	  var ajaxList = list.filter(function (o) {
	    return articleDict[o.path] && !articleDict[o.path].content;
	  }).map(function (o) {
	    return $.ajax({
	      url: getURL(o),
	      success: function success(str) {
	        var item = Object.assign({}, o);
	        item.content = str;
	        item.summary = getSortContent(str);
	        articleDict[o.path] = item;
	      }
	    });
	  });
	  return new Promise(function (resolve) {
	    $.when.apply(this, ajaxList).then(resolve, resolve);
	  });
	};
	
	var getList = function getList(method) {
	  return function (tag) {
	    var page = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
	    var count = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 10;
	
	    page = parseInt(page || 0);
	    var start = page * count;
	    var totalList = method(tag);
	    var list = totalList.slice(start, start + count);
	    return fetchContent(list).then(function () {
	      return {
	        tag: tag,
	        page: page,
	        count: count,
	        num: totalList.length,
	        list: list.map(function (o) {
	          return articleDict[o.path];
	        }).filter(function (o) {
	          return !!o;
	        })
	      };
	    });
	  };
	};
	
	var getCatalogArticles = function getCatalogArticles(path) {
	  var catalog = catalogDict[path];
	  var tagList = catalog.tagList;
	  if (catalog) {
	    return articleList.filter(function (o) {
	      return o.tagList.length && o.tagList.every(function (tag, i) {
	        return tag == tagList[i];
	      });
	    });
	  }
	  return [];
	};
	
	var testItem = function testItem(reg, item) {
	  var testType = 0;
	  var obj = {};
	  var searchWeight = 0;
	  if (reg.test(item.title)) {
	    obj.title = item.title.replace(reg, function ($0) {
	      var weight = /\w/.test($0) ? 2 : $0.length;
	      searchWeight += weight * 3;
	      return '<span class="text-danger">' + $0 + '</span>';
	    });
	    testType += 1;
	  }
	  if (item.content && reg.test(item.content)) {
	    (function () {
	      var pointList = [];
	      obj.content = item.content.replace(reg, function ($0, point) {
	        var weight = /\w/.test($0) ? 2 : $0.length;
	        searchWeight += weight;
	        pointList.push({
	          point: point,
	          weight: weight
	        });
	        return '<span class="text-danger">' + $0 + '</span>';
	      });
	      pointList = pointList.sort(function (a, b) {
	        return b.weight - a.weight;
	      });
	      var start = pointList[0].point - 20;
	      var summary = item.content.substr(start < 0 ? 0 : start);
	      start = summary.search(/[。\s]/);
	      if (start < 20) {
	        summary = getSortContent(summary.substr(start).replace(/^[。\s]*/, ''), 100);
	      } else {
	        summary = getSortContent(summary.substr(10).replace(/^[。\s]*/, ''), 100);
	      }
	      obj.summary = summary.replace(reg, function ($0) {
	        return '<span class="text-danger">' + $0 + '</span>';
	      });
	      testType += 2;
	    })();
	  }
	  obj.testType = testType;
	  obj.searchWeight = searchWeight;
	  return Object.assign({}, item, obj);
	};
	
	var searchList = function searchList(word, callback) {
	  var reg = m_search.getGlobalRegex(word);
	  var fitList = [];
	  var remainList = [];
	  var ajaxList = [];
	
	  var searchCallback = function searchCallback(list) {
	    return callback({
	      totalNum: articleList.length,
	      checkNum: list.length,
	      searchWord: word,
	      list: list.filter(function (o) {
	        return o.testType > 0;
	      }).sort(function (a, b) {
	        return b.searchWeight - a.searchWeight;
	      })
	    });
	  };
	  var batchProcess = function batchProcess(list, next) {
	    var subList = list.splice(0, 10);
	    fetchContent(subList).then(function () {
	      searchCallback(subList.map(function (o) {
	        return testItem(reg, articleDict[o.path]);
	      }));
	      if (list.length) {
	        batchProcess(list, next);
	      } else if (next) {
	        next();
	      }
	    });
	  };
	  articleList.forEach(function (o) {
	    var item = articleDict[o.path];
	    if (item) {
	      var testObj = testItem(reg, item);
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
	  batchProcess(ajaxList, function () {
	    batchProcess(remainList);
	  });
	  return remainList;
	};
	
	//搜索直达
	var searchDirect = function searchDirect(word) {
	  var reg = m_search.getGlobalRegex(word);
	  return articleList.filter(function (o) {
	    return reg.test(o.title);
	  }).map(function (o) {
	    return {
	      href: o.href,
	      title: o.title.replace(reg, function ($0) {
	        return '<span class="text-danger">' + $0 + '</span>';
	      })
	    };
	  });
	};
	
	module.exports = {
	  init: init,
	  catalogDict: catalogDict,
	  articleDict: articleDict,
	  getCatalog: function getCatalog(path) {
	    return catalogDict[path];
	  },
	  getArticle: function getArticle(path) {
	    return articleDict[path];
	  },
	  getCatalogs: function getCatalogs() {
	    return catalogList;
	  },
	  getTagArticles: getTagArticles,
	  getTags: function getTags() {
	    return tagList;
	  },
	  getLastPost: function getLastPost() {
	    return articleList.slice(0, 5);
	  },
	  getListByCatalog: getList(getCatalogArticles),
	  getListByTag: getList(getTagArticles),
	  getArticleContent: function getArticleContent(path) {
	    return fetchContent([articleDict[path]]).then(function () {
	      return articleDict[path];
	    });
	  },
	  searchDirect: searchDirect,
	  searchList: searchList
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';
	
	var createNGram = function createNGram(n) {
	  return function (str) {
	    var arr = [];
	    var end = str.length - n + 1;
	    for (var i = 0; i < end; i++) {
	      arr.push(str.substr(i, n));
	    }
	    return arr;
	  };
	};
	
	var gramDict = {
	  4: createNGram(4),
	  3: createNGram(3),
	  2: createNGram(2)
	};
	
	var getWordList = function getWordList(str) {
	  var wordList = [str];
	  var processStrict = function processStrict(str) {
	    return str.replace(/['‘’][^'‘’]*['‘’]|["”“][^"”“]*["”“]/g, function ($0) {
	      wordList.push($0.replace(/['‘’"”“]/g, ''));
	      return ' ';
	    });
	  };
	
	  var processChiese = function processChiese(str) {
	    return str.replace(/[\u4e00-\u9fff\uf900-\ufaff]+/g, function ($0) {
	      wordList.push($0);
	      for (var i = 4; i > 1; i--) {
	        if ($0.length > i) {
	          wordList.push.apply(wordList, gramDict[i]($0));
	        }
	      }
	      return ' ';
	    });
	  };
	
	  var processEnglish = function processEnglish(str) {
	    wordList.push.apply(wordList, str.split(/\s+/).filter(function (o) {
	      return !!o;
	    }));
	  };
	
	  processEnglish(processChiese(processStrict(str)));
	  return wordList;
	};
	
	module.exports = {
	  getWordList: getWordList,
	  getGlobalRegex: function getGlobalRegex(str) {
	    return new RegExp(getWordList(str).join('|'), 'ig');
	  }
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_util = __webpack_require__(2);
	
	var index = 0;
	var postMessage = function postMessage() {};
	var callbackDict = {};
	
	if (navigator.serviceWorker) {
	  navigator.serviceWorker.addEventListener('message', function (event) {
	    var _event$data = event.data,
	        cbid = _event$data.cbid,
	        resp = _event$data.resp;
	
	    if (cbid && callbackDict[cbid]) {
	      callbackDict[cbid](resp);
	      delete callbackDict[cbid];
	    }
	  }); //页面通过监听service worker的message事件接收service worker的信息
	  postMessage = function postMessage(req, callback) {
	    if (navigator.serviceWorker.controller && navigator.serviceWorker.controller.state == 'activated') {
	      index++;
	      var obj = { req: req };
	      if (callback) {
	        obj.cbid = m_util.getRandomName() + index;
	        callbackDict[obj.cbid] = callback;
	      }
	      navigator.serviceWorker.controller.postMessage(obj); //页面向service worker发送信息
	    }
	  };
	}
	
	module.exports = postMessage; //postMessage(message, callback)

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	
	var isInit = false;
	var callbackList = [];
	var arr = location.host.split(".");
	var isLocalhost = arr.length === 1;
	var username = isLocalhost ? "swblog" : arr[0];
	var config = {
	  "author": username,
	  "logoTitle": username + "的博客",
	  "nav": [["Home", "#!/index"], ["About", "#!/blog/about.md"]]
	};
	//先用缓存，请求回来再更新
	BCD.ajaxCache('./json/config.json', function (data) {
	  config = data || config;
	  config.logoTitle = config.logoTitle || username + "的博客";
	  isInit = true;
	  var cb = void 0;
	  while (cb = callbackList.pop()) {
	    cb(config);
	  }
	  if (config.author) {
	    return 1; //缓存数据到localStorage
	  }
	}, 0, 1E3, true);
	
	window.CONFIG = module.exports = {
	  username: username,
	  getIndex: function getIndex() {
	    return config.nav && config.nav[0] && config.nav[0][1] || "";
	  },
	  isLocalhost: isLocalhost,
	  getConfigSync: function getConfigSync() {
	    return config;
	  },
	  getConfig: function getConfig(callback) {
	    if (isInit) {
	      callback(config);
	    } else {
	      callbackList.push(callback);
	    }
	  }
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_util = __webpack_require__(2);
	var m_article = __webpack_require__(4);
	var m_config = __webpack_require__(7);
	
	BCD.addEvent('navigator_search', function (ele) {
	  ele.html('<div class="form-group open">' + '  <input type="text" class="form-control" placeholder="Search">' + '  <ul class="dropdown-menu" style="right:auto;display:none"></ul>' + '</div>' + '<button type="submit" class="btn btn-primary">Submit</button>');
	  var viewInput = ele.find('input');
	  var viewDrop = ele.find('ul').setView({
	    template: '<%(obj||[]).forEach(function(o){%>' + '<li><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a></li>' + '<%})%>'
	  });
	  var viewGroup = ele.find('.form-group');
	
	  var getWord = function getWord() {
	    return viewInput.val().trim();
	  };
	  var doSearch = function doSearch() {
	    var hash = '#!/search/' + encodeURIComponent(getWord());
	    if (BCD.getHash(0) == 'search') {
	      BCD.replaceHash(hash);
	    } else {
	      BCD.go(hash);
	    }
	  };
	  ele.find('button').on('click', function (e) {
	    m_util.stopBubble(e);
	    if (word) {
	      doSearch();
	    }
	  });
	  var selectLi = null;
	  var index = -1;
	  var oldWord = '';
	  viewInput.on('blur', function () {
	    viewDrop.hide();
	  });
	  ele.on('keypress input keyup', function (e) {
	    var word = getWord();
	    if (word) {
	      var lis = viewDrop.find('a');
	      if (e.keyCode == 13) {
	        if (selectLi) {
	          selectLi.trigger('click');
	        } else {
	          doSearch();
	        }
	      }
	      if (e.keyCode == 40) {
	        index++;
	        if (index >= lis.length) {
	          index = 0;
	        }
	      }
	      if (e.keyCode == 38) {
	        index--;
	        if (index <= -lis.length) {
	          index = 0;
	        }
	      }
	
	      if (word == oldWord) {
	        if (e.keyCode == 40 || e.keyCode == 38) {
	          lis.css('background-color', '');
	          selectLi = lis.eq(index);
	          selectLi.css('background-color', 'aliceblue');
	        }
	
	        return;
	      }
	      oldWord = word;
	      var list = m_article.searchDirect(word);
	      if (list.length) {
	        index = -1;
	        selectLi = null;
	        return viewDrop.reset(list);
	      }
	    }
	    viewDrop.hide();
	  });
	});
	
	//顶部导航
	module.exports = function (option) {
	  var viewHeader = $('<header class="navbar navbar-inverse navbar-fixed-top bs-docs-nav" role="banner"></header>');
	  option = $.extend({
	    name: 'common/header',
	    getData: function getData() {
	      return m_config.getConfigSync();
	    },
	    template: '  <div class="container">' + '    <div class="navbar-header">' + '      <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">' + '        <span class="sr-only">Toggle navigation</span>' + '        <span class="icon-bar"></span>' + '        <span class="icon-bar"></span>' + '        <span class="icon-bar"></span>' + '      </button>' + '      <a data-on="?m=go" data-url="<%=CONFIG.getIndex()%>" class="logo-link" style="padding: 12px;"><%-obj.logoTitle%></a>' + '    </div>' + '    <nav class="collapse navbar-collapse bs-navbar-collapse" role="navigation">' + '      <div class="navbar-form navbar-right" data-on="?m=navigator_search"></div>' + '      <ul class="nav navbar-nav"><%(obj.nav || []).forEach(function(o){%>' + '        <li class="<%=location.hash==o[1] ? "active" : ""%>"><a data-on="?m=replaceHash" data-url="<%=o[1]%>"><%-o[0]%></a></li>' + '        <%})%>' + '      </ul>' + '    </nav>' + '  </div>'
	  }, option);
	  return viewHeader.setView(option);
	};

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var c_footer = __webpack_require__(10);
	var c_mainContainer = __webpack_require__(11);
	var m_article = __webpack_require__(4);
	var m_initOption = __webpack_require__(12);
	var c_pannelList = __webpack_require__(13);
	var c_articleList = __webpack_require__(15);
	
	module.exports = function (page, key) {
	  var viewBody = c_mainContainer();
	  var viewList = viewBody.find('[data-selector="main"]');
	  var viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
	  viewList.setView(c_articleList({
	    delay: true
	  }));
	  viewBody.addView(viewList);
	  viewBody.addView(viewPannelList);
	
	  var viewFoot = c_footer();
	  page.setView({
	    start: function start(hasRender) {
	      viewList.empty();
	      var hrefHead = location.hash.replace(/\/\d*$/, '');
	      if (key == 'index') {
	        m_article.getListByTag(0, BCD.getHash(1)).then(function (data) {
	          data.title = "最新文章";
	          data.hrefHead = hrefHead;
	          viewList.reset(data);
	        });
	      } else if (key == 'tag') {
	        (function () {
	          var tag = BCD.getHash(1);
	          m_article.getListByTag(tag, BCD.getHash(2)).then(function (data) {
	            data.title = '"' + tag + '" 的最新文章';
	            data.hrefHead = hrefHead;
	            viewList.reset(data);
	          });
	        })();
	      } else if (m_article.getCatalog(key)) {
	        m_article.getListByCatalog(key, BCD.getHash(1)).then(function (data) {
	          data.title = '"' + data.tag.replace(/^[^/]+\//, '') + '" 的最新文章';
	          data.hrefHead = hrefHead;
	          viewList.reset(data);
	        });
	      }
	      return m_initOption.notRender(hasRender);
	    },
	    title: '文章列表',
	    viewList: [viewBody, viewFoot]
	  });
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	//页脚
	var m_config = __webpack_require__(7);
	module.exports = function (option) {
	  var viewHeader = $('<footer></footer>');
	  option = $.extend({
	    name: 'common/footer',
	    getData: function getData() {
	      return m_config.getConfigSync();
	    },
	    template: '<div class="container">' + '  <hr>' + '  <p class="text-center">Copyright <%-obj.author%> © <%=new Date().getFullYear()%>. All rights reserved.</p>' + '</div>'
	  }, option);
	  return viewHeader.setView(option);
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	module.exports = function () {
	  return $('<div class="container">' + '  <div class="row">' + '    <div class="col-sm-7 col-md-8 col-lg-9" data-selector="main"></div>' + '    <div class="col-sm-5 col-md-4 col-lg-3" data-selector="panel"></div>' + '  </div>' + '</div>');
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	'use strict';
	
	function anchorBack() {
	    if (history.state && history.state.scrollY) {
	        //支持锚点返回
	        if (BCD.history.getCode() == -1) {
	            scrollTo(0, history.state.scrollY);
	        }
	        BCD.extendState({ //保证刷新可回到头部
	            scrollY: 0
	        });
	    }
	}
	
	//带锚点返回，不reset子view
	function notRender(hasRender) {
	    if (hasRender) {
	        BCD.getPage().show();
	        anchorBack();
	        return 'show';
	    }
	}
	module.exports = {
	    notRender: notRender,
	    anchorBack: anchorBack
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_article = __webpack_require__(4);
	var c_pannel = __webpack_require__(14);
	module.exports = function (view) {
	  var viewPannelLastPost = c_pannel({
	    data: {
	      title: '最新文章',
	      list: m_article.getLastPost().map(function (o) {
	        return {
	          href: o.href,
	          title: o.title,
	          time: o.time
	        };
	      })
	    }
	  });
	  var viewPannelCatalog = c_pannel({
	    data: {
	      title: '分类',
	      list: m_article.getCatalogs().filter(function (o) {
	        return o.tagList.length === 1;
	      }).map(function (o) {
	        return {
	          title: o.catalog,
	          href: o.href
	        };
	      })
	    }
	  });
	  var viewPannelTag = c_pannel({
	    data: {
	      isInline: true,
	      title: '标签',
	      list: m_article.getTags()
	    }
	  });
	
	  return view.setView({
	    viewList: [viewPannelLastPost, viewPannelCatalog, viewPannelTag]
	  });
	};

/***/ },
/* 14 */
/***/ function(module, exports) {

	'use strict';
	
	//顶部导航
	module.exports = function (option) {
	  var view = $('<div class="panel panel-primary"></div>');
	  option = $.extend({
	    name: 'blog/panel',
	    template: '<div class="panel-heading">' + '  <h4><%-obj.title%></h4>' + '</div>' + '<div class="panel-body">' + '  <%if(obj.isInline){%>' + '    <ul class="list-inline">' + '     <%(obj.list || []).forEach(function(o){%>' + '      <li><a data-on="?m=go" data-url="#!/tag/<%=o%>"><%=o%></a></li>' + '     <%})%>' + '    </ul>' + '  <%}else{%>' + '    <ul class="list-group">' + '     <%(obj.list || []).forEach(function(o){%>' + '      <li class="list-group-item"><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a>' + '       <%=o.time ? "<span style=\\\"color: #a2a34f;\\\">("+o.time+")</span>" : ""%></li>' + '     <%})%>' + '    </ul>' + '    <%}%>' + '</div>'
	  }, option);
	  return view.setView(option);
	};

/***/ },
/* 15 */
/***/ function(module, exports) {

	'use strict';
	
	//文章列表
	module.exports = function (option) {
	  return $.extend({
	    name: 'blog/article_list',
	    template: '<h1><%=obj.title%></h1>' + '<%if(!(obj.list && obj.list.length)){%>' + '<br><hr><center><h3>暂无内容</h3></center>' + '<%}else{(obj.list || []).forEach(function(o, i){%><article>' + '  <h2><a data-on="?m=go" data-url="<%=o.href%>"><%-o.title%></a></h2>' + '  <div class="row">' + '    <div class="col-sm-6 col-md-6">' + '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-o.time%>' + '    </div>' + '  </div>' + '  <hr>' + '  <div data-on="?m=mkview&idx=<%=i%>" style="background-color: #ffffe8;">' + '  </div><br />' + '' + '  <p class="text-right">' + '    <a data-on="?m=go" data-url="<%=o.href%>">' + '      continue reading...' + '    </a>' + '  </p>' + '  <hr>' + '</article><%})%>' + '' + '<ul class="pager">' + '  <li class="previous"><a <%if(obj.page==0){%>style="opacity: 0.5;"<%}else{%>' + 'data-on="?m=go" data-url="<%=obj.hrefHead+"/"+(obj.page-1)%>"<%}%>>&larr; Previous</a></li>' + '  <li class="next"><a <%if(obj.page==Math.floor(obj.num/obj.count)){%>style="opacity: 0.5;"<%}else{%>' + 'data-on="?m=go" data-url="<%=obj.hrefHead+"/"+(obj.page+1)%>"<%}%>>Next &rarr;</a></li>' + '</ul><%}%>'
	  }, option);
	};

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var c_mainContainer = __webpack_require__(11);
	var c_footer = __webpack_require__(10);
	var m_article = __webpack_require__(4);
	var c_pannelList = __webpack_require__(13);
	var c_content = __webpack_require__(17);
	var m_initOption = __webpack_require__(12);
	
	module.exports = function (page, key) {
	  var viewBody = c_mainContainer();
	  var viewContent = viewBody.find('[data-selector="main"]');
	  var viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
	  viewContent.setView(c_content({
	    delay: true
	  }));
	  viewBody.addView(viewContent);
	  viewBody.addView(viewPannelList);
	
	  var viewFoot = c_footer();
	  page.setView({
	    start: function start(hasRender) {
	      if (hasRender) {
	        return m_initOption.notRender(hasRender);
	      }
	      if (m_article.getArticle(key)) {
	        m_article.getArticleContent(key).then(function (data) {
	          page.setView({ title: data.title });
	          document.title = data.title;
	          viewContent.reset(data);
	        });
	      }
	    },
	    viewList: [viewBody, viewFoot]
	  });
	};

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';
	
	//单个文章
	module.exports = function (option) {
	  return $.extend({
	    name: 'blog/content',
	    template: '<%var arr=location.host.split("."); var isLocalhost = arr.length===1; var username= isLocalhost ? "swblog" : arr[0]; %>' + '<h1><%=obj.title%></h1>' + '  <div class="row">' + '    <div class="col-sm-6 col-md-6">' + '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-obj.time%>' + '    </div>' + '  </div>' + '  <hr>' + '  <div data-on="?m=mkview" style="background-color: #ffffe8;">' + '  </div><br />' + '  <hr>' + '</article>' + '<ul class="pager">' + '  <li class="previous"><a data-on="?m=back">← 返回</a></li>' + ' <li><a target="_blank" href="https://github.com/' + '<%=username%>/<%=username%>.github.io/issues?utf8=%E2%9C%93&q=<%=decodeURIComponent(isLocalhost ? "localhost测试评论" : obj.title)%>">查看评论</a></li>' + ' <li class="next"><a target="_blank" href="https://github.com/' + '<%=username%>/<%=username%>.github.io/issues/new?title=<%=decodeURIComponent(isLocalhost ? "localhost测试评论" : obj.title)%>">去评论 &rarr;</a></li>' + '</ul>'
	  }, option);
	};

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var c_mainContainer = __webpack_require__(11);
	var c_footer = __webpack_require__(10);
	var m_article = __webpack_require__(4);
	var c_content = __webpack_require__(17);
	var m_initOption = __webpack_require__(12);
	
	module.exports = function (page) {
	  var viewBody = $('<div class="container" style="min-height:' + ((window.innerHeight || 640) - 200) + 'px"/>').setView({
	    name: 'blog/blog',
	    delay: true,
	    template: '<div data-on="?m=mkview"></div>'
	  });
	
	  var viewFoot = c_footer();
	  page.setView({
	    start: function start(hasRender) {
	      if (hasRender && BCD.history.getCode() == -1) {
	        return m_initOption.notRender(hasRender);
	      }
	      var key = location.hash.replace('#!/', '');
	      if (m_article.getArticle(key)) {
	        m_article.getArticleContent(key).then(function (data) {
	          page.setView({ title: data.title });
	          document.title = data.title;
	          viewBody.reset(data);
	        });
	      }
	    },
	    viewList: [viewBody, viewFoot]
	  });
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var c_footer = __webpack_require__(10);
	var c_mainContainer = __webpack_require__(11);
	var m_initOption = __webpack_require__(12);
	var c_pannelList = __webpack_require__(13);
	var m_pullArticle = __webpack_require__(20);
	
	module.exports = function (page, key) {
	  var viewBody = c_mainContainer();
	  var viewList = viewBody.find('[data-selector="main"]');
	  var viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
	  viewList.setView({
	    viewList: [m_pullArticle.container]
	  });
	
	  viewBody.addView(viewList);
	  viewBody.addView(viewPannelList);
	
	  var viewFoot = c_footer();
	  var oldWord = '';
	  page.setView({
	    start: function start(hasRender) {
	      var word = decodeURIComponent(BCD.getHash(1));
	      if (hasRender && oldWord == word) {
	        return m_initOption.noRender(true);
	      }
	      m_pullArticle.init(word);
	    },
	    title: '搜索结果',
	    viewList: [viewBody, viewFoot]
	  });
	};

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	/**
	 * 不断增加的列表
	 */
	var m_article = __webpack_require__(4);
	var container = $('<div style="display:none;">' + '<div data-selector="tips" style="margin: 20px;font-size: 20px;"></div>' + '<div data-selector="pull_list"></div>' + '</div>');
	
	var viewRank = $(container.find('[data-selector="pull_list"]'));
	var viewTips = $(container.find('[data-selector="tips"]'));
	
	viewRank.setView({
	  full: 'append',
	  template: '<%(obj.list || []).forEach(function(o, i, list){%><article>' + '  <h2><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a></h2>' + '  <div class="row">' + '    <div class="col-sm-6 col-md-6">' + '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-o.time%>' + '    </div>' + '  </div>' + '  <hr>' + '  <div data-on="?m=mkview&idx=<%=i%>" style="background-color: #ffffe8;">' + '  </div><br />' + '  <p class="text-right">' + '    <a data-on="?m=go" data-url="<%=o.href%>">' + '      continue reading...' + '    </a>' + '  </p>' + '  <%if(i<list.length-1)print("<hr>")%>' + '</article><%})%>'
	});
	
	module.exports = {
	  container: container,
	  init: function init(word) {
	    var count = 0;
	    var processCount = 0;
	    var keyWord = '<span class="text-danger">' + word + '</span>';
	    viewTips.html('正在搜索：' + keyWord);
	    viewRank.empty();
	    m_article.searchList(word, function (data) {
	      viewRank.reset(data);
	      count += data.list && data.list.length || 0;
	      processCount += data.checkNum;
	      if (processCount < data.totalNum) {
	        viewTips.html('在(' + processCount + '/' + data.totalNum + ')搜索到' + count + '篇关于：' + keyWord);
	      } else {
	        viewTips.html('在' + data.totalNum + '篇文章中搜索到' + count + '篇关于：' + keyWord);
	      }
	
	      console.log(data);
	    });
	  }
	};

/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map