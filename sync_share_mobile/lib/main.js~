/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This is main file, it has access to all my modules and communicates to all my modules.								|
 ************************************************************************************************************************/
/***********************************Load mozilla sdk modules**********************************************************/
const data = require("sdk/self").data;		//This is the addon's relative path to the data folder.
const tabs = require("sdk/tabs");		//Gets all the Firefox's tab control.
const pageMod = require("sdk/page-mod");	//Used to modify a html page.
var ss = require("sdk/simple-storage");		//Permanent variables will be saved here, even the bookmarks,history and tabs.
/******************************************My modules*****************************************************************/
const server = require('./serverControl');	//Controls the server where the datas will be saved.
const UIControl = require("./UIControl");	//Creates & Controls the user interface
const preferences = require("./preferences");//Module used to access the user's preferences for this add-on.
const myServer = require("./myServer");	//The server implemented by me.
const localStorage = require("./localStorage");//This is local storage control module.
const login = require('./dialog');			//Module to control when the user logins in my server.
const share = require('./share');			//Controls the share option.

/****************************************Global Variables**************************************************************/
var openMenuTabWorker;				//This worker will be attached to the addon html page.		
var pageModify;						//The page modifier of the "My Synced Items" page.
var authenticated = false;			//If the user is authenticated or not.
/********************************************Constantes*****************************************************************/
const TABS_FILE = 'tabs.json';			//The file with all the saved tabs will be named this way in the server
const BOOKMARKS_FILE = 'bookmarks.json';	//The file with the saved bookmarks will be named this way in the server.
const HISTORY_FILE = 'history.json';		//The file with the saved history will be named this way in the server.


/************************************************************************************************************************
@function showErrorMessage: This will show an error message. Whenever called, creates an error message and shows it.
*************************************************************************************************************************/
function showErrorMessage(){
	//Create the error message:
	var message = 'An error has ocurred!';
	UIControl.showToast(message);
}


/************************************************************************************************************************
@function handleDisplay: Will display the given parameter in the "My Synced Items" (myPage.html) views.
* This function is called when the module server receives from any server (Sync & Share default server, dropbox or google drive)
* a display request.
@param {Object} toShowDatas- object that contains the datas that has to be displayed in the myPage.html. The objects to be displayed 
* are objects that are saved manually by the user in any of the chosen server by the user.
*************************************************************************************************************************/
function handleDisplay(toShowDatas){
	try{
		//Tell the content script to add these objects to be shown (saved items).
		openMenuTabWorker.port.emit('show',toShowDatas);
		
	}
	catch(e){
		//If anything goes wrong then show the error message!
		showErrorMessage();
	}
}
/************************************************************************************************************************
@function handleShowMessage: Write the message and show it on the panel.
@param {String} messageToShow- The message to show in the toaster
*************************************************************************************************************************/
function handleShowMessage(messageToShow){
	UIControl.showToast(messageToShow);
}


/************************************************************************************************************************
@function saveTabs: Function to save the given tabs (tabsToSave parameter). This function will convert the given tabs to
* save in a simple object. If this is not done then we won't be able to pass the parameters through the port as it gives the
* cyclic object value error.
* @param {tabsToSave} Array of Objects: It is an array of tab objects (sdk's object).
*************************************************************************************************************************/
//Function to save the given tabs
function saveTabs(tabsToSave){
	var message = 'Loading...';
	handleShowMessage(message);
	//Process the tabs to be saved:
	var dataToSave = new Array();
	for each (var tabToSave in tabsToSave){	
		//Create a simple object saving only the values that are necessary.				
		var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
		dataToSave.push(newTab);		
	}
	//Make another object so that the server module can understand.
	var save = new Object();
	save.title = TABS_FILE;
	save.dataToSave = dataToSave;
	//Tell the server to save it.
	server.save(save);
}




/************************************************************************************************************************
@function listSavedTabs: This function will be called when the user clicks the "Saved Tabs" options from the 
* "My Synced Items" page. Tells the myPage.html to get the table ready (clean everything, put the loading message, etc.)
* and then gets the saved datas from all servers.
*************************************************************************************************************************/
function listSavedTabs(){
	try{
		//Make a new object so that the sever module understands the message.
		var newData = new Object();
		newData.title = TABS_FILE;
		server.read(newData);
		//In the mobile version, the saved tabs and the synced tabs are shown in the same page.
		getAllTabs();
	}catch(e){
		//If anything goes wrong then show the error message.
		showErrorMessage();
	}
	
}

/************************************************************************************************************************
@function createDeviceInfo:Create the device info, in order to show them properly in the "My Synced Items" page.
*************************************************************************************************************************/
function createDeviceInfo(){
	//This device's info:
	var deviceInfo = {'this_device':true,'device_id':localStorage.getDeviceId(),'device_name':localStorage.getDeviceName()};
	return deviceInfo;	
}

