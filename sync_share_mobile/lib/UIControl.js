/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created because mozilla sdk doesn't offer creation of XUL elements and controls.						|																					
 ************************************************************************************************************************/

/**********************************************SDK Modules*************************************************************/
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



function loadIntoWindow(window) {
	if (!window)
		return;
	menuId = window.NativeWindow.menu.add("Sync & Share", null, function() { /*showToast(window);*/
	  	emit(exports, 'menuClicked',null);
   	});
}


function showDoorhanger(aWindow) {
  buttons = [
    {
      label: "Save This Tab",
      callback: function() {
        var currentTab = tabs.activeTab;
        emit(exports, 'saveTabClicked', [currentTab] );
      }
    } , {
      label: "Save All Tabs",
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
	var aOptions = {
	  title: "Page action",
	  icon: data.url('images/myLogo64.png'),
	  longClickCallback: function() {
			showDoorhanger(thisWindow);
	  } 
	};
	var id = thisWindow.NativeWindow.pageactions.add(aOptions);
}




exports.startup = startup;
exports.showToast = showToast;
exports.addPageAction = addPageAction;








