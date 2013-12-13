/***********************************Load mozilla sdk modules**********************************************************/
const data = require("sdk/self").data;		//This is the addon's relative path to the data folder.
const tabs = require("sdk/tabs");		//Gets all the Firefox's tab control.
const pageMod = require("sdk/page-mod");	//Used to modify a html page.
const timer = require('sdk/timers');		//Module used to put a timer in ms.
var ss = require("sdk/simple-storage");		//Permanent variables will be saved here, even the bookmarks,history and tabs.
/******************************************My modules*****************************************************************/
const bookmarks = require('./bookmark.js');	//Query this firefox's bookmarks
const history = require('./history.js');	//Query this firefox's history
const xulControl = require('./xulControl.js');	//Get all the XUL (browser) controls of this browser.
const contextMenu = require('./contextMenu.js');//Create and handle the context menu placed in this addon's html page.
const server = require('./serverControl.js');	//Controls the server where the datas will be saved.
const panel = require("./panelControl.js");	//Control the panel used to show messages to the user.
const share = require("./share.js");		//Controls the share option.
const myServer = require("./myServer.js");	//The server implemented by me.
const preferences = require("./preferences.js");//Module used to access the user's preferences for this add-on.
/****************************************Global Variables**************************************************************/
var openMenuTabWorker;				//This worker will be attached to the addon html page.
var myContextMenu;				//This is the context menu that will be displayed when a user right clicks a bookmark or a history in this addon html page.
var panelMessage;				//This is the panel where all the messages will be displayed to the user.
var authenticated = false;			//If the user is authenticated or not.
/********************************************Constantes*****************************************************************/
const TABS_FILE = 'tabs.json';			//The file with all the saved tabs will be named this way in the server
const BOOKMARKS_FILE = 'bookmarks.json';	//The file with the saved bookmarks will be named this way in the server.
const HISTORY_FILE = 'history.json';		//The file with the saved history will be named this way in the server.


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
		console.log('main '+'main: '+"ERROR = " + e.toString());
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
	//console.log('main '+"Tab to save " + clickedTab.title);
	//See if authenticated:
	if (!authenticated){
		//gapi.auth(TABS);
		console.log('main '+'main: '+"Not authenticated");
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
	console.log('main '+'main '+"saveTabs = " + JSON.stringify(dataToSave));
	
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
		console.log('main '+'main '+'listSavedTabs: Sending getTableReady');
		openMenuTabWorker.port.emit('getTableReady','tabs');
		console.log('main '+'main '+'listSavedTabs: gapi.getData');
		var newData = new Object();
		newData.title = TABS_FILE;
		server.read(newData);
		
	}catch(e){
		console.log('main '+'main '+'ERROR!! '+e.toString());
		showErrorMessage();
	}
	
}

function listSavedBookmarks(){
	try{
		console.log('main '+'main '+'listSavedBookmarks: SEnding getTableReady bookmarks');
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		server.read(newData);
	}catch(e){
		console.log('main '+'main '+'ERROR ' + e.toString());
		showErrorMessage();
	}

}

function listSavedHistory(){
	try{
		console.log('main '+'main '+'listSavedHistory: SEnding getTableReady history');
		openMenuTabWorker.port.emit('getTableReady','history');
		var newData = new Object();
		newData.title = HISTORY_FILE;
		server.read(newData);
	}catch(e){
		console.log('main '+'main '+"ERROR " + e.toString());
		showErrorMessage();
	}

}

function getAllBookmarks(){
	console.log('main '+'main '+"GET ALL BOOKMARKS!!!");
	try{	
		console.log('main '+'main '+'getAllBookmarks: Sending: getTableReady bookmarks');	
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		var allBookmarks = new Array();
		var allThisDeviceBookmarks = bookmarks.getBookmarks();
		var aBookmark = {}
		aBookmark.device = {'device_id':ss.storage.id,'device_name':ss.storage.deviceName}
		aBookmark.bookmarks = allThisDeviceBookmarks;
		allBookmarks.push(aBookmark);
		if (ss.storage.bookmarks){
			//allBookmarks.push(ss.storage.bookmarks);
			var allBookmarks = allBookmarks.concat(ss.storage.bookmarks);

		}
		openMenuTabWorker.port.emit('takeAllBookmarks',allBookmarks);
		/*var folderIds = bookmarks.getFoldersId();
		for each (var id in folderIds){
			//console.log('main '+'main '+"<ul>"+bookmarks.nameFolder(id));
			var aParent = {'itemId':'bookmarksList'}
			var aBookmark={'title':bookmarks.nameFolder(id),'itemId':id,'icon':'','parentId':'bookmarksList'}
			var ifFolder = true;
			console.log('main '+'main '+'getAllBookmarks: takeABookmarks send');
			openMenuTabWorker.port.emit('takeABookmark',[aBookmark,ifFolder]);
			//console.log('main '+'main '+"getAllBookmarks: sent takeABookmark "+ aBookmark.title);
			bookmarks.getFoldersChildren(id);

			openMenuTabWorker.port.emit('clean','loading');
				
		}*/
	}catch(e){
		console.log('main '+'getAllBookmarks: Error! ' + e.toString());
		showErrorMessage();
	}

	
}



