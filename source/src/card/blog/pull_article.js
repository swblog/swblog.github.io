/**
 * 不断增加的列表
 */
const m_article = require('model/article');
var container = $('<div style="display:none;">' +
  '<div data-selector="tips" style="margin: 20px;font-size: 20px;"></div>' +
  '<div data-selector="pull_list"></div>' +
  '</div>');

var viewRank = $(container.find('[data-selector="pull_list"]'));
var viewTips = $(container.find('[data-selector="tips"]'));

viewRank.setView({
  full: 'append',
  template: '<%(obj.list || []).forEach(function(o, i, list){%><article>' +
    '  <h2><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a></h2>' +
    '  <div class="row">' +
    '    <div class="col-sm-6 col-md-6">' +
    '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-o.time%>' +
    '    </div>' +
    '  </div>' +
    '  <hr>' +
    '  <div data-on="?m=mkview&idx=<%=i%>" style="background-color: #ffffe8;">' +
    '  </div><br />' +
    '  <p class="text-right">' +
    '    <a data-on="?m=go" data-url="<%=o.href%>">' +
    '      continue reading...' +
    '    </a>' +
    '  </p>' +
    '  <%if(i<list.length-1)print("<hr>")%>' +
    '</article><%})%>'
});


module.exports = {
  container,
  init: (word) => {
    let count = 0;
    let processCount = 0;
    let keyWord = '<span class="text-danger">'+word+'</span>'
    viewTips.html('正在搜索：'+keyWord);
    viewRank.empty();
    m_article.searchList(word, function(data){
      viewRank.reset(data);
      count += data.list && data.list.length || 0;
      processCount += data.checkNum;
      if(processCount<data.totalNum){
        viewTips.html('在('+ processCount +'/'+data.totalNum+')搜索到'+
        count+'篇关于：'+keyWord);
      }else{
        viewTips.html('在'+data.totalNum+'篇文章中搜索到'+
        count+'篇关于：'+keyWord);
      }

      console.log(data);
    });
  }
};