/************************************************************************************************************************
@function getAllTabs: When the user clicks the "Tabs" option in the "My Synced Items" page then this function
* will be called. This function gets all the tabs saved locally and the open tabs of this device and gives the
* retrieved datas to the content script (myPageScript.js) to process it and show them in the page.
*************************************************************************************************************************/
function getAllTabs(){
	//Save them in an array:
	var tabsList = new Array();
	//Aux array to save the open tabs of this device.
	var aux = new Array();
	tabs = require('sdk/tabs');
	for each(var tab in tabs){
		//Contains only the necessary values of the tabs.
		var auxTab = {'title':tab.title,'url':tab.url};
		aux.push(auxTab);        
	}
	var aTab = new Object();
	//This device's information.
	aTab.device = createDeviceInfo();
	aTab.tabs = aux;
	tabsList.push(aTab);
	//The tabs saved locally:
	var allSavedTabs = localStorage.getAllSavedTabs();
	
	if (allSavedTabs != null){
		//Merge this device's tabs and the saved ones:
		var tabsList = tabsList.concat(allSavedTabs);
	}
	else{
		tabsList = null;
	}
	try{	
		//Send it to the content script
		openMenuTabWorker.port.emit('takeAllTabs',tabsList);
	}catch(e){
		
		showErrorMessage();
	}


}
/************************************************************************************************************************
@function listSavedBookmarks: This function will be called when the user clicks the "Saved Bookmarks" options from the 
* "My Synced Items" page. Tells the myPage.html to get the table ready (clean everything, put the loading message, etc.)
* and then gets the saved datas from all servers.
*************************************************************************************************************************/
function listSavedBookmarks(){
	try{
		//Make a new object so that the sever module understands the message.
		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		server.read(newData);
		getAllBookmarks();
	}catch(e){
		showErrorMessage();
	}

}
/************************************************************************************************************************
@function getAllBookmarks: When the user clicks the "Bookmarks" option in the "My Synced Items" page then this function
* will be called. This function gets all the bookmarks saved locally and gives the
* retrieved datas to the content script (myPageScript.js) to process it and show them in the page.
*************************************************************************************************************************/
function getAllBookmarks(){
	//All bookmarks are going to be saved in an array.
	var bookmarksList = new Array();
	//In mobile version, we can't access the bookmarks of this device.
	//Get the locally saved bookmarks
	var allSavedBookmarks = localStorage.getAllSavedBookmarks();
	if (allSavedBookmarks != null){
		var bookmarksList = bookmarksList.concat(allSavedBookmarks);
	}
	else{
		bookmarksList = null;
	}
	try{	
		//Send it to the content script
		openMenuTabWorker.port.emit('takeAllBookmarks',bookmarksList);
	}catch(e){
		showErrorMessage();
	}


}
/************************************************************************************************************************
@function listSavedHistory: This function will be called when the user clicks the "Saved History" options from the 
* "My Synced Items" page. 
*************************************************************************************************************************/
function listSavedHistory(){
	try{
		//Make a new object so that the sever module understands the message.
		var newData = new Object();
		newData.title = HISTORY_FILE;
		server.read(newData);

		getAllHistory();
	}catch(e){
		
		showErrorMessage();
	}

}
/************************************************************************************************************************
@function getAllHistory: When the user clicks the "History" option in the "My Synced Items" page then this function
* will be called. This function gets all the history saved locally and gives the
* retrieved datas to the content script (myPageScript.js) to process it and show them in the page.
*************************************************************************************************************************/
function getAllHistory(){
	//Save them in an array:
	var historyList = new Array();
	var allSavedHistory = localStorage.getAllSavedHistory();
	//This device's current history:
	if (allSavedHistory != null){
		var historyList = historyList.concat(allSavedHistory);
	}
	else{
		historyList = null;
	}
	try{	
		
		openMenuTabWorker.port.emit('takeAllHistory',historyList);
	}catch(e){
		showErrorMessage();
	}


}


