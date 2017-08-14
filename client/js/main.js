(function(){

  /* Options */
    var options = {
      onlyTop: true,
      activeClassName: 'active',
      linkArriveFunction: null,
      linkDepartFunction: null,
      elementArriveFunction: function(){},
      elementDepartFunction: function(){}
    }
    var Spy = new SimpleSpy(options);
    var tgFirst = document.getElementById('tgFirst');
    if (tgFirst) {
      tgFirst.addEventListener('click', function(){
        if (Spy.onlyTop) {
          this.value = 'All Visible';
        } else {
          this.value = 'Only Top'
        }
        Spy.setOnlyTop('toggle');
      })
    }
    var b = function(){console.log('You Have Left B')}
    Spy.setLinkArriveFunction("a", function(){console.log('test a')})
    Spy.setLinkDepartFunction("b", b);
})();
