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
	__webpack_require__(5);
	var m_article = __webpack_require__(8);
	var m_config = __webpack_require__(9);
	var c_header = __webpack_require__(10);
	var c_pageList = __webpack_require__(11);
	var c_pageContent = __webpack_require__(17);
	var viewHeader = c_header({
	  check: function check(obj) {
	    if (!!obj.author) {
	      m_config.init(obj);
	      return true;
	    }
	  }
	});
	$('body').append(viewHeader);
	
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
	      } else {
	        var path = decodeURIComponent(key);
	        if (m_article.getCatalog(path)) {
	          c_pageList(page, path);
	          return next();
	        } else if (m_article.getArticle(path)) {
	          c_pageContent(page, path);
	          return next();
	        }
	
	        BCD.replaceHash('#!/index');
	        next(-1);
	      }
	    }
	  });
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(2);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(4)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../../node_modules/css-loader/index.js!./blog.css", function() {
				var newContent = require("!!./../../../node_modules/css-loader/index.js!./blog.css");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(3)();
	// imports
	
	
	// module
	exports.push([module.id, "[data-url]{\n  cursor: pointer;\n}\n", ""]);
	
	// exports


/***/ },
/* 3 */
/***/ function(module, exports) {

	"use strict";
	
	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	// css base code, injected by the css-loader
	module.exports = function () {
		var list = [];
	
		// return the list of modules as css string
		list.toString = function toString() {
			var result = [];
			for (var i = 0; i < this.length; i++) {
				var item = this[i];
				if (item[2]) {
					result.push("@media " + item[2] + "{" + item[1] + "}");
				} else {
					result.push(item[1]);
				}
			}
			return result.join("");
		};
	
		// import a list of modules into the list
		list.i = function (modules, mediaQuery) {
			if (typeof modules === "string") modules = [[null, modules, ""]];
			var alreadyImportedModules = {};
			for (var i = 0; i < this.length; i++) {
				var id = this[i][0];
				if (typeof id === "number") alreadyImportedModules[id] = true;
			}
			for (i = 0; i < modules.length; i++) {
				var item = modules[i];
				// skip already imported module
				// this implementation is not 100% perfect for weird media query combinations
				//  when a module is imported multiple times with different media queries.
				//  I hope this will never occur (Hey this way we have smaller bundles)
				if (typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
					if (mediaQuery && !item[2]) {
						item[2] = mediaQuery;
					} else if (mediaQuery) {
						item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
					}
					list.push(item);
				}
			}
		};
		return list;
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/*
		MIT License http://www.opensource.org/licenses/mit-license.php
		Author Tobias Koppers @sokra
	*/
	var stylesInDom = {},
		memoize = function(fn) {
			var memo;
			return function () {
				if (typeof memo === "undefined") memo = fn.apply(this, arguments);
				return memo;
			};
		},
		isOldIE = memoize(function() {
			return /msie [6-9]\b/.test(window.navigator.userAgent.toLowerCase());
		}),
		getHeadElement = memoize(function () {
			return document.head || document.getElementsByTagName("head")[0];
		}),
		singletonElement = null,
		singletonCounter = 0,
		styleElementsInsertedAtTop = [];
	
	module.exports = function(list, options) {
		if(true) {
			if(typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
		}
	
		options = options || {};
		// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
		// tags it will allow on a page
		if (typeof options.singleton === "undefined") options.singleton = isOldIE();
	
		// By default, add <style> tags to the bottom of <head>.
		if (typeof options.insertAt === "undefined") options.insertAt = "bottom";
	
		var styles = listToStyles(list);
		addStylesToDom(styles, options);
	
		return function update(newList) {
			var mayRemove = [];
			for(var i = 0; i < styles.length; i++) {
				var item = styles[i];
				var domStyle = stylesInDom[item.id];
				domStyle.refs--;
				mayRemove.push(domStyle);
			}
			if(newList) {
				var newStyles = listToStyles(newList);
				addStylesToDom(newStyles, options);
			}
			for(var i = 0; i < mayRemove.length; i++) {
				var domStyle = mayRemove[i];
				if(domStyle.refs === 0) {
					for(var j = 0; j < domStyle.parts.length; j++)
						domStyle.parts[j]();
					delete stylesInDom[domStyle.id];
				}
			}
		};
	}
	
	function addStylesToDom(styles, options) {
		for(var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];
			if(domStyle) {
				domStyle.refs++;
				for(var j = 0; j < domStyle.parts.length; j++) {
					domStyle.parts[j](item.parts[j]);
				}
				for(; j < item.parts.length; j++) {
					domStyle.parts.push(addStyle(item.parts[j], options));
				}
			} else {
				var parts = [];
				for(var j = 0; j < item.parts.length; j++) {
					parts.push(addStyle(item.parts[j], options));
				}
				stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
			}
		}
	}
	
	function listToStyles(list) {
		var styles = [];
		var newStyles = {};
		for(var i = 0; i < list.length; i++) {
			var item = list[i];
			var id = item[0];
			var css = item[1];
			var media = item[2];
			var sourceMap = item[3];
			var part = {css: css, media: media, sourceMap: sourceMap};
			if(!newStyles[id])
				styles.push(newStyles[id] = {id: id, parts: [part]});
			else
				newStyles[id].parts.push(part);
		}
		return styles;
	}
	
	function insertStyleElement(options, styleElement) {
		var head = getHeadElement();
		var lastStyleElementInsertedAtTop = styleElementsInsertedAtTop[styleElementsInsertedAtTop.length - 1];
		if (options.insertAt === "top") {
			if(!lastStyleElementInsertedAtTop) {
				head.insertBefore(styleElement, head.firstChild);
			} else if(lastStyleElementInsertedAtTop.nextSibling) {
				head.insertBefore(styleElement, lastStyleElementInsertedAtTop.nextSibling);
			} else {
				head.appendChild(styleElement);
			}
			styleElementsInsertedAtTop.push(styleElement);
		} else if (options.insertAt === "bottom") {
			head.appendChild(styleElement);
		} else {
			throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
		}
	}
	
	function removeStyleElement(styleElement) {
		styleElement.parentNode.removeChild(styleElement);
		var idx = styleElementsInsertedAtTop.indexOf(styleElement);
		if(idx >= 0) {
			styleElementsInsertedAtTop.splice(idx, 1);
		}
	}
	
	function createStyleElement(options) {
		var styleElement = document.createElement("style");
		styleElement.type = "text/css";
		insertStyleElement(options, styleElement);
		return styleElement;
	}
	
	function createLinkElement(options) {
		var linkElement = document.createElement("link");
		linkElement.rel = "stylesheet";
		insertStyleElement(options, linkElement);
		return linkElement;
	}
	
	function addStyle(obj, options) {
		var styleElement, update, remove;
	
		if (options.singleton) {
			var styleIndex = singletonCounter++;
			styleElement = singletonElement || (singletonElement = createStyleElement(options));
			update = applyToSingletonTag.bind(null, styleElement, styleIndex, false);
			remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true);
		} else if(obj.sourceMap &&
			typeof URL === "function" &&
			typeof URL.createObjectURL === "function" &&
			typeof URL.revokeObjectURL === "function" &&
			typeof Blob === "function" &&
			typeof btoa === "function") {
			styleElement = createLinkElement(options);
			update = updateLink.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
				if(styleElement.href)
					URL.revokeObjectURL(styleElement.href);
			};
		} else {
			styleElement = createStyleElement(options);
			update = applyToTag.bind(null, styleElement);
			remove = function() {
				removeStyleElement(styleElement);
			};
		}
	
		update(obj);
	
		return function updateStyle(newObj) {
			if(newObj) {
				if(newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap)
					return;
				update(obj = newObj);
			} else {
				remove();
			}
		};
	}
	
	var replaceText = (function () {
		var textStore = [];
	
		return function (index, replacement) {
			textStore[index] = replacement;
			return textStore.filter(Boolean).join('\n');
		};
	})();
	
	function applyToSingletonTag(styleElement, index, remove, obj) {
		var css = remove ? "" : obj.css;
	
		if (styleElement.styleSheet) {
			styleElement.styleSheet.cssText = replaceText(index, css);
		} else {
			var cssNode = document.createTextNode(css);
			var childNodes = styleElement.childNodes;
			if (childNodes[index]) styleElement.removeChild(childNodes[index]);
			if (childNodes.length) {
				styleElement.insertBefore(cssNode, childNodes[index]);
			} else {
				styleElement.appendChild(cssNode);
			}
		}
	}
	
	function applyToTag(styleElement, obj) {
		var css = obj.css;
		var media = obj.media;
	
		if(media) {
			styleElement.setAttribute("media", media)
		}
	
		if(styleElement.styleSheet) {
			styleElement.styleSheet.cssText = css;
		} else {
			while(styleElement.firstChild) {
				styleElement.removeChild(styleElement.firstChild);
			}
			styleElement.appendChild(document.createTextNode(css));
		}
	}
	
	function updateLink(linkElement, obj) {
		var css = obj.css;
		var sourceMap = obj.sourceMap;
	
		if(sourceMap) {
			// http://stackoverflow.com/a/26603875
			css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
		}
	
		var blob = new Blob([css], { type: "text/css" });
	
		var oldSrc = linkElement.href;
	
		linkElement.href = URL.createObjectURL(blob);
	
		if(oldSrc)
			URL.revokeObjectURL(oldSrc);
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_util = __webpack_require__(6);
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
	
	//事件绑定
	module.exports = {
	  go: go,
	  back: back
	};

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_event = __webpack_require__(7);
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
/* 7 */
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
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }
	
	var m_util = __webpack_require__(6);
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
	    sequenceDiagram: true });
	});
	
	var getName = function getName(path) {
	  var arr = path.match(/([^/.]+)[.\w]+$/);
	  return arr ? arr[1] : '';
	};
	
	var getSortContent = function getSortContent(content) {
	  var ret = content.substring(0, 500);
	  var getContent = function getContent(str, reg) {
	    var arr = str.split(reg).filter(function (o) {
	      return !!o;
	    });
	    var count = 0;
	    if (arr && arr.length > 2) {
	      var idx = arr.length - 1;
	      arr.some(function (o, i) {
	        count += o.length;
	        if (count > 250 && i > 1) {
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
	};
	
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
	      url: o.path,
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
	
	var getLastPost = function getLastPost() {
	  getTagArticles(tag).slice(start, start + count);
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
	  }
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	"use strict";
	
	var config = {
	  "author": "liquidliang",
	  "nav": [["Home", "#!/index"], ["About", "#!/about"]]
	};
	
	module.exports = {
	  init: function init(c) {
	    return config = c;
	  },
	  getConfig: function getConfig() {
	    return config;
	  }
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	//顶部导航
	module.exports = function (option) {
	  var viewHeader = $('<header class="navbar navbar-inverse navbar-fixed-top bs-docs-nav" role="banner"></header>');
	  option = $.extend({
	    name: 'common/header',
	    url: './json/config.json',
	    update: 'd',
	    template: '  <div class="container">' + '    <div class="navbar-header">' + '      <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">' + '        <span class="sr-only">Toggle navigation</span>' + '        <span class="icon-bar"></span>' + '        <span class="icon-bar"></span>' + '        <span class="icon-bar"></span>' + '      </button>' + '      <a href="#!/index" class="logo-link" style="padding: 12px;"><%-obj.author%>的博客</a>' + '    </div>' + '    <nav class="collapse navbar-collapse bs-navbar-collapse" role="navigation">' + '      <ul class="nav navbar-nav"><%(obj.nav || []).forEach(function(o){%>' + '        <li class="<%=location.hash==o[1] ? "active" : ""%>"><a href="<%=o[1]%>"><%-o[0]%></a></li>' + '        <%})%>' + '      </ul>' + '    </nav>' + '  </div>'
	  }, option);
	  return viewHeader.setView(option);
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var c_footer = __webpack_require__(12);
	var m_article = __webpack_require__(8);
	var m_config = __webpack_require__(9);
	var m_initOption = __webpack_require__(13);
	var c_pannelList = __webpack_require__(14);
	var c_articleList = __webpack_require__(16);
	
	module.exports = function (page, key) {
	  var viewBody = $('<div class="container">' + '  <div class="row">' + '    <div class="col-md-8" data-selector="main"></div>' + '    <div class="col-md-4" data-selector="panel"></div>' + '  </div>' + '</div>');
	  var viewList = viewBody.find('[data-selector="main"]');
	  var viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
	  viewList.setView(c_articleList({
	    delay: true
	  }));
	  viewBody.addView(viewList);
	  viewBody.addView(viewPannelList);
	
	  var viewFoot = c_footer({
	    getData: function getData() {
	      return m_config.getConfig();
	    }
	  });
	  page.setView({
	    start: function start(hasRender) {
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
/* 12 */
/***/ function(module, exports) {

	'use strict';
	
	//顶部导航
	module.exports = function (option) {
	  var viewHeader = $('<footer></footer>');
	  option = $.extend({
	    name: 'common/footer',
	    template: '<div class="container">' + '  <hr>' + '  <p class="text-center">Copyright <%-obj.author%> © <%=new Date().getFullYear()%>. All rights reserved.</p>' + '</div>'
	  }, option);
	  return viewHeader.setView(option);
	};

/***/ },
/* 13 */
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
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var m_article = __webpack_require__(8);
	var c_pannel = __webpack_require__(15);
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
/* 15 */
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
/* 16 */
/***/ function(module, exports) {

	'use strict';
	
	//顶部导航
	module.exports = function (option) {
	  return $.extend({
	    name: 'blog/article_list',
	    template: '<h1><%=obj.title%></h1>' + '<%if(!(obj.list && obj.list.length)){%>' + '<br><hr><center><h3>暂无内容</h3></center>' + '<%}else{(obj.list || []).forEach(function(o, i){%><article>' + '  <h2><a data-on="?m=go" data-url="<%=o.href%>"><%-o.title%></a></h2>' + '  <div class="row">' + '    <div class="col-sm-6 col-md-6">' + '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-o.time%>' + '    </div>' + '  </div>' + '  <hr>' + '  <div data-on="?m=mkview&idx=<%=i%>" style="background-color: #ffffe8;">' + '  </div><br />' + '' + '  <p class="text-right">' + '    <a data-on="?m=go" data-url="<%=o.href%>">' + '      continue reading...' + '    </a>' + '  </p>' + '  <hr>' + '</article><%})%>' + '' + '<ul class="pager">' + '  <li class="previous"><a <%if(obj.page==0){%>style="opacity: 0.5;"<%}else{%>' + 'data-on="?m=go" data-url="<%=obj.hrefHead+"/"+(obj.page-1)%>"<%}%>>&larr; Previous</a></li>' + '  <li class="next"><a <%if(obj.page==Math.floor(obj.num/obj.count)){%>style="opacity: 0.5;"<%}else{%>' + 'data-on="?m=go" data-url="<%=obj.hrefHead+"/"+(obj.page+1)%>"<%}%>>Next &rarr;</a></li>' + '</ul><%}%>'
	  }, option);
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var c_footer = __webpack_require__(12);
	var m_article = __webpack_require__(8);
	var m_config = __webpack_require__(9);
	var c_pannelList = __webpack_require__(14);
	var c_content = __webpack_require__(18);
	var m_initOption = __webpack_require__(13);
	
	module.exports = function (page, key) {
	  var viewBody = $('<div class="container">' + '  <div class="row">' + '    <div class="col-md-8" data-selector="main"></div>' + '    <div class="col-md-4" data-selector="panel"></div>' + '  </div>' + '</div>');
	  var viewContent = viewBody.find('[data-selector="main"]');
	  var viewPannelList = c_pannelList(viewBody.find('[data-selector="panel"]'));
	  viewContent.setView(c_content({
	    delay: true
	  }));
	  viewBody.addView(viewContent);
	  viewBody.addView(viewPannelList);
	
	  var viewFoot = c_footer({
	    getData: function getData() {
	      return m_config.getConfig();
	    }
	  });
	  page.setView({
	    start: function start(hasRender) {
	      if (m_article.getArticle(key)) {
	        m_article.getArticleContent(key).then(function (data) {
	          viewContent.reset(data);
	        });
	      }
	      return m_initOption.notRender(hasRender);
	    },
	    title: '文章列表',
	    viewList: [viewBody, viewFoot]
	  });
	};

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';
	
	//顶部导航
	module.exports = function (option) {
	  return $.extend({
	    name: 'blog/content',
	    template: '<h1><%=obj.title%></h1>' + '  <div class="row">' + '    <div class="col-sm-6 col-md-6">' + '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-obj.time%>' + '    </div>' + '  </div>' + '  <hr>' + '  <div data-on="?m=mkview" style="background-color: #ffffe8;">' + '  </div><br />' + '  <hr>' + '</article>' + '<ul class="pager">' + '  <li class="previous"><a data-on="?m=back">← 返回</a></li>' + '</ul>'
	  }, option);
	};

/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map