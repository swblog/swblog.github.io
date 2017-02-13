 //顶部导航
module.exports = function(option) {
  let view = $('<div class="panel panel-primary"></div>');
  option = $.extend({
    name: 'blog/panel',
    template:
      '<%var list=obj.list || []; if(list.length===0){return "";}%><div class="panel-heading">' +
      '  <h4><%-obj.title%></h4>' +
      '</div>' +
      '<div class="panel-body">' +
      '  <%if(obj.isInline){%>' +
      '    <ul class="list-inline">'+
      '     <%(obj.list || []).forEach(function(o){%>' +
      '      <li><a data-on="?m=go" data-url="#!/tag/<%=o%>"><%=o%></a></li>' +
      '     <%})%>'+
      '    </ul>' +
      '  <%}else{%>' +
      '    <ul class="list-group">' +
      '     <%list.forEach(function(o){%>' +
      '      <li class="list-group-item"><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a>'+
      '       <%=o.time ? "<span style=\\\"color: #a2a34f;\\\">("+o.time+")</span>" : ""%></li>' +
      '     <%})%>'+
      '    </ul>' +
      '    <%}%>' +
      '</div>'
  }, option);
  return view.setView(option);
};
