const {Ci,Cc} = require("chrome");
var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};

var data = require('sdk/self').data;
var tabs = require('sdk/tabs');

             
              

var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
//Get the window
var thisWindow = mediator.getMostRecentWindow("navigator:browser");

var menuId;
//var gWindow;
//var uuid;
function loadIntoWindow(window) {
	if (!window)
		return;
	menuId = window.NativeWindow.menu.add("Sync & Share", null, function() { /*showToast(window);*/
	  	emit(exports, 'menuClicked',null);
   	});
   
   
  
  // DO SOMETHING HERE (create UI)
}


function showDoorhanger(aWindow) {
  buttons = [
    {
      label: "Save this tab",
      callback: function() {
        //showToast('Save this tab');
        var currentTab = tabs.activeTab;
        emit(exports, 'saveTabClicked', [currentTab] );
      }
    } , {
      label: "Save all tabs",
      callback: function() {
        //showToast('Save all tabs');
        emit(exports, 'saveAllTabsClicked', tabs);
      }
    }];

  aWindow.NativeWindow.doorhanger.show("Choose one of the following options.", "doorhanger-test", buttons);
}


var windowListener = {
  onOpenWindow: function(aWindow) {
    // Wait for the window to finish loading
    let domWindow = aWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindowInternal || Ci.nsIDOMWindow);
    domWindow.addEventListener("load", function onLoad() {
      domWindow.removeEventListener("load", onLoad, false);
      loadIntoWindow(domWindow);
    }, false);
  },
 
  onCloseWindow: function(aWindow) {},
  onWindowTitleChange: function(aWindow, aTitle) {}
};


/*function showMsg(MSG){
		MSG[0].alert(MSG[1]);	
}*/

function startup() {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].getService(Ci.nsIWindowMediator);

  // Load into any existing windows
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    loadIntoWindow(domWindow);
  }
  addPageAction()
  // Load into any new windows
  wm.addListener(windowListener);
  

}




function showToast(msg) {
  thisWindow.NativeWindow.toast.show(msg, "short");

  //emit(exports,'msgShown',msg);
}


function addPageAction(){
	/*
	title: Pageaction title
	icon: Icon image for the pageaction
	clickCallback: Callback called when pageaction is clicked
	longClickCallback: Callback called when pageaction is long pressed
	*/
	var aOptions = {
	  title: "Page action",
	  icon: data.url('images/myLogo64.png'),
	  //clickCallback: function() {
	  //	
	   //}
	  longClickCallback: function() {
			showDoorhanger(thisWindow);
	  } 
	};
	var id = thisWindow.NativeWindow.pageactions.add(aOptions);
}




exports.startup = startup;
exports.showToast = showToast;
exports.addPageAction = addPageAction;








