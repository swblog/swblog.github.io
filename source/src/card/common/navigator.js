const m_util = require('common/util');
const m_article = require('model/article');
const m_config = require('model/config');


BCD.addEvent('navigator_search', function(ele){
  ele.html('<div class="form-group open">'+
  '  <input type="text" class="form-control" placeholder="Search">'+
  '  <ul class="dropdown-menu" style="right:auto;display:none"></ul>'+
  '</div>'+
  '<button type="submit" class="btn btn-primary">Submit</button>');
  let viewInput = ele.find('input');
  let viewDrop = ele.find('ul').setView({
    template:'<%(obj||[]).forEach(function(o){%>'+
    '<li data-on="?m=go" data-url="<%=o.href%>"><a><%=o.title%></a></li>'+ //
    '<%})%>'
  });

  let viewGroup = ele.find('.form-group');
  const getWord = ()=> viewInput.val().trim();
  const doSearch = ()=>{
    let hash = '#!/search/'+encodeURIComponent(getWord());
    if(BCD.getHash(0)=='search'){
      BCD.replaceHash(hash);
    }else{
      BCD.go(hash);
    }
    setTimeout(function(){
      viewInput[0].focus(); //延时才能自动focus
    }, 300);
  };
  ele.find('button').on('click', function(e){
    m_util.stopBubble(e);
    let word = getWord();
    if(word){
      doSearch();
    }
  });
  let selectLi = null;
  let selectList = null;
  let index = -1;
  let oldWord = '';
  viewInput.on('blur', function(){
    setTimeout(function(){
      viewDrop.hide();
    }, 200);
  });
  ele.on('keydown', function(e){//上下选择
    if(selectList &&(e.keyCode==40 || e.keyCode==38)){

      if(e.keyCode==40){
        index++;
        if(index >= selectList.length){
          index = 0;
        }
      }
      if(e.keyCode==38){
        index--;
        if(index <= -selectList.length){
          index = 0;
        }
      }
      selectList.css('background-color','');
      selectLi = selectList.eq(index);
      selectLi.css('background-color','#b2d8fa');
    }
  });

  ele.on('keyup', function(e){ //keypress要慢一拍 keypress input keyup
    let word = getWord();
    if(word){
      if(e.keyCode==32){
        return doSearch();
      }
      if(e.keyCode==13){
        if(selectLi){
          selectLi.trigger('click');
        }else{
          doSearch();
        }
      }

      if(word==oldWord){
        return viewDrop.show();
      }
      oldWord = word;
      let list = m_article.searchDirect(word);
      if(list.length){
        index = -1;
        selectLi = null;
        viewDrop.reset(list);
        selectList = viewDrop.find('li');
      }
    }else{
      viewDrop.hide();
    }
  });
})


 //顶部导航
module.exports = function(option) {
  let viewHeader = $('<header class="navbar navbar-inverse navbar-fixed-top bs-docs-nav" role="banner"></header>');
  option = $.extend({
    name: 'common/header',
    getData: function() {
      return m_config.getConfigSync()
    },
    template: '  <div class="container">' +
      '    <div class="navbar-header">' +
      '      <button class="navbar-toggle" type="button" data-toggle="collapse" data-target=".bs-navbar-collapse">' +
      '        <span class="sr-only">Toggle navigation</span>' +
      '        <span class="icon-bar"></span>' +
      '        <span class="icon-bar"></span>' +
      '        <span class="icon-bar"></span>' +
      '      </button>' +
      '      <a data-on="?m=go" data-url="<%=CONFIG.getIndex()%>" class="logo-link" style="padding: 12px;"><%-obj.logoTitle%></a>' +
      '    </div>' +
      '    <nav class="collapse navbar-collapse bs-navbar-collapse" role="navigation">' +
      '      <div class="navbar-form navbar-right" data-on="?m=navigator_search"></div>'+
      '      <ul class="nav navbar-nav"><%(obj.nav || []).forEach(function(o){%>' +
      '        <li class="<%=location.hash==o[1] ? "active" : ""%>"><a data-on="?m=replaceHash" data-url="<%=o[1]%>"><%-o[0]%></a></li>' +
      '        <%})%>' +
      '      </ul>' +
      '    </nav>' +
      '  </div>'
  }, option);
  return viewHeader.setView(option);
};
