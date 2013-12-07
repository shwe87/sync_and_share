/***********************************Load mozilla sdk modules**********************************************************/
const data = require("sdk/self").data;		//This is the addon's relative path to the data folder.
const tabs = require("sdk/tabs");		//Gets all the Firefox's tab control.
const pageMod = require("sdk/page-mod");	//Used to modify a html page.
const timer = require('sdk/timers');		//Module used to put a timer in ms.
const preferences = require("sdk/simple-prefs");//Module used to access the user's preferences for this add-on.
/******************************************My modules*****************************************************************/
const bookmarks = require('./bookmark.js');	//Query this firefox's bookmarks
const history = require('./history.js');	//Query this firefox's history
const xulControl = require('./xulControl.js');	//Get all the XUL (browser) controls of this browser.
const contextMenu = require('./contextMenu.js');//Create and handle the context menu placed in this addon's html page.
const server = require('./serverControl.js');	//Controls the server where the datas will be saved.
const panel = require("./panelControl.js");	//Control the panel used to show messages to the user.
const share = require("./share.js");
const myServer = require("./myServer.js");
/****************************************Global Variables**************************************************************/
var openMenuTabWorker;				//This worker will be attached to the addon html page.
var myContextMenu;				//This is the context menu that will be displayed when a user right clicks a bookmark or a history in this addon html page.
var panelMessage;				//This is the panel where all the messages will be displayed to the user.
var authenticated = false;			//If the user is authenticated or not.
/********************************************Constantes*****************************************************************/
const TABS_FILE = 'tabs.json';			//The file with all the saved tabs will be named this way in the server
const BOOKMARKS_FILE = 'bookmarks.json';	//The file with the saved bookmarks will be named this way in the server.
const HISTORY_FILE = 'history.json';		//The file with the saved history will be named this way in the server.

var ss = require("sdk/simple-storage");
var {Cc, Ci, Cu} = require("chrome");
/*
tabs.open('www.urjc.es');
tabs.open('www.gmail.com');
tabs.open('www.google.com');
tabs.open('www.mozilla.org');
tabs.open('www.hotmail.com');
tabs.open('www.facebook.com');
tabs.open('http://www.urjc.es/alumnos/');
*/

function showErrorMessage(){
	var message = {'msg':'An error has ocurred!','type':'error'};
	handleShowMessage(message);
}


/************************************************************************************************************************
@function handleDisplay: Write in the given data file.
@param {Object} writeDatas- object in which the following details are specified:
	--> @param {string} writeDatas.title - the file's title: can be tabs.json, bookmarks.json or history.json
	--> @param {string} writeDatas.token - the  
*************************************************************************************************************************/
function handleDisplay(toShowDatas){
	try{
		openMenuTabWorker.port.emit('show',toShowDatas);
	}
	catch(e){
		console.log("ERROR = " + e.toString());
		showErrorMessage();
	}
}

function handleShowMessage(messageToShow){
	/*if (messageToShow.type == 'info'){
		panelWithWidget.write(messageToShow);
		panelWithWidget.show();
	}
	else{*/
		panelMessage.write(messageToShow);
		panelMessage.show();
		timer.setTimeout(hidePanel, 5000);	//5 seconds
	//}
}



//Function to save the given tabs
function saveTabs(tabsToSave){
	//console.log("Tab to save " + clickedTab.title);
	//See if authenticated:
	if (!authenticated){
		//gapi.auth(TABS);
		console.log("Not authenticated");
	}
	var message = {};
	message.msg = 'Loading...';
	message.type = 'info';
	handleShowMessage(message);
	//Get the favicon icon:
	var dataToSave = new Array();
	for each (var tabToSave in tabsToSave){				
		var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
		dataToSave.push(newTab);	
		
	}
	console.log("saveTabs = " + JSON.stringify(dataToSave));
	
	var save = new Object();
	save.title = TABS_FILE;
	save.dataToSave = dataToSave;
	server.save(save);
	

}


function hidePanel(){
	panelMessage.hide();
}


function listSavedTabs(){
	try{
		console.log('listSavedTabs: Sending getTableReady');
		openMenuTabWorker.port.emit('getTableReady','tabs');
		console.log('listSavedTabs: gapi.getData');
		var newData = new Object();
		newData.title = TABS_FILE;
		server.read(newData);
	}catch(e){
		console.log('ERROR!! '+e.toString());
		showErrorMessage();
	}
	
}

