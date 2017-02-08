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
    '<li><a data-on="?m=go" data-url="<%=o.href%>"><%=o.title%></a></li>'+
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
  };
  ele.find('button').on('click', function(e){
    m_util.stopBubble(e);
    if(word){
      doSearch();
    }
  });
  let selectLi = null;
  let index = -1;
  let oldWord = '';
  viewInput.on('blur', function(){
    viewDrop.hide();
  });
  ele.on('keypress input keyup', function(e){
    let word = getWord();
    if(word){
      let lis = viewDrop.find('a');
      if(e.keyCode==13){
        if(selectLi){
          selectLi.trigger('click');
        }else{
          doSearch();
        }
      }
      if(e.keyCode==40){
        index++;
        if(index >= lis.length){
          index = 0;
        }
      }
      if(e.keyCode==38){
        index--;
        if(index <= -lis.length){
          index = 0;
        }
      }

      if(word==oldWord){
        if(e.keyCode==40 || e.keyCode==38){
          lis.css('background-color','');
          selectLi = lis.eq(index);
          selectLi.css('background-color','aliceblue');
        }

        return;
      }
      oldWord = word;
      let list = m_article.searchDirect(word);
      if(list.length){
        index = -1;
        selectLi = null;
        return viewDrop.reset(list);
      }
    }
    viewDrop.hide();
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
