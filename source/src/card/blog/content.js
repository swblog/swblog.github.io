//单个文章
module.exports = function(option) {
 return $.extend({
   name: 'blog/content',
   template: '<%var arr=location.host.split("."); var isLocalhost = arr.length===1; var username= isLocalhost ? "swblog" : arr[0]; %>'+
     '<h1><%=obj.title%></h1>' +
     '  <div class="row">' +
     '    <div class="col-sm-6 col-md-6">' +
     '      &nbsp;&nbsp;<span class="glyphicon glyphicon-time"></span><%-obj.time%>' +
     '    </div>' +
     '  </div>' +
     '  <hr>' +
     '  <div data-on="?m=mkview" style="background-color: #ffffe8;">'+
     '  </div><br />' +
     '  <hr>' +
     '</article>' +
     '<ul class="pager">' +
     '  <li class="previous"><a data-on="?m=back">← 返回</a></li>' +
      ' <li><a target="_blank" href="https://github.com/'+
      '<%=username%>/<%=username%>.github.io/issues?utf8=%E2%9C%93&q=<%=decodeURIComponent(isLocalhost ? "localhost测试评论" : obj.title)%>">查看评论</a></li>' +
      ' <li class="next"><a target="_blank" href="https://github.com/'+
      '<%=username%>/<%=username%>.github.io/issues/new?title=<%=decodeURIComponent(isLocalhost ? "localhost测试评论" : obj.title)%>">去评论 &rarr;</a></li>' +
     '</ul>'
 }, option);
};