/************************************************************************************************************************
@function openMenu: This function opens a tab with the menu, that is the "My Synced Items" page. When the page opens the
* a page modifier is attached to it so that we can control it's DOM elements from the addon. This way we can have communication
* between the page and the addon.
*************************************************************************************************************************/
//Open the tab with the menu:
function openMenu(msg){
	//Open only if it is already not open.
	var open = true;
	for each(var openTab in tabs){
		if (openTab.url == data.url('myPage.html') || openTab.url == data.url('myPage.html')+'#'){
			//the tab is already open
			open = false;
			//Already open, so just activate it:
			openTab.activate();
			break;
		}
	}
	if (open == true){
		//Open the tab: its content will be myPage.html (located in the data directory)
		tabs.open({
			url: data.url('myPage.html')
		});

		pageModify = pageMod.PageMod({
			//Attach this page modifier whenever the myPage.html page opens:
			include: data.url('myPage.html'),
			//Attach the stylesheet to this page.
			contentStyleFile: [data.url('myPageStyle.css'),data.url("themes/shweta.min.css"),data.url("jquery.mobile.structure-1.4.0.min.css" )],
			contentScriptWhen: 'ready',
			//The content script that will communicate with us will be:
			contentScriptFile: [data.url('myPageScript.js'),data.url("jquery-1.10.2.min.js"),data.url("jquery.mobile-1.4.0.min.js")],
			onAttach: function onAttach(worker) {
				try{
					openMenuTabWorker = worker;
					openMenuTabWorker.port.on('showTabs',function(nothing){
						listSavedTabs();
					});
					openMenuTabWorker.port.on('syncAll',function(nothing){
						myServer.getAll();
					});
					openMenuTabWorker.port.on('showBookmarks',function(nothing){
						listSavedBookmarks();
					});
					openMenuTabWorker.port.on('showHistory',function(nothing){
						listSavedHistory();
					});	
					openMenuTabWorker.port.on('share',function(nothing){
						share.openShare();
					});
					openMenuTabWorker.port.on('saveTabs',function(nothing){
						saveTabs(tabs);
					});
					openMenuTabWorker.port.on('help',function(nothing){
						tabs.open(data.url('help.html'));
					});
				}
				catch(e){
					var message = "Please refresh this page again!";
					handleShowMessage(message);
				}
			}
		});
	}

	
	



}
/************************************************************************************************************************
@function startDatas: Start all the necessary datas on startup:
* @param {string} email: Passed when the log in dialog calls this function.
*************************************************************************************************************************/
function startDatas(email){
	//Check if this device was already registered or not:
	var registered = localStorage.checkIfRegistered();
	//If not registered then register it:
	if (registered == false){
		myServer.on('registered',function(if_registered){
			localStorage.startUp();
			myServer.startUp();
			localStorage.handleDatas(email);
			myServer.removeListener('registered');
		});
		//Register me
		myServer.registerMe();
	}
	
	if (email){
		//When the user logs in then set the parameter started to true:
		localStorage.setStarted(true);
		//Stop listening to the logged in function:
		login.removeListener('loggedIn');
	}
	
	
}

/*************************************************************************************************************************
 * Whenever Firefox loads the addon, this function is called:
 * See https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/load-and-unload.html
 * for more information
 **************************************************************************************************************************/
exports.main = function(options, callbacks) {
	 /*Lets save some permanent datas of this add-on in the database provided*/
   //Start the preferences control module.
    preferences.startUp();
    //Start the server control:
    server.start();
    //Star the UI control (Android)
    UIControl.startup();
    //Tell the local storage to give this device an ID
    localStorage.setId();
    //Save the device name locally.
    localStorage.setDeviceName(preferences.getDeviceName());
    //myTabs.avoidDuplicates();
    if (options.loadReason == 'install'){
    	//If it is being installed:
    	login.loginDialog();				//Open the login dialog.
    	login.on('loggedIn',startDatas);	//Listen for the module to tell us that the user has logged in.
    }
    else{
		//See if the user has logged in on this device ever:
		var started = localStorage.getStarted();
		//Is already started then do a normal start:
		if (started == true){
			//See is this device has been registered in the server.
			var registered = localStorage.checkIfRegistered();
			if (registered == true){
				//If alread registered, start the local storage
				localStorage.startUp();
				//Start the server
				myServer.startUp();
				//Tell the local storage to handle the datas.
				localStorage.handleDatas(null);
			}
			else{
				//If not then register me.
				startDatas(null);
			}
		}
		else{
				//If  never logged in the open the log in dialog.
				login.loginDialog();
				login.on('loggedIn',startDatas);
		}
    }
    
    
    /*Listen for the events*/
    //When the server module wants to show a message to the user:
    myServer.on('showMessage',handleShowMessage);
    //The UI control module tells us when the user clicks the Sync & Share Menu option
    UIControl.on('menuClicked',openMenu);
    //The UI Control module tells us when the user clicks the Save Tabs Option.
    UIControl.on('saveTabClicked', saveTabs);
    //The UI Control module tells us when the user clicks the Save All Tabs option.
    UIControl.on('saveAllTabsClicked', saveTabs);
	//When the preference module wants to show a message to the user:
	preferences.on('showMessage',handleShowMessage);
    //Any serve wants to show the user a message
    server.on('showMessage', handleShowMessage);
    //When any server has anything to display to the user, saved items or synced items.
    server.on('display',handleDisplay);

    
};

exports.onUnload = function (reason) {
    if (reason == 'uninstall' || reason == 'disable'){
		myServer.deleteMe();
		localStorage.clear();
	}
	//Tell others to remove their listeners
	localStorage.clean();
    preferences.clean();
    myServer.clean();
    server.clean();
    UIControl.removeListener('menuClicked');
    //The UI Control module tells us when the user clicks the Save Tabs Option.
    UIControl.removeListener('saveTabClicked');
    //The UI Control module tells us when the user clicks the Save All Tabs option.
    UIControl.removeListener('saveAllTabsClicked');
	myServer.removeListener('showMessage');  
	server.removeListener('showMessage');
	server.removeListener('display');
};