function listSavedBookmarks(){
	try{
		console.log('listSavedBookmarks: SEnding getTableReady bookmarks');
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		server.read(newData);
	}catch(e){
		console.log('ERROR ' + e.toString());
		showErrorMessage();
	}

}

function listSavedHistory(){
	try{
		console.log('listSavedHistory: SEnding getTableReady history');
		openMenuTabWorker.port.emit('getTableReady','history');
		var newData = new Object();
		newData.title = HISTORY_FILE;
		server.read(newData);
	}catch(e){
		console.log("ERROR " + e.toString());
		showErrorMessage();
	}

}

function getAllBookmarks(){
	console.log("GET ALL BOOKMARKS!!!");
	try{	
		console.log('getAllBookmarks: Sending: getTableReady bookmarks');	
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		var folderIds = bookmarks.getFoldersId();
		for each (var id in folderIds){
			//console.log("<ul>"+bookmarks.nameFolder(id));
			var aParent = {'itemId':'bookmarksList'}
			var aBookmark={'title':bookmarks.nameFolder(id),'itemId':id,'icon':'','parentId':'bookmarksList'}
			var ifFolder = true;
			console.log('getAllBookmarks: takeABookmarks send');
			openMenuTabWorker.port.emit('takeABookmark',[aBookmark,ifFolder]);
			//console.log("getAllBookmarks: sent takeABookmark "+ aBookmark.title);
			bookmarks.getFoldersChildren(id);

			openMenuTabWorker.port.emit('clean','loading');
				
		}
	}catch(e){
		console.log('getAllBookmarks: Error! ' + e.toString());
		showErrorMessage();
	}

	
}



function takeABookmark(bookmarkToShow){
	try{
		var aBookmark = bookmarkToShow[0];
		var ifFolder = bookmarkToShow[1];
		var bookmarkToSend = {};
		bookmarkToSend.itemId = aBookmark.itemId;
		bookmarkToSend.title = aBookmark.title;
		bookmarkToSend.icon = aBookmark.icon;
		bookmarkToSend.parentId = aBookmark.parent.itemId;
		if (!ifFolder){
			//If not a folder, then there is an url
			//console.log("Not a folder.");
			bookmarkToSend.url = aBookmark.uri;
			//favicon.getFavicon(aBookmark.uri);
		}
		openMenuTabWorker.port.emit('takeABookmark',[bookmarkToSend,ifFolder]);
		//console.log("takeABookmark: sent takeABookmark " + bookmarkToSend.url);
	
	}catch(e){
		console.log('takeABookmark: Error! '+e.toString());
		showErrorMessage();
	}
	/*var ifFolder = things[1];
	if (ifFolder){
		console.log("<ul>"+things[0].title);
	}
	else{
		console.log("<li>"+things[0].title);
	}*/

}

//Get all the history.
function getAllHistory(){
	console.log('Getting history....');
	var historyList = history.queryHistory();
	try{	
		openMenuTabWorker.port.emit('getTableReady','history');
		openMenuTabWorker.port.emit('takeAllHistory',historyList);
	}catch(e){
		console.log("getAllHistory: ERROR! " + e.toString());
		showErrorMessage();
	}


}
var pageModify;
//Open the tab with the menu:
function openMenu(msg){
	tabs.open({
		url: data.url('myPage.html')
	});
	/*tabs.on('load', function(tab) {
		listSavedTabs();
	});*/	
	
	pageModify = pageMod.PageMod({
		include: data.url('myPage.html'),
		contentStyleFile: data.url('myPageStyle.css'),
		contentScriptWhen: 'ready',
		contentScriptFile: data.url('myPageScript.js'),
		onAttach: function onAttach(worker) {
			openMenuTabWorker = worker;
			console.log(openMenuTabWorker.tab.title);
			openMenuTabWorker.port.emit('start','Bookmarks');
			openMenuTabWorker.port.on('cellClicked',function(clickedElement){
				
				var nodeName = clickedElement.node;
				var nodeId = clickedElement.id;
				console.log('cellClicked received = ' + clickedElement.node + ','+clickedElement.id);
				if (nodeId == 'tabsCell'){
					console.log('\r\n\r\n tabsCell');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					//List the saved tabs:
					listSavedTabs();
					
				}
				else if (nodeName == 'Bookmarks'){
					if (nodeId == 'bookmarksCell'){
						console.log('****bookmarksCell****');
						console.log('Send initHiddenRow');
						openMenuTabWorker.port.emit('initHiddenRow');
					}
					console.log('\r\n\r\n Bookmarks');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					console.log('Calling getAllBookmarks()');
					getAllBookmarks();
				}
				else if (nodeName == 'History'){
					if (nodeId == 'historyCell'){
						console.log('****historyCell****');
						console.log('Send initHiddenRow');
						openMenuTabWorker.port.emit('initHiddenRow');
					}
					console.log('\r\n\r\n History');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					console.log('Calling getAllHistory()');
					getAllHistory();
				}
				else if (nodeName == 'Saved Bookmarks'){
					console.log('\r\n\r\n *********Saved Bookmarks');
					//console.log('Here nodeName = '+nodeName);
					//console.log('Here nodeId = '+nodeId);
					//console.log("SAVED BOOKMARKS!");
					listSavedBookmarks();
				}
				else if (nodeName == 'Saved History'){
					console.log('\r\n\r\n ***********Saved History');
					console.log('Here nodeName = '+nodeName);
					console.log('Here nodeId = '+nodeId);
					console.log("SAVED HISTORY");
					listSavedHistory();
				}
				
				
			});
			//openMenuWorker.port.emit('msg','Hola');
	  	}
	});



}



