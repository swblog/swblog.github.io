 //顶部导航
module.exports = function(option) {
  let view = $('<div class="panel panel-primary"></div>');
  option = $.extend({
    name: 'blog/panel',
    template:
      '<%if(obj.title){%><div class="panel-heading">' +
      '  <h4><%-obj.title%></h4>' +
      '</div><%}%>' +
      '<div class="panel-body">' +
      '  <%if(obj.isInline){%>' +
      '    <ul class="list-inline">'+
      '     <%(obj.list || []).forEach(function(o){%>' +
      '      <%if(o.href){%>'+
      '       <li><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a></li>'+
      '      <%}else{%>'+
      '       <li><a data-on="?m=go" data-url="#!/tag/<%=o%>"><%=o%></a></li>'+
      '      <%}%>' +
      '     <%})%>'+
      '    </ul>' +
      '  <%}else{%>' +
      '    <ul class="list-group">' +
      '     <%(obj.list || []).forEach(function(o){%>' +
      '      <li class="list-group-item"><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a>'+
      '       <%=o.time ? "<span style=\\\"color: #a2a34f;\\\">("+o.time+")</span>" : ""%></li>' +
      '     <%})%>'+
      '    </ul>' +
      '    <%}%>' +
      '</div>',
    end: function(data){
      if(!(data && data.list && data.list.length)){
        this.hide();
        return 'hide';
      }
    }
  }, option);
  return view.setView(option);
};
