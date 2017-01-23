//顶部导航
module.exports = function(option) {
 return $.extend({
   name: 'blog/content',
   template: '<h1><%=obj.title%></h1>' +
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
     '</ul>'
 }, option);
};