/*function takeABookmark(bookmarkToShow){
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
			//console.log('main '+"Not a folder.");
			bookmarkToSend.url = aBookmark.uri;
			//favicon.getFavicon(aBookmark.uri);
		}
		openMenuTabWorker.port.emit('takeABookmark',[bookmarkToSend,ifFolder]);
		//console.log('main '+"takeABookmark: sent takeABookmark " + bookmarkToSend.url);
	
	}catch(e){
		console.log('main '+'takeABookmark: Error! '+e.toString());
		showErrorMessage();
	}
	/*var ifFolder = things[1];
	if (ifFolder){
		console.log('main '+"<ul>"+things[0].title);
	}
	else{
		console.log('main '+"<li>"+things[0].title);
	}*/

//}
function getAllTabs(){
	console.log('main '+'Getting tabs....');
	var tabsList = new Array();
	//var thisTabsList = history.queryHistory();
	//var aTab= {}
	//aHistory.device = {'device_id':ss.storage.id,'device_name':'this_device'}
	//aHistory.history = thisHistoryList;
	//historyList.push(aHistory);
	if (ss.storage.tabs){
		//history = JSON.stringify(ss.storage.history);
		//var historyL = JSON.parse(ss.storage.history);
		//var aux = ss.storage.history;
		console.log('main '+ss.storage.tabs.length);
		/*for (var i=0;i<ss.storage.history.length;i++){
			console.log('main '+ss.storage.history[i].device);
			//aux.device = JSON.parse(aux.device);
		}*/
		var tabsList = tabsList.concat(ss.storage.tabs);
		console.log('main '+tabsList.length);
		//console.log('main '+historyList);
		/*for (var j=0;j<tabsList.length;j++){
			console.log('main '+historyList[j]);
			console.log('main '+"**********");
		}*/
		//historyList = JSON.parse(historyList);
	}
	try{	
		openMenuTabWorker.port.emit('getTableReady','tabs');
		openMenuTabWorker.port.emit('takeAllTabs',tabsList);
	}catch(e){
		console.log('main '+"getAllTabs: ERROR! " + e.toString());
		showErrorMessage();
	}


}

