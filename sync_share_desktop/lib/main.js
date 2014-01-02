/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This is main file, it has access to all my modules and communicates to all my modules.								|
 ************************************************************************************************************************/

/***********************************Load mozilla sdk modules**********************************************************/
const data = require("sdk/self").data;		//This is the addon's relative path to the data folder.
const tabs = require("sdk/tabs");			//Gets all the Firefox's tab control.
const pageMod = require("sdk/page-mod");	//Used to modify a html page.
const timer = require('sdk/timers');		//Module used to put a timer in ms.
/******************************************My modules*****************************************************************/
const bookmarks = require('./bookmark');	//Query this firefox's bookmarks
const history = require('./history');	//Query this firefox's history
const xulControl = require('./xulControl');	//Get all the XUL (browser) controls of this browser.
const contextMenu = require('./contextMenu');//Create and handle the context menu placed in this addon's html page.
const server = require('./serverControl');	//Controls the server where the datas will be saved.
const panel = require("./panelControl");	//Control the panel used to show messages to the user.
const share = require("./share");		//Controls the share option.
const myServer = require("./myServer");	//The server implemented by me.
const preferences = require("./preferences");//Module used to access the user's preferences for this add-on.
const login = require('./dialog');		//Module to control when the user logins in my server.
const localStorage = require('./localStorage');	//This is local storage control module.
const helpPanel = require('./panelWithWidget');	//This is the panel which has the quick start page.
/****************************************Global Variables**************************************************************/
var openMenuTabWorker;						//This worker will be attached to the addon html page.
var myContextMenu;							//This is the context menu that will be displayed when a user right clicks a bookmark or a history in this addon html page.
var panelHelp;								//This is the panel that will control the first messages.
var authenticated = false;					//If the user is authenticated or not.
var pageModify;								//The page modifier of the "My Synced Items" page.
/********************************************Constantes*****************************************************************/
const TABS_FILE = 'tabs.json';				//The file with all the saved tabs will be named this way in the server
const BOOKMARKS_FILE = 'bookmarks.json';	//The file with the saved bookmarks will be named this way in the server.
const HISTORY_FILE = 'history.json';		//The file with the saved history will be named this way in the server.

/************************************************************************************************************************
@function showErrorMessage: This will show an error message. Whenever called, creates an error message and shows it.
*************************************************************************************************************************/
function showErrorMessage(){
	//Create the error message:
	var message = {'msg':'An error has ocurred. May be refreshing your page will help!','type':'error'};
	//Show the error message:
	handleShowMessage(message);
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
@param {Object} messageToShow- object in which the following details are specified:
	--> @param {string} messageToShow.message - This is the message to be displayed in the panel.
	--> @param {string} messageToShow.type - Indicates the type of message to be displayed. Can be of three types:
	* 			-- info: The message is of type information.
	* 			-- error: The message is error type. 
	* 			-- correct: The message is a correct type.
* To know more, see the panelWithMessage.js module. 
*************************************************************************************************************************/
function handleShowMessage(messageToShow){
	
	panelMessage.write(messageToShow);		//Write the message in the panel.
	panelMessage.show();
	//Show it for 5 seconds.
	timer.setTimeout(hidePanel, 5000);	//5 seconds

}

/************************************************************************************************************************
@function hidePanel: To be called after the panel has been shown for 5 seconds.
*************************************************************************************************************************/
function hidePanel(){
	//Hide the panel containing the message.
	panelMessage.hide();
}

/************************************************************************************************************************
@function saveTabs: Function to save the given tabs (tabsToSave parameter). This function will convert the given tabs to
* save in a simple object. If this is not done then we won't be able to pass the parameters through the port as it gives the
* cyclic object value error.
* @param {tabsToSave} Array of Objects: It is an array of tab objects (sdk's object).
*************************************************************************************************************************/
function saveTabs(tabsToSave){
	//Show the loading message
	var message = {};
	message.msg = 'Loading...';
	message.type = 'info';
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
		//Get the table ready, the saved items to be shown are tabs.
		openMenuTabWorker.port.emit('getTableReady','tabs');
		//Make a new object so that the sever module understands the message.
		var newData = new Object();
		newData.title = TABS_FILE;
		server.read(newData);
	}catch(e){
		//If anything goes wrong then show the error message.
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
		//Get the table ready, the saved items to be shown are bookmarks.
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		//Make a new object so that the sever module understands the message.
		var newData = new Object();
		newData.title = BOOKMARKS_FILE;
		server.read(newData);
	}catch(e){
		//If anything goes wrong then show the error message.
		showErrorMessage();
	}
}