//Handle the context menu:
function handleContextMenu(clickedDetails){
	var clickedNode = clickedDetails[0];
	var contextLabel = clickedDetails[1];
	
	
	console.log("Clicked title " + clickedNode.className);
	/*console.log("LABEL " + contextLabel);*/
	var newData = new Object();
	var dataToSave = [clickedNode];
	if ( clickedNode.className == 'bookmark'){
		newData.title = BOOKMARKS_FILE;
		newData.dataToSave = dataToSave;
		server.save(newData);
	}
	else if (clickedNode.className == 'history'){
		newData.title = HISTORY_FILE;
		newData.dataToSave = dataToSave;
		server.save(newData);
	}
}





var windows = require("sdk/window/utils");

exports.main = function(options, callbacks) {
    //windows.getMostRecentBrowserWindow().alert(options.loadReason);
    if (!ss.storage.id){
		var uuidGenerator = Cc['@mozilla.org/uuid-generator;1'].
                          getService(Ci.nsIUUIDGenerator);
                ss.storage.id = uuidGenerator.generateUUID().toString();
		console.log("Added = " + ss.storage.id);
	}
	else{
		console.log("Already saved = " + ss.storage.id);
	
	}
	myServer.startUp(ss.storage.id);
    //If the reason is download then:
    var myWidget = require("sdk/widget").Widget({
 		 id: "myWidget",
  		label: "Django test",
  		width:60,
 		 content: "Bookmarks",
  		contentScriptWhen: 'ready',
  		onClick: myServer.getBookmarks
  	});
    //Start the server control:
    server.start();
    //Create the panel:
    panelMessage = panel.Panel();
    //Add the tab context menu:
    xulControl.addAllOptions();
    //Add the save all tabs menu item in the tool menu
    //xulControl.addSaveAllTabsMenu();
     
    /*Listen for the events*/
    //The module xulControl informs us when the user right clicks the tab. 
    xulControl.on('tabContextClicked',saveTabs);
    //The module xulControl informs us when the save all menu item is clicked.
    xulControl.on('saveAllTabsClicked',saveTabs);
    //The module xulControl informs us when the open menu item is clicked.
    xulControl.on('openMenuClicked',openMenu);
    //The module xulControl informs us when the share menu is clicked.
    xulControl.on('shareClicked', share.openShare);
    
    //Whenever the context menu is clicked:
    contextMenu.addContextMenu('Save this');
    contextMenu.on('contextClicked',handleContextMenu);
    
    //Whenever the bookmark sends us information:
    //bookmarks.on('take',takeABookmark);
    
    server.on('showMessage', handleShowMessage);
    server.on('display',handleDisplay);

    
};

exports.onUnload = function (reason) {
	console.log(reason);
	try{
		if (openMenuTabWorker != undefined){
			openMenuTabWorker.destroy();
		}
		if(pageModify != undefined){
			pageModify.destroy();
		}		
	}
	catch(e){
		console.log("ERROR " + e.toString());
	}
};







