/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created because mozilla sdk doesn't offer creation of XUL elements and controls.						|																					
 ************************************************************************************************************************/

const {Ci,Cc} = require("chrome");
var { emit, on, once, off } = require("sdk/event/core");
var tabs = require("sdk/tabs");
const data = require("sdk/self").data;		//This is the addon's relative path to the data folder.
var preferences = require("sdk/simple-prefs");
const { myId } = require("sdk/self");
const pageMod = require("sdk/page-mod");	//Used to modify a html page.
const share = require('./share');
const images = require('./imagesHandler');

var mediator = Cc['@mozilla.org/appshell/window-mediator;1'].getService(Ci.nsIWindowMediator);
//Get the window
var window = mediator.getMostRecentWindow("navigator:browser");
//Get the XUL elements as DOM
var document = mediator.getMostRecentWindow("navigator:browser").document;
/*XUL items unique identifiers*/
const TAB_MENU = myId+'saveTabMenu';
const SYNC_ALL_NOW_MENU = myId+'syncAllNowMenu';
const SYNCED_ITEMS_MENU = myId+'openMenu';
const SAVE_TABS_MENU = myId+'saveAllTabs';
const SETTINGS_MENU = myId+'settingsMenu';
const SS_MENU = myId+'syncShareMenu';
const SS_MENU_POPUP = myId+'syncShareMenuPopUp';
const SS_MENU_SEPARATOR = myId+'menuSeparator';
//const SS_ANOTHER_MENU_SEPARATOR = myId+'anotherMenuSeparator';
const SS_TAB_SEPARTOR = myId+'tabMenuSeparator';
const SHARE_MENU = myId+'shareMenu';
const VIEW_SHARE_MENU = myId+'viewShareMenu';
const HELP_MENU = myId+'syncShareHelpMenu';


