/***********************************Load mozilla sdk modules**********************************************************/
const data = require("sdk/self").data;		//This is the addon's relative path to the data folder.
const tabs = require("sdk/tabs");		//Gets all the Firefox's tab control.
const pageMod = require("sdk/page-mod");	//Used to modify a html page.
var ss = require("sdk/simple-storage");		//Permanent variables will be saved here, even the bookmarks,history and tabs.
/******************************************My modules*****************************************************************/
const server = require('./serverControl.js');	//Controls the server where the datas will be saved.
const UIControl = require("./UIControl.js");	//Creates & Controls the user interface
const preferences = require("./preferences.js");
const myServer = require("./myServer.js");	//The server implemented by me.
const localStorage = require("./localStorage.js");
const login = require('./dialog.js');
/****************************************Global Variables**************************************************************/
var openMenuTabWorker;				//This worker will be attached to the addon html page.			
var authenticated = false;			//If the user is authenticated or not.
/********************************************Constantes*****************************************************************/
const TABS_FILE = 'tabs.json';			//The file with all the saved tabs will be named this way in the server
const BOOKMARKS_FILE = 'bookmarks.json';	//The file with the saved bookmarks will be named this way in the server.
const HISTORY_FILE = 'history.json';		//The file with the saved history will be named this way in the server.

var {Cc, Ci, Cu} = require("chrome");
/*const xulControl = require('./xulControl.js');*/


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
        var message = 'An error has ocurred!';
        UIControl.showToast(message);
        //console.log('Message Error');
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
		//console.log("ERROR = " + e.toString());
		showErrorMessage();
	}
}

function handleShowMessage(messageToShow){
	UIControl.showToast(messageToShow);
	//console.log("Message " + messageToShow);
}



//Function to save the given tabs
function saveTabs(tabsToSave){
	var message = 'Loading...';
	handleShowMessage(message);
	//Get the favicon icon:
	var dataToSave = new Array();
	for each (var tabToSave in tabsToSave){				
		var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
		dataToSave.push(newTab);		
	}
	var save = new Object();
	save.title = TABS_FILE;
	save.dataToSave = dataToSave;
	server.save(save);
}





function listSavedTabs(){
	console.log("Main: list saved tabs");
	try{
		console.log("MAin: new object");
		var newData = new Object();
		console.log("MAIN: TABS_FILE");
		newData.title = TABS_FILE;
		console.log("MAIN: read");
		server.read(newData);
		console.log("Going to call getAllTabs");
		getAllTabs();
	}catch(e){
		showErrorMessage();
	}
	
}
function getAllTabs(){
	console.log('main '+'Getting tabs....');
	var tabsList = new Array();
	var allSavedTabs = localStorage.getAllSavedTabs();
	console.log("MAIN: Got from localStorage " + JSON.stringify(allSavedTabs));
	console.log("MAIN: Got from localStorage = " + allSavedTabs.length);
	if (allSavedTabs != null){
		var tabsList = tabsList.concat(allSavedTabs);
		console.log('main '+tabsList.length);
	}
	try{	
		openMenuTabWorker.port.emit('takeAllTabs',tabsList);
	}catch(e){
		console.log('main '+"getAllTabs: ERROR! " + e.toString());
		showErrorMessage();
	}


}

function listSavedBookmarks(){
	try{
		

		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		server.read(newData);
		getAllBookmarks();
	}catch(e){

		showErrorMessage();
	}

}
function getAllBookmarks(){
	console.log('main '+'Getting bookmarks....');
	var bookmarksList = new Array();
	var allSavedBookmarks = localStorage.getAllSavedBookmarks();
	console.log("MAIN: Got from localStorage " + JSON.stringify(allSavedBookmarks));
	console.log("MAIN: Got from localStorage = " + allSavedBookmarks.length);
	if (allSavedBookmarks != null){
		var bookmarksList = bookmarksList.concat(allSavedBookmarks);
		console.log('main '+ bookmarksList.length);
	}
	try{	
		openMenuTabWorker.port.emit('takeAllBookmarks',bookmarksList);
	}catch(e){
		console.log('main '+"getAllBookmarks: ERROR! " + e.toString());
		showErrorMessage();
	}


}

