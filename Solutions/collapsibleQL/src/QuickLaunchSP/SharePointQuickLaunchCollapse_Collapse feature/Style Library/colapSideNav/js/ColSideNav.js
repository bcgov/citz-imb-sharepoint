
$(document).ready(function() {

  //Get Quick launch top level links individually
  $('.ms-core-listMenu-verticalBox ul.root > li > a, .ms-core-listMenu-verticalBox ul.root > li > span').each(function() {
    //Define Sub Menu(s)
    subMensObj = $(this).next('ul');

    //If Sub Menu lenght is not = 0 add a carrot image
    if (subMensObj.length != 0) {
      $(this).find("span.menu-item-text").prepend("<img src='https://citz.sp.gov.bc.ca/sites/DEV/Style Library/right-arrow.png' border='0' class='imgAlign' />");
    }
  });
  //Get sub Menus as an Object
  var subMens = $('#sideNavBox ul.root ul');

  var selectedIndex = -1;
  //Find all sub menus
  for (var i = 0; i < subMens.length; i++) {
    var subMenu = $(subMens[i]);
    if (subMenu.find('li.selected').length > 0) {
      var selectedIndex = i;
      break;
    }
  }
  //Hide sub menus if the are not selected
  subMens.hide();
  if (selectedIndex != -1) {
    subMens.eq(selectedIndex).parent("li").find("img.imgAlign").attr("src", "https://citz.sp.gov.bc.ca/" + _spPageContextInfo.siteServerRelativeUrl + "/Style Library/down-arrow.png");
    subMens.eq(selectedIndex).slideDown();
  }
  //On click of item with sub menu, expand child sub menu
  $('img.imgAlign').click(function(e) {
      subMensObj = $(this).parents().eq(2).next('ul')
      console.log(subMensObj);
      if (subMensObj.length != 0) {
        e.preventDefault();
        console.log(subMens);
        $(this).closest('ul').find('img.imgAlign').attr("src", "https://citz.sp.gov.bc.ca/" + _spPageContextInfo.siteServerRelativeUrl + "/Style Library/right-arrow.png");
        subMens.slideUp();
        if (subMensObj.is(':visible') == false) {
          $(this).attr("src", "https://citz.sp.gov.bc.ca/" + _spPageContextInfo.siteServerRelativeUrl + "/Style Library/down-arrow.png");
          subMensObj.slideDown();
        }
      }
    });
    $('.imgAlign').css({
        'padding-top' : '5px',
        'padding-bottom' : '5px',
        'padding-left' : '13px',
        'padding-right' : '13px',
        'position' : 'absolute',
        'height' : '10px',
        'left' : '0px'
    });

    $('.ms-core-listMenu-verticalBox > .ms-core-listMenu-item, .ms-core-listMenu-verticalBox li.static > .ms-core-listMenu-item').css({
        'padding' : '8px 30px',

    });

    $('#sideNavBox li ul').css({
        'background' : 'rgba(0, 0, 0, 0.1)',
        'border-top' : 'solid 1px #D8D8D8',
        'border-bottom' : 'solid 1px #D8D8D8',
    });

    $('span.menu-item-text').css({
        'color' : '#000'
    });

  });