function loadIntoWindow(aWindow){
	document = aWindow.document;
	//Add the options in the tool menu:
	var toolBar = document.getElementById('menu_ToolsPopup');
	//Get the main key set:
	//var mainKeySet = document.getElementById('mainKeyset');
	/***********A Separator***********************/
	//var separator = createMenuSeparator('SyncShareToolSeparator');
	//toolBar.appendChild(separator);
	//Create a pop up menu item:
	var menu = document.createElement('menu');
	menu.setAttribute('id',SS_MENU);
	menu.setAttribute('label','Synch & Share Menu');
	var menuPopUp = document.createElement('menupopup');
	menuPopUp.setAttribute('id',SS_MENU_POPUP);
	//Add the Save all Tabs option.
	var anItem = addSaveAllTabsMenu();
	//mainKeySet.appendChild(anItem.key);
	menuPopUp.appendChild(anItem);
	
	
	var anItem = addSyncAllMenu();
	//mainKeySet.appendChild(anItem.key);
	menuPopUp.appendChild(anItem);
	
	//Add the Open... menu option:
	var anItem = addOpenMenu();
	//mainKeySet.appendChild(anItem.key);
	menuPopUp.appendChild(anItem);
	/*************A Separator***********************/
	var separator = createMenuSeparator(SS_MENU_SEPARATOR);
	menuPopUp.appendChild(separator);
	//Add the Share option.
	var anItem = addShareMenu();
	//mainKeySet.appendChild(anItem.key);
	menuPopUp.appendChild(anItem);
	//Add the view Share items
	var anItem = addViewShareMenu();
	//mainKeySet.appendChild(anItem.key);
	menuPopUp.appendChild(anItem);
	/*************A Separator***********************/
	var separator = createMenuSeparator(SS_MENU_SEPARATOR);
	menuPopUp.appendChild(separator);
	//Add the settings options
	var anItem = addSettingsMenu();
	//mainKeySet.appendChild(anItem.key);
	menuPopUp.appendChild(anItem);
	//Add help menu
	var anItem = addHelpMenu();
	//mainKeySet.appendChild(anItem.key);
	menuPopUp.appendChild(anItem);
	menu.appendChild(menuPopUp);
	toolBar.appendChild(menu);
	//Add the tabs context menu:
	addTabMenu();
	
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


function createMenuItem(id,label){
	var menuItem = document.createElement('menuitem');
	menuItem.setAttribute('id',id);
	menuItem.setAttribute('label',label);
	return menuItem;

}

function createMenuSeparator(id){
	var menuSeparator = document.createElement('menuseparator');
	menuSeparator.setAttribute('id',id);	
	return menuSeparator;
}





function shareMenuClicked(){
	share.openShare();

}

function viewSharedClicked(){
		share.viewShare();
	
}



function helpClicked(){
	tabs.open({
		url: data.url('help.html')
	});
	
	var pageModify = pageMod.PageMod({
		include: data.url('help.html'),
		contentStyleFile: data.url('helpStyle.css'),
		contentStyle: images.all
		
	});
}




function addTabMenu() {    
	var tabContextMenu = document.getElementById("tabContextMenu");
	if (!tabContextMenu) {
		var message = {'msg':'Internal browser error!','type':'error'};
		emit(exports,'showMessage',message);
	}
	else{
		var separator = createMenuSeparator(SS_TAB_SEPARTOR);
		tabContextMenu.appendChild(separator);
		
		var currentTab = tabs.activeTab;
		var menuItem = createMenuItem(TAB_MENU,'Save This Tab');
		//menuItem.setAttribute('disabled','true');
		menuItem.addEventListener('command', function(event) {
			currentTab = tabs.activeTab;
			if (currentTab.title == 'Connecting…' && currentTab.url == 'about:blank'){
				currentTab.on('ready',function(thisTab){
					emit(exports,'tabContextClicked',[thisTab]);
				});
		
			}
			else{
				emit(exports,'tabContextClicked',[currentTab]);
			}
					
						
		}, false);
		tabContextMenu.appendChild(menuItem);
	}
	 	  
}


function addSaveAllTabsMenu(){
	var menuitem = createMenuItem(SAVE_TABS_MENU,'Save All Tabs');
	menuitem.addEventListener('command', function(event){
			emit(exports,'saveAllTabsClicked',tabs);
	});

	return menuitem;
}

function addSyncAllMenu(){
	
	
	var syncAllItem = createMenuItem(SYNC_ALL_NOW_MENU,'Sync All Now!');
	syncAllItem.addEventListener('command',function(event){
		emit(exports, 'syncAllNowClicked', null);
	});

	return syncAllItem;
	


}

function addOpenMenu(){
	
	
	var openMenuItem = createMenuItem(SYNCED_ITEMS_MENU,'My Synced Items');
	openMenuItem.addEventListener('command',function(event){
		emit(exports, 'openMenuClicked', 'open');
	});
	return openMenuItem;
	


}

function addSettingsMenu(){
	var settingsMenuItem = createMenuItem(SETTINGS_MENU,'Settings');
	
	settingsMenuItem.addEventListener('command',function(event){

		tabs.open('about:addons');

	});

	return settingsMenuItem;


}

function addHelpMenu(){
	var helpMenuItem = createMenuItem(HELP_MENU,'Help');
	helpMenuItem.addEventListener('command',helpClicked);

	return helpMenuItem;
}


function addShareMenu(){
	var shareMenuItem = createMenuItem(SHARE_MENU,'Share');
	shareMenuItem.addEventListener('command', shareMenuClicked);
	return shareMenuItem;


}

function addViewShareMenu(){
	var viewShareMenuItem = createMenuItem(VIEW_SHARE_MENU,'My Shared Items');
	
	viewShareMenuItem.addEventListener('command', viewSharedClicked);
	return viewShareMenuItem;


}

exports.addAllOptions = function(){
	let windows = mediator.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
	let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
	loadIntoWindow(domWindow);
  }

  // Load into any new windows
  mediator.addListener(windowListener);



}

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