/************************************************************************************************************************
@function listSavedHistory: This function will be called when the user clicks the "Saved History" options from the 
* "My Synced Items" page. Tells the myPage.html to get the table ready (clean everything, put the loading message, etc.)
* and then gets the saved datas from all servers.
*************************************************************************************************************************/
function listSavedHistory(){
	try{
		//Get the table ready, the saved items to be shown are history.
		openMenuTabWorker.port.emit('getTableReady','history');
		//Make a new object so that the sever module understands the message.
		var newData = new Object();
		newData.title = HISTORY_FILE;
		server.read(newData);
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
@function getAllBookmarks: When the user clicks the "Bookmarks" option in the "My Synced Items" page then this function
* will be called. This function gets all the bookmarks saved locally and the bookmarks of this device and gives the
* retrieved datas to the content script (myPageScript.js) to process it and show them in the page.
*************************************************************************************************************************/
function getAllBookmarks(){
	try{	
		openMenuTabWorker.port.emit('getTableReady','bookmarks');
		//All bookmarks are going to be saved in an array.
		var allBookmarks = new Array();
		//All the bookmarks of this device: Get them from the bookmarks module.
		var allThisDeviceBookmarks = bookmarks.getBookmarks();
		//Create an object so that the content script can understand it.
		var aBookmark = {};
		//Tell the content script that this information belongs to this device.
		aBookmark.device = createDeviceInfo();
		aBookmark.bookmarks = allThisDeviceBookmarks;
		allBookmarks.push(aBookmark);
		//Get the locally saved bookmarks
		var allSavedBookmarks = localStorage.getAllSavedBookmarks();
		if (allSavedBookmarks != null){
			var allBookmarks = allBookmarks.concat(allSavedBookmarks);
		}
		//Send it to the content script
		openMenuTabWorker.port.emit('takeAllBookmarks',allBookmarks);
	}catch(e){
		//If anything goes wrong then show the error message.
		showErrorMessage();
	}

	
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
	try{	
		
		openMenuTabWorker.port.emit('getTableReady','tabs');
		//Send it to the content script
		openMenuTabWorker.port.emit('takeAllTabs',tabsList);
	}catch(e){
		//If anything goes wrong then show the error message.
		showErrorMessage();
	}


}

/************************************************************************************************************************
@function getAllHistory: When the user clicks the "History" option in the "My Synced Items" page then this function
* will be called. This function gets all the history saved locally and the history of this device and gives the
* retrieved datas to the content script (myPageScript.js) to process it and show them in the page.
*************************************************************************************************************************/
function getAllHistory(){
	//Save them in an array:
	var historyList = new Array();
	//This device's current history:
	var thisHistoryList = history.queryHistory();
	var aHistory= {};
	//This device's information
	aHistory.device = createDeviceInfo();
	aHistory.history = thisHistoryList;
	historyList.push(aHistory);
	//Get the locally saved history:
	var allSavedHistory = localStorage.getAllSavedHistory();
	if (allSavedHistory != null){
		//Merge the saved locally and this device's history:
		var historyList = historyList.concat(allSavedHistory);
	}
	try{	
		openMenuTabWorker.port.emit('getTableReady','history');
		//Give them to the content script.
		openMenuTabWorker.port.emit('takeAllHistory',historyList);
	}catch(e){
		//If something goes wrong.
		showErrorMessage();
	}
}


/************************************************************************************************************************
@function openMenu: This function opens a tab with the menu, that is the "My Synced Items" page. When the page opens the
* a page modifier is attached to it so that we can control it's DOM elements from the addon. This way we can have communication
* between the page and the addon.
*************************************************************************************************************************/
function openMenu(){
	//Open the tab: its content will be myPage.html (located in the data directory)
	tabs.open({
		url: data.url('myPage.html')
	});
	
	pageModify = pageMod.PageMod({
		//Attach this page modifier whenever the myPage.html page opens:
		include: data.url('myPage.html'),
		//Attach the stylesheet to this page.
		contentStyleFile: data.url('myPageStyle.css'),
		//Run the content script only when the page is ready:
		contentScriptWhen: 'ready',
		//The content script that will communicate with us will be:
		contentScriptFile: data.url('myPageScript.js'),
		//When this gets attached we will do:
		onAttach: function onAttach(worker) {
			try{
				openMenuTabWorker = worker;
				//As soon as the page opens, tell the content script to start:
				//Bookmarks: Get the Bookmarks clicked.
				openMenuTabWorker.port.emit('start','Bookmarks');
				//The content script sends us a message when a cell of the table is clicked:
				openMenuTabWorker.port.on('cellClicked',function(clickedElement){
					//The clicked cell's node name
					var nodeName = clickedElement.node;
					//The clicked cell's node id
					var nodeId = clickedElement.id;
					if (nodeId == 'tabsCell'){
						//When the "Tabs" option is clicked
						//Tell the content script to initiate the hidden row.
						openMenuTabWorker.port.emit('initHiddenRow');
						//Get all the tabs to show them to the user:
						getAllTabs();
						
					}
					else if(nodeName == 'Tabs'){
						//When the user clicks the "Tabs option located on the upper side of the table."
						//Get all the tabs to show them to the user:
						getAllTabs();
					}
					else if (nodeName == 'Saved Tabs'){
						//When the "Saved Tabs" option is clicked
						//Get the saved tabs:
						listSavedTabs();
						
					}
					else if (nodeName == 'Bookmarks'){
						//When the bookmarks is clicked
						if (nodeId == 'bookmarksCell'){
							//If the bookmarks is clicked initiate the hidden row (contains more option)
							openMenuTabWorker.port.emit('initHiddenRow');
						}
						//Get all bookmarks
						getAllBookmarks();
					}
					else if (nodeName == 'History'){
						//When the history is clicked:
						if (nodeId == 'historyCell'){
							openMenuTabWorker.port.emit('initHiddenRow');
						}
						//Get all history
						getAllHistory();
					}
					else if (nodeName == 'Saved Bookmarks'){
						// When the saved bookmarks option is clicked:
						listSavedBookmarks();
					}
					else if (nodeName == 'Saved History'){
						//When the saved history is clicked:
						listSavedHistory();
					}			
				});
			}//try
			catch(e){
					//If anything goes wrong!
					var message = {'msg':'Error: Please refresh the page!','type':'error'};
					handleShowMessage(message);
			}
	  	}
	});
}


/************************************************************************************************************************
@function handleDeleteContext: When the user clicks the "Delete This Saved Item!" option:
* @param {Object} nodeToDelete: Contains the following information:
* 	--> {string} nodeToDelete.server: (Can be mysite,dropbox or gapi) The server where the saved item is saved.
* 	--> {string} element: What type of element is it? tabs,bookmarks or history?
* 	--> {string} url: The url to be deleted.
*************************************************************************************************************************/
function handleDeleteContext(nodeToDelete){
	var serverName = nodeToDelete.server;
	var url = nodeToDelete.url;
	var element = nodeToDelete.element;
	//Tell the server to delete this item.
	server.del(serverName,url,element);
}


/************************************************************************************************************************
@function handleContextMenu: When the user clicks the "Save This" option:
* @param {DOM object} clickedNode: Contains all the necessary information to save it.
*************************************************************************************************************************/
function handleContextMenu(clickedNode){
	//Create an object:
	var newData = new Object();
	//The data to save will be the clickedNode:
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
	else if (clickedNode.className == 'tab'){
		newData.title = TABS_FILE;
		newData.dataToSave = dataToSave;
		server.save(newData);
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

function notify(){
		var notifications = require("sdk/notifications");
		notifications.notify({
			title: "Jabberwocky",
			text: "'Twas brillig, and the slithy toves",
			data: "did gyre and gimble in the wabe",
			onClick: function (data) {
				// console.log(this.data) would produce the same result.
			}
		});

}

/************************************************************************************************************************
@function syncAll: When the user clicks the "Sync All Now"
*************************************************************************************************************************/
function syncAll(){
	//Tell my server to save all and read all:
	myServer.saveAll();
	myServer.getAll();	
}


/*************************************************************************************************************************
 * Whenever Firefox loads the addon, this function is called:
 * See https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/load-and-unload.html
 * for more information
 **************************************************************************************************************************/
exports.main = function(options, callbacks) {
    /*Lets save some permanent datas of this add-on in the database provided*/
    //Create the panel which shows the messages to the user:
    panelMessage = panel.Panel();
    //Start the panel which contains the quick start page.
    helpPanel.startUp();
    //Start the preferences control module.
    preferences.startUp();
    //Start the server control:
    server.start();
    //Add all the XUL components in all windows.
    xulControl.addAllOptions();
    //Tell the local storage to give this device an ID
    localStorage.setId();
	//Save the device name locally.
    localStorage.setDeviceName(preferences.getDeviceName());
    if (options.loadReason == 'install' || options.loadReason == 'enable'){
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
    //When the preference module wants to show a message to the user:
    preferences.on('showMessage',handleShowMessage);
    //When the local storage module wants to show a message to the user:
    localStorage.on('showMessage',handleShowMessage);
    //When the server module wants to show a message to the user:
    myServer.on('showMessage',handleShowMessage);
    //Any serve wants to show the user a message
    server.on('showMessage', handleShowMessage);
    //The module xulControl informs us when the user right clicks the tab. 
    xulControl.on('tabContextClicked',saveTabs);
    //The module xulControl informs us when the save all menu item is clicked.
    xulControl.on('saveAllTabsClicked',saveTabs);
    //The module xulControl informs us when the open menu item is clicked.
    xulControl.on('openMenuClicked',openMenu);
    //The module xulControl informs us when the Sync All Now! option is clicked.
	xulControl.on('syncAllNowClicked',syncAll);

    /*Context menu*/
    contextMenu.addContextMenu('Save This');					//Save an item
    contextMenu.addDeleteMenu('Delete This Saved Item!');		//Delete an  item
    contextMenu.on('contextClicked',handleContextMenu);			//When the Save This is clicked
    contextMenu.on('deleteContextClicked',handleDeleteContext);	//When Delete This Item is clicked
   
    //When any server has anything to display to the user, saved items or synced items.
    server.on('display',handleDisplay);
  
};


exports.onUnload = function (reason) {
	/*Remove all the listeners on unload:*/
	console.log(reason);
	if (reason == 'uninstall' || reason == 'disable'){
		myServer.deleteMe();
		localStorage.clear();
	}
	
	xulControl.removeListener('openMenuClicked');
	xulControl.removeListener('tabContextClicked');
	xulControl.removeListener('saveAllTabsClicked');
	xulControl.removeListener('syncAllNowClicked');
	contextMenu.removeListener('contextClicked'); 
	contextMenu.removeListener('deleteContextClicked'); 
	preferences.removeListener('showMessage'); 
	myServer.removeListener('showMessage');  
	server.removeListener('showMessage');
	server.removeListener('display');
	
	
	//Tell the other modules to remove theirs too:
	myServer.clean();
	preferences.clean();
	server.clean();
	localStorage.clean();

};