function listSavedHistory(){
	try{


		var newData = new Object();
		newData.title = HISTORY_FILE;
		server.read(newData);
		getAllHistory();
	}catch(e){

		showErrorMessage();
	}

}
function getAllHistory(){
	console.log('main '+'Getting history....');
	var historyList = new Array();
	var allSavedHistory = localStorage.getAllSavedHistory();
	console.log("MAIN: Got from localStorage history" + JSON.stringify(allSavedHistory));
	console.log("MAIN: Got from localStorage history = " + allSavedHistory.length);
	if (allSavedHistory != null){
		var historyList = historyList.concat(allSavedHistory);
		console.log('main '+ historyList.length);
	}
	try{	
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
	
	
	pageModify = pageMod.PageMod({
		include: data.url('myPage.html'),
		contentStyleFile: data.url('myPageStyle.css'),
		contentScriptWhen: 'ready',
		contentScriptFile: data.url('myPageScript.js'),
		onAttach: function onAttach(worker) {
			
			openMenuTabWorker = worker;
			openMenuTabWorker.port.on('showTabs',function(nothing){
				handleShowMessage('Tabs clicked!');
				listSavedTabs();
				//getAllTabs();
			});
			openMenuTabWorker.port.on('showBookmarks',function(nothing){
				handleShowMessage('Bookmarks clicked!');
				listSavedBookmarks();
			});
			openMenuTabWorker.port.on('showHistory',function(nothing){
				handleShowMessage('History clicked!');
				listSavedHistory();
			});	
			openMenuTabWorker.port.on('share',function(nothing){
				tabs.open('http://192.168.1.16:8001/share/');
			});
			openMenuTabWorker.port.on('saveTabs',function(nothing){
				saveTabs(tabs);
			});
	  	}
	});
	
	



}

function startDatas(email){
	console.log("LOGGED IN!!!");
	//localStorage.handleDatas(email);
	localStorage.startUp();
	myServer.startUp();
	
	//myServer.getAll();
	localStorage.handleDatas(email);
	login.removeListener('loggedIn');
	
}

function notify(){
	var notifications = require("sdk/notifications");
notifications.notify({
  title: "Jabberwocky",
  text: "'Twas brillig, and the slithy toves",
  data: "did gyre and gimble in the wabe",
  onClick: function (data) {
    console.log(data);
    // console.log(this.data) would produce the same result.
  }
});

}


//var windows = require("sdk/window/utils");

exports.main = function(options, callbacks) {
    //windows.getMostRecentBrowserWindow().alert(options.loadReason);
    //Start the server control:
	//handleShowMessage("Start!");
    notify();
    preferences.startUp();
    server.start();
    UIControl.startup();
    
    if (options.loadReason == 'install'){
    	localStorage.setDeviceName('username-android');
    	localStorage.setId();
    	login.loginDialog();
    	login.on('loggedIn',startDatas);
    	
    
    }
    else{
    	myServer.startUp();
    	localStorage.setId();
    	localStorage.handleDatas(null);
    }
    
    
    
    myServer.on('showMessage',handleShowMessage);
    myServer.on('display',handleDisplay);
    
    
    
    UIControl.on('menuClicked',openMenu);
    
    UIControl.on('saveTabClicked', saveTabs);
    UIControl.on('saveAllTabsClicked', saveTabs);
    
    
    
     //xulControl.addAllOptions();
     preferences.on('showMessage',handleShowMessage);
     
     //preferences.on('deviceNameChanged',changeDeviceName);
    //Add the save all tabs menu item in the tool menu
    //xulControl.addSaveAllTabsMenu();
     
    /*Listen for the events*/
    //The module xulControl informs us when the user right clicks the tab.
    /*xulControl.on('tabContextClicked',saveTabs);
    //The module xulControl informs us when the save all menu item is clicked.
    xulControl.on('saveAllTabsClicked',saveTabs);
    //The module xulControl informs us when the open menu item is clicked.
    xulControl.on('openMenuClicked',openMenu);*/
    
    server.on('showMessage', handleShowMessage);
    server.on('display',handleDisplay);

    
};

exports.onUnload = function (reason) {
        //UIControl.showToast(reason);
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
		showErrorMessage();
	}
};







