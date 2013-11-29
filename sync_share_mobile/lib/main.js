/***********************************Load mozilla sdk modules**********************************************************/
const data = require("sdk/self").data;		//This is the addon's relative path to the data folder.
const tabs = require("sdk/tabs");		//Gets all the Firefox's tab control.
const pageMod = require("sdk/page-mod");	//Used to modify a html page.
const preferences = require("sdk/simple-prefs");//Module used to access the user's preferences for this add-on.

/******************************************My modules*****************************************************************/
const server = require('./serverControl.js');	//Controls the server where the datas will be saved.
const UIControl = require("./UIControl.js");	//Creates & Controls the user interface
/****************************************Global Variables**************************************************************/
var openMenuTabWorker;				//This worker will be attached to the addon html page.			
var authenticated = false;			//If the user is authenticated or not.
/********************************************Constantes*****************************************************************/
const TABS_FILE = 'tabs.json';			//The file with all the saved tabs will be named this way in the server
const BOOKMARKS_FILE = 'bookmarks.json';	//The file with the saved bookmarks will be named this way in the server.
const HISTORY_FILE = 'history.json';		//The file with the saved history will be named this way in the server.

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
	try{

		var newData = new Object();
		newData.title = TABS_FILE;
		server.read(newData);
	}catch(e){
		showErrorMessage();
	}
	
}

function listSavedBookmarks(){
	try{
		

		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		server.read(newData);
	}catch(e){

		showErrorMessage();
	}

}

function listSavedHistory(){
	try{


		var newData = new Object();
		newData.title = HISTORY_FILE;
		server.read(newData);
	}catch(e){

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
			});
			openMenuTabWorker.port.on('showBookmarks',function(nothing){
				handleShowMessage('Bookmarks clicked!');
				listSavedBookmarks();
			});
			openMenuTabWorker.port.on('showHistory',function(nothing){
				handleShowMessage('History clicked!');
				listSavedHistory();
			});	
	  	}
	});
	
	



}








//var windows = require("sdk/window/utils");

exports.main = function(options, callbacks) {
    //windows.getMostRecentBrowserWindow().alert(options.loadReason);
    //Start the server control:
    server.start();
    
    
    UIControl.startup();
    UIControl.on('menuClicked',openMenu);
    
    UIControl.on('saveTabClicked', saveTabs);
    UIControl.on('saveAllTabsClicked', saveTabs);

    
    
     xulControl.addAllOptions();
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







