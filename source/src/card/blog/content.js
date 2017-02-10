window.CONFIG = require('model/config')
//单个文章
module.exports = function (option) {
  return $.extend({
    name: 'blog/content',
    template:
      '<h1><%=obj.title%></h1>' +
      '  <div class="row">' +
      '    <div class="group1 col-sm-6 col-md-6">' +
      '      <span class="glyphicon glyphicon-folder-open"></span><%(obj.tagList||[]).forEach(function(item, i, arr){%>'+
      '       <%=i ? "&nbsp;>&nbsp;" : "&nbsp;"%><a data-on="?m=go" '+
      '       data-url="#!/<%=encodeURIComponent(["blog"].concat(arr.slice(0, i+1)).join("/"))%>"><%=item%></a><%})%>' +
      '    </div>' +
      '    <div class="group2 col-sm-6 col-md-6">' +
      '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-obj.time%>' +
      '    </div>' +
      '  </div>' +
      '  <hr>' +
      '  <div data-on="?m=mkview">' +
      '  </div><br />' +
      '  <hr>' +
      '</article>' +
      '<ul class="pager">' +
      '  <li class="previous"><a data-on="?m=back">← 返回</a></li>' +
      ' <li><a target="_blank" href="<%=CONFIG.getSearchIssueURL(obj.title)%>">查看评论</a></li>' +
      ' <li class="next"><a target="_blank" href="<%=CONFIG.getNewIssueURL(obj.title)%>">去评论 &rarr;</a></li>' +
      '</ul>'
  }, option);
};