//Get all the history.
function getAllHistory(){
	console.log('main '+'Getting history....');
	var historyList = new Array();
	var thisHistoryList = history.queryHistory();
	var aHistory= {}
	aHistory.device = {'device_id':ss.storage.id,'device_name':ss.storage.deviceName}
	aHistory.history = thisHistoryList;
	historyList.push(aHistory);
	if (ss.storage.history){
		//history = JSON.stringify(ss.storage.history);
		//var historyL = JSON.parse(ss.storage.history);
		//var aux = ss.storage.history;
		console.log('main '+ss.storage.history.length);
		/*for (var i=0;i<ss.storage.history.length;i++){
			console.log('main '+ss.storage.history[i].device);
			//aux.device = JSON.parse(aux.device);
		}*/
		var historyList = historyList.concat(ss.storage.history);
		console.log('main '+historyList.length);
		//console.log('main '+historyList);
		for (var j=0;j<historyList.length;j++){
			console.log('main '+historyList[j]);
			console.log('main '+"**********");
		}
		//historyList = JSON.parse(historyList);
	}
	try{	
		openMenuTabWorker.port.emit('getTableReady','history');
		openMenuTabWorker.port.emit('takeAllHistory',historyList);
	}catch(e){
		console.log('main '+"getAllHistory: ERROR! " + e.toString());
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
			console.log('main '+openMenuTabWorker.tab.title);
			openMenuTabWorker.port.emit('start','Bookmarks');
			openMenuTabWorker.port.on('cellClicked',function(clickedElement){
				
				var nodeName = clickedElement.node;
				var nodeId = clickedElement.id;
				console.log('main '+'cellClicked received = ' + clickedElement.node + ','+clickedElement.id);
				if (nodeId == 'tabsCell'){
					console.log('main '+'\r\n\r\n tabsCell');
					//console.log('main '+'Here nodeName = '+nodeName);
					//console.log('main '+'Here nodeId = '+nodeId);
					//List the saved tabs:
					//listSavedTabs();
					getAllTabs();
					
				}
				else if (nodeName == 'Saved Tabs'){
					console.log('main '+'Saved tabs was clicked!!!!');
					console.log('main '+'getAllTabs()');
					getAllTabs();
					listSavedTabs();
				}
				else if (nodeName == 'Bookmarks'){
					if (nodeId == 'bookmarksCell'){
						console.log('main '+'****bookmarksCell****');
						console.log('main '+'Send initHiddenRow');
						openMenuTabWorker.port.emit('initHiddenRow');
					}
					console.log('main '+'\r\n\r\n Bookmarks');
					//console.log('main '+'Here nodeName = '+nodeName);
					//console.log('main '+'Here nodeId = '+nodeId);
					console.log('main '+'Calling getAllBookmarks()');
					getAllBookmarks();
				}
				else if (nodeName == 'History'){
					if (nodeId == 'historyCell'){
						console.log('main '+'****historyCell****');
						console.log('main '+'Send initHiddenRow');
						openMenuTabWorker.port.emit('initHiddenRow');
					}
					console.log('main '+'\r\n\r\n History');
					//console.log('main '+'Here nodeName = '+nodeName);
					//console.log('main '+'Here nodeId = '+nodeId);
					console.log('main '+'Calling getAllHistory()');
					getAllHistory();
				}
				else if (nodeName == 'Saved Bookmarks'){
					console.log('main '+'\r\n\r\n *********Saved Bookmarks');
					//console.log('main '+'Here nodeName = '+nodeName);
					//console.log('main '+'Here nodeId = '+nodeId);
					//console.log('main '+"SAVED BOOKMARKS!");
					listSavedBookmarks();
				}
				else if (nodeName == 'Saved History'){
					console.log('main '+'\r\n\r\n ***********Saved History');
					console.log('main '+'Here nodeName = '+nodeName);
					console.log('main '+'Here nodeId = '+nodeId);
					console.log('main '+"SAVED HISTORY");
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
	
	
	console.log('main '+"Clicked title " + clickedNode.className);
	/*console.log('main '+"LABEL " + contextLabel);*/
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


function moreThanXMinutes(before, x){
	console.log('main '+"Before = "+before);
	var now = new Date();
	var nTime = now.getTime();	//milliseconds
	console.log('main '+"Now = " + nTime);
	var diff = (nTime - before)/1000;	//seconds
	var diffInMins = Math.round(diff/60);	//minutes
	console.log('main '+"Minute diff = " + diffInMins);
	if (diffInMins > x){
		return true;
	}
	else{
		return false;
	}
}

function getNowTime(){
	var now = new Date();
	var nowTime = now.getTime();
	return nowTime;

}

function saveBookmarksUpdated(time){
	if (ss.storage.lastUpdate){
		ss.storage.bookmarkUpdated = time;
	}
	else{
		ss.storage.bookmarkUpdated = time;
	}

}

function saveHistoryUpdated(time){
	if (ss.storage.lastUpdate){
		ss.storage.historyUpdated = time;
	}
	else{
		ss.storage.historyUpdated = time;
	}
}

function updateBookmarks(listOfBookmarks){
	if (!ss.storage.bookmarks){
		ss.storage.bookmarks = listOfBookmarks;
	}
	else{
		ss.storage.bookmarks = listOfBookmarks;
	}

	ss.storage.lastBookmarkRead = getNowTime();
	//console.log('main '+ss.storage.bookmarks);

}

function updateHistory(listOfHistory){
	if (!ss.storage.history){
		ss.storage.history = listOfHistory;
	}
	else{
		ss.storage.history = listOfHistory;
	}
	ss.storage.lastHistoryRead = getNowTime();
	//console.log('main '+ss.storage.history);

}

function updateTabs(listOfTabs){
	if (!ss.storage.tabs){
		ss.storage.tabs = listOfTabs;
	}
	else{
		ss.storage.tabs = listOfTabs;
	}
	ss.storage.lastTabRead = getNowTime();
	//console.log('main '+ss.storage.tabs);

}

function changeDeviceName(deviceName){
	ss.storage.deviceName = deviceName;

}

//var windows = require("sdk/window/utils");

exports.main = function(options, callbacks) {
    //windows.getMostRecentBrowserWindow().alert(options.loadReason);
    /*Lets save some permanent datas of this add-on in the database provided*/
    console.log(" MAIN: Loading reason = " + options.loadReason);
    if (options.loadReason == 'install'){
    	ss.storage.deviceName = 'username-machine';
    
    }
    if (!ss.storage.id){
    		//Generate an unique id for each device:
		var uuidGenerator = Cc['@mozilla.org/uuid-generator;1'].
                          getService(Ci.nsIUUIDGenerator);
                ss.storage.id = uuidGenerator.generateUUID().toString();
                myServer.setDeviceId(ss.storage.id);
		console.log('main '+"Added = " + ss.storage.id);
    }
    else{
    		myServer.setDeviceId(ss.storage.id);
		console.log('main '+"Already saved = " + ss.storage.id);
	
    }
    if (!ss.storage.bookmarkUpdated){
    	//Has never synced:
    	//if (!ss.storage.lastUpdate.bookmarks){
    		//ss.storage.lastUpdate = {'bookmarks':130,'history':130}
    		console.log('main '+"No bookmarks saved have to SAVE BOOKMARKS!");
    		myServer.saveAllBookmarks();
    		
    }
    else{
    	console.log('main :Bookmarks updated = '+ss.storage.bookmarkUpdated);
    	//console.log('main '+ss.storage.historyUpdated);
    	var haveToUpdateB = moreThanXMinutes(ss.storage.bookmarkUpdated, 30);
    	if (haveToUpdateB == true){
    		myServer.saveAllBookmarks();
    		//myServer.readAll();
    	}
    }
    if (!ss.storage.historyUpdated){	
    		//ss.storage.lastUpdate.bookmarks = updated;
    	//}
    	//if (!ss.storage.lastUpdate.history){
    		console.log('main '+"No history saved have to SAVE HISTORY!");
    		myServer.saveAllHistory();
    		
    		//ss.storage.lastUpdate.history = updated;
    	//}
    	
    }
    else{
    	console.log('main '+ss.storage.historyUpdated);
    	var haveToUpdateH = moreThanXMinutes(ss.storage.historyUpdated, 30); 
    	if (haveToUpdateH == true){
    		myServer.saveAllHistory();
    	}
    }
    
    
    if (!ss.storage.lastBookmarkRead){
    	console.log('main '+"No bookmarks read have to READ BOOKMARKS!");
    	myServer.readAllBookmarks();
    }
    else{
    	var haveToUpdateRB = moreThanXMinutes(ss.storage.lastBookmarkRead, 30); 
    	if (haveToUpdateRB == true){
    		myServer.readAllBookmarks();
    	}
    }
    if (!ss.storage.lastHistoryRead){
    	console.log('main '+"No history read have to READ HISTORY!");
    	myServer.readAllHistory();
    }
    else{
    	var haveToUpdateRH = moreThanXMinutes(ss.storage.lastHistoryRead, 30); 
    	if (haveToUpdateRH == true){
    		myServer.readAllHistory();
    	}
    }
    
    if (!ss.storage.lastTabRead){
    	console.log('main '+"No tab read have to READ TABS!");
    	myServer.readAllTabs();
    }
    else{
    	var haveToUpdateRT = moreThanXMinutes(ss.storage.lastTabRead, 30); 
    	if (haveToUpdateRT == true){
    		myServer.readAllTabs();
    	}
    }
    var wiki = require("sdk/widget").Widget({
  	id: "window",
  	label: "Window",
 	 content: "Save all",
 	 onClick: function(){
  		myServer.saveAllBookmarks();
  		myServer.saveAllHistory();
  		myServer.readAllBookmarks();
  		myServer.readAllHistory();
  		myServer.readAllTabs();
  	//panel.show();
  	}
	//wikiPanel.contentURL = "https://en.m.wikipedia.org/"; 
	});
    myServer.startUp();
    myServer.on('updateBookmarks',updateBookmarks);
    myServer.on('updateHistory',updateHistory);
    myServer.on('updateTabs',updateTabs);
    preferences.on('showMessage',handleShowMessage);
    preferences.on('deviceNameChanged',changeDeviceName);
    //Start the server control:
    server.start();
    //Start the preferences mode on:
    preferences.startUp();
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
    myServer.on('savedAllBookmarks',saveBookmarksUpdated);
    myServer.on('savedAllHistory',saveHistoryUpdated);
   
    server.on('showMessage', handleShowMessage);
    server.on('display',handleDisplay);

    
};

exports.onUnload = function (reason) {
	console.log('main '+reason);
	xulControl.removeListener('openMenuClicked');
	xulControl.removeListener('tabContextClicked');
	xulControl.removeListener('shareClicked');
	contextMenu.removeListener('contextClicked');    
	server.removeListener('showMessage');
	server.removeListener('display');
	myServer.clean();
	preferences.clean();
	
	try{
		if (openMenuTabWorker != undefined){
			openMenuTabWorker.destroy();
		}
		if(pageModify != undefined){
			pageModify.destroy();
		}		
	}
	catch(e){
		console.log('main '+"ERROR " + e.toString());
	}
};







