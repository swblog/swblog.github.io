﻿ //顶部导航
module.exports = function(option) {
  return $.extend({
    name: 'blog/article_list',
    template: '<h1><%=obj.title%></h1>' +
      '<%if(!(obj.list && obj.list.length)){%>'+
      '<br><hr><center><h3>暂无内容</h3></center>'+
      '<%}else{(obj.list || []).forEach(function(o, i){%><article>' +
      '  <h2><a data-on="?m=go" data-url="<%=o.href%>"><%-o.title%></a></h2>' +
      '  <div class="row">' +
      '    <div class="col-sm-6 col-md-6">' +
      '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-o.time%>' +
      '    </div>' +
      '  </div>' +
      '  <hr>' +
      '  <div data-on="?m=mkview&idx=<%=i%>" style="background-color: #ffffe8;">'+
      '  </div><br />' +
      '' +
      '  <p class="text-right">' +
      '    <a data-on="?m=go" data-url="<%=o.href%>">' +
      '      continue reading...' +
      '    </a>' +
      '  </p>' +
      '  <hr>' +
      '</article><%})%>' +
      '' +
      '<ul class="pager">' +
      '  <li class="previous"><a <%if(obj.page==0){%>style="opacity: 0.5;"<%}else{%>'+
      'data-on="?m=go" data-url="<%=obj.hrefHead+"/"+(obj.page-1)%>"<%}%>>&larr; Previous</a></li>' +
      '  <li class="next"><a <%if(obj.page==Math.floor(obj.num/obj.count)){%>style="opacity: 0.5;"<%}else{%>'+
      'data-on="?m=go" data-url="<%=obj.hrefHead+"/"+(obj.page+1)%>"<%}%>>Next &rarr;</a></li>' +
      '</ul><%}%>'
  }, option);
};