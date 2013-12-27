/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to control my Django Server.																	|
 ************************************************************************************************************************/
/**********************************************SDK Modules*************************************************************/
var data = require('sdk/self').data;
var Request = require('sdk/request').Request;
var tabs = require('sdk/tabs');
var { emit, on, once, off } = require("sdk/event/core");
var timer = require('sdk/timers');
/**********************************************My modules*************************************************************/
var bookmarks = require('./bookmark');
var history = require('./history');
var myTabs = require('./tabs');
var preferences = require('./preferences');
var dialog = require('./dialog');
var localStorage = require('./localStorage');
var constants = require('./constants');
/**********************************************CONSTANTS of this server*************************************************************/
const URL = constants.URL;
const SAVE_URL = constants.SAVE_URL;
const READ_URL = constants.READ_URL;
const READ_ALL_BOOKMARKS = constants.READ_ALL_BOOKMARKS;
const READ_ALL_HISTORY = constants.READ_ALL_HISTORY;
const READ_ALL_TABS = constants.READ_ALL_TABS;
const CHANGE_DEVICE_NAME = constants.CHANGE_DEVICE_NAME;
const REGISTER = constants.REGISTER;
const ADD_ALL_BOOKMARKS = constants.ADD_ALL_BOOKMARKS;
/**********************************************Variables*************************************************************/
var bookmarksList = new Array();
const INTERVAL_MS = 30*60*1000;	//In milliseconds 30 minutes Update every 30 minutes
var save_interval_id;
var read_interval_id;
var deviceId;
var if_sync_tabs = true;
var if_sync_bookmarks = true;
var if_sync_history = true;
/***********************************************************************************************************************/
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};

/************************************************************************************************************************
@function handleResponse: Handle the response that the  server gives us:
* @param {Response object} response: The response from Django server
*************************************************************************************************************************/
function handleErrors(response){
	if (response.status == '500'){
		var message = {'msg':'Sync & Share: Internal server problem. Try again later!', 'type':'error'};
		emit(exports, 'showMessage',message);	    	
	}
	else if (response.status == '401' && response.headers.error == 'Unauthorized'){
		dialog.loginDialog();	
	}
	else if (response.status == '0'){
		//Server is not connected!
	}
	else{
		var message = {'msg':'Sync & Share: Problem with server. Try again later!','type':'error'};
		emit(exports,'showMessage',message);
	}

}

/**********************************************************************************************************************
@function handleRegister: the register function, check if this device is register or not. If not then register.
***********************************************************************************************************************/
function handleRegister(){
		var registered = localStorage.checkIfRegistered();
		if (registered == false){
				localStorage.setRegistered(true);
		}
}

/**********************************************************************************************************************
@function saveAllBookmarks: Save all the bookmarks of this device by sending them to the server.
1) Retrieve the bookmarks from the bookmarks module (save it to the var datasToSave).
2) When the request is completed, check the response, if everything is OK then the bookmarks were saved successfully.
***********************************************************************************************************************/
function saveAllBookmarks(){
	var datasToSave = bookmarks.getBookmarks();
	var sendURL = ADD_ALL_BOOKMARKS;
	var deviceName = preferences.getDeviceName();
	var saveRequest = Request({
		url: sendURL,
		contentType: 'application/json',
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		content:  JSON.stringify(datasToSave),
		onComplete: function (response) {	
		    	if (response.status == '200'){
		    		var now = new Date();
		    		var nTime = now.getTime();
		    		emit(exports,'allBookmarksSavedInServer',nTime);
		    		handleRegister();	
		    	}
		    	else{
		    		handleErrors(response);
		    	}
	 	}
 	});
	saveRequest.post();
}

exports.saveAllBookmarks = saveAllBookmarks;
/**********************************************************************************************************************
@function saveAllHistory: Save all the history of this device by sending them to the server.
1) Retrieve the history from the history module (save it to the var datasToSave).
2) When the request is completed, check the response, if everything is OK then the history was saved successfully.
***********************************************************************************************************************/
function saveAllHistory(){
	var datasToSave = history.queryHistory();
	var sendURL = constants.ADD_ALL_HISTORY;
	var deviceName = preferences.getDeviceName();
	var saveRequest = Request({
		url: sendURL,
		contentType: 'application/json',
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		content:  JSON.stringify(datasToSave),
		onComplete: function (response) {	
	    	if (response.status == '200'){
	    		var now = new Date();
	    		var nTime = now.getTime();
	    		handleRegister();
	    		emit(exports,'allHistorySavedInServer',nTime);
	    		
	            handleRegister();
	    			
	    	}
	    	else{
	    		handleErrors(response);
	    	}
	 	}
 	});
	saveRequest.post();
}

exports.saveAllHistory = saveAllHistory;

/**********************************************************************************************************************
@function saveTabs: Save all the provided tabs.
@param datasToSave {Array}: An array of tabs to save in the server.
When the request is completed, check the response, if everything is OK then all the tabs were saved successfully.
***********************************************************************************************************************/
function saveTabs(datasToSave){
	var sendURL = constants.ADD_ALL_TABS;
	var deviceName = preferences.getDeviceName();
	var saveRequest = Request({
		url: sendURL,
		contentType: 'application/json',
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		content:  JSON.stringify(datasToSave),
		onComplete: function (response) {	
	    	if (response.status == '200'){
	    		handleRegister();
	    			
	    	}
	    	else{
	    		handleErrors(response);
	    	}
	 	}
 	});
	saveRequest.post();


}
exports.saveTabs = saveTabs;

/************************************************************************************************************************
@function setDeviceId - Set the device id to the given id
*@param {string} id - This device's id
*************************************************************************************************************************/
function setDeviceId(id){
	deviceId = id;
}
exports.setDeviceId = setDeviceId;

/*********************************************************************************************************************************
@function saves: This is for the manual save, when the user clicks anu function like Save all tabs, save this tab, save this bookmark,etc.
@param datas {Object}: It has all the information that this function needs to send the request. Only these are used:
	-@element {String}: Can be 'tabs.json', 'bookmarks.json' or 'history.json'. The element that is going to be saved.
	-@dataToSave {Array}: The list of the element to save. A list of bookmarks, a list of tabs or a list of history
*********************************************************************************************************************************/
function save(datas){
        var element = datas.title.split('.json')[0];
        var dataToSave = datas.dataToSave;
        var deviceName = preferences.getDeviceName();
        var saveRequest = Request({
			url: SAVE_URL + element+'/',
			contentType: 'application/json',
			headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
			content: JSON.stringify(dataToSave),
			onComplete: function (response) {        
				if (response.status == '200'){
					handleRegister();
					var message = new Object();
					message.msg = 'Sync & Share: Saved correctly.'
					message.type = 'correct';
					emit(exports,'showMessage',message);
											 
				}
				else if (response.status == '401' && response.headers.error == 'Unauthorized'){
					var message = {'msg':'Sync & Share: Not signed in. Please sign in!','type':'error'};
					emit(exports,'showMessage',message);
				}
				else if (response.status == '0'){
					var message = {'msg':'Sync & Share: Server not connected. Please try again later!','type':'error'};
					emit(exports,'showMessage',message);
				}		   
				else{
						handleErrors(response);
				}
			 }
         });
        saveRequest.post();
        
}

exports.save = save;

/*********************************************************************************************************************************
@function read: Read the datas that were saved manually by the user.
@param datas {Object}: It has all the information that this function needs to read from the server.
	-@element {String}: Can be 'tabs.json', 'bookmarks.json' or 'history.json'. The element that is going to be read.
*********************************************************************************************************************************/
function read(datas){
	var element = datas.title.split('.json')[0];
	var deviceName = preferences.getDeviceName();
	var URL = READ_URL + element+'/';
	var readRequest = Request({
		url: READ_URL + element+'/',
	headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
	onComplete: function (response) {
		if (response.status == '200'){
			try{
				var readThings = JSON.parse(response.text);
			}
			catch(e){
				var readThings = response.text;
			}
			var toDisplay = new Object();
			toDisplay.server = 'mysite';
			toDisplay.data = readThings;
			toDisplay.element = element;
			emit (exports,'display',toDisplay);
			handleRegister();
        }
        else if (response.status == '500'){
	    	var message = {'msg':'Internal server problem', 'type':'error'};
	    	emit(exports, 'showMessage',message);
		}
		else if (response.status == '404'){
			var toDisplay = new Object();
            toDisplay.server = 'mysite';
            toDisplay.element = element;
            toDisplay.data = null;
	    	emit(exports, 'display', toDisplay);
	    	handleRegister();
		}
		else if (response.status == '401' && response.headers.error == 'Unauthorized'){
			emit(exports, 'notAuthorized', 'Sync & Share');
		}
		else if (response.status == '0'){
			var message = {'msg':'Sync & Share: Server not connected. Please try again later!','type':'error'};
			emit(exports,'showMessage',message);
		}
		else{
			handleErrors(response);
		}
	}
  });
  readRequest.get();	//Make a get request.
}
exports.read = read;
/*********************************************************************************************************************************
@function readAllBookmarks: This function reads all the bookmarks of al devices that this user chose to save in this server. When the server provides us all the user's bookmarks, they need to be handled because they come as json:
@var response.text: Is where all the datas saved
*********************************************************************************************************************************/
function readAllBookmarks(){
	var deviceName = preferences.getDeviceName();
	var readRequest = Request({
		url: READ_ALL_BOOKMARKS,
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		onComplete: function (response) {
			if (response.status == '200'){
				handleRegister();
				var allBookmarks = JSON.parse(response.text);	//Received as string, convert to JSON.
				var listOfBookmarks = new Array();		//To save the received bookmarks here.
				for (var i=0;i<allBookmarks.length;i++){
					/*allBookmarks is an array of following:
						[
						'device':{
							'device_id':a_device_id,
							'device_name':a_device_name
							}
						'bookmarks': [a list of all the bookmarks of the device.]
						]
					*/
					var aBookmark = {}
					var device = allBookmarks[i].device
					aBookmark.device = device;
				
					var thisDeviceBookmarks = new Array();
					for (var j=0;j<allBookmarks[i].bookmarks.length;j++){
						var thisBookmark = JSON.parse(allBookmarks[i].bookmarks[j]);
						thisDeviceBookmarks.push(thisBookmark);
					}
					aBookmark.bookmarks = thisDeviceBookmarks;
					listOfBookmarks.push(aBookmark);
							
				}
				emit(exports, 'allBookmarksReadFromServer', listOfBookmarks);
					
			 }
			 else{
				handleErrors(response);
			 }
		}
	});
	readRequest.get();

}




exports.readAllBookmarks = readAllBookmarks;








/*********************************************************************************************************************************
@function readAllHistory: This function reads all the history of all the devices that this user chose to save in this server. When the server provides us all the user's history, they need to be handled because they come as json:
@var response.text: Is where all the datas saved
*********************************************************************************************************************************/
function readAllHistory(){
	var deviceName = preferences.getDeviceName();
	var readRequest = Request({
		url: READ_ALL_HISTORY,
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		onComplete: function (response) {
			if (response.status == '200'){
				handleRegister();
				var allHistory = JSON.parse(response.text);
				var listOfHistory = new Array();
				for (var i=0;i<allHistory.length;i++){
				/*allHistory is an array of following:
				[
				'device':{
				'device_id':a_device_id,
				'device_name':a_device_name
				}
				'history': [a list of all the history of the device.]
				]
				*/
				var aHistory = {}
				var device = allHistory[i].device
				aHistory.device = device;
				var thisDeviceHistory = new Array();
				for (var j=0;j<allHistory[i].history.length;j++){
				var thisHistory = JSON.parse(allHistory[i].history[j]);
				thisDeviceHistory.push(thisHistory);
				}
				aHistory.history = thisDeviceHistory;
				listOfHistory.push(aHistory);
				}
				emit(exports, 'allHistoryReadFromServer', listOfHistory);

			}
			else{
				handleErrors(response);
			}
		}
   });
   readRequest.get();


}

exports.readAllHistory = readAllHistory;


/*********************************************************************************************************************************
@function readAllTabs: This function reads all the tabs of all the devices that this user chose to save in this server. When the server provides us all the user's tabs, they need to be handled because they come as json:
@var response.text: Is where all the datas saved
*********************************************************************************************************************************/
function readAllTabs(){
    var deviceName = preferences.getDeviceName();

	deviceId = localStorage.getDeviceId();
	var readRequest = Request({
		url: READ_ALL_TABS,
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		onComplete: function (response) {

			if (response.status == '200'){
				handleRegister();
				var allTabs = JSON.parse(response.text);
				var listOfTabs = new Array();
				for (var i=0;i<allTabs.length;i++){

					/*allTabs is an array of following:
					[
					'device':{
					'device_id':a_device_id,
					'device_name':a_device_name
					}
					'tabs': [a list of all the tabs of the device.]
					]
					*/
					var aTab = {}
					var device = allTabs[i].device
					aTab.device = device;
					var thisDeviceTabs = new Array();
					for (var j=0;j<allTabs[i].tabs.length;j++){
					var thisTab = JSON.parse(allTabs[i].tabs[j]);
					thisDeviceTabs.push(thisTab);
					}
					aTab.tabs = thisDeviceTabs;
					listOfTabs.push(aTab);
				}
				emit(exports, 'allTabsReadFromServer', listOfTabs);

			}
			else{
				handleErrors(response);
			}
		}
	});
	readRequest.get();


}

exports.readAllTabs = readAllTabs;
/*********************************************************************************************************************************
@function changeDeviceName: In settings, when the user changes the device name, change it on the server also.
@param new_device_name {String}: Set the device name to this one.
*********************************************************************************************************************************/
function changeDeviceName(new_device_name){
    
	var changeRequest = Request({
		url: CHANGE_DEVICE_NAME,
		headers: {'myName':new_device_name,'myId':deviceId,'type':'desktop'},
		onComplete: function (response) {        
			if (response.status == '200'){
				handleRegister();
			}
			else{
				handleErrors(response);
			}
		}
	 });
	changeRequest.get();
}

/*********************************************************************************************************************************
@function registerMe: Register this device in the Django server.
*********************************************************************************************************************************/
function registerMe(){
	var device_name = preferences.getDeviceName();
	var device_id = localStorage.getDeviceId();
	var register = Request({
		url: REGISTER,
		headers: {'myName':device_name,'myId':device_id,'type':'desktop'},
		onComplete: function (response){
			if (response.status == '200'){
					localStorage.setRegistered(true);
					emit(exports,'registered',true);
			}
			else{
	    		handleErrors(response);
	    	}
		
		
		
		}
		
	
	});
	register.get();


}
exports.registerMe = registerMe;

/*********************************************************************************************************************************
@function saveAll: Save everything, bookmarks and history at once. (Depends on user's preferences). The tabs will be saved automatically, depending on the events trigered by the tabs module.
*********************************************************************************************************************************/
function saveAll(){
	if_sync_history = preferences.getSyncHistory();	//The user chose to sync history, so save it.
	if_sync_bookmarks = preferences.getSyncBookmarks(); //The user chose to sync bookmarks, so save it.
	if (if_sync_bookmarks == true){		//If sync bookmarks then save them
		saveAllBookmarks();
	}
	if (if_sync_history == true){		//If sync history then save them
		saveAllHistory();
	}
}
exports.saveAll = saveAll;
/*********************************************************************************************************************************
@function getAll: Get all the history, bookmarks and tabs that this user has synced from the server. (Depends on the user's preferences).
*********************************************************************************************************************************/
function getAll(){
	if_sync_history = preferences.getSyncHistory();		//User's preference to sync history
	if_sync_bookmarks = preferences.getSyncBookmarks();	//User's preference to sync bookmarks.
	if (if_sync_bookmarks == true){				//If the user chose to syn bookmarks
		readAllBookmarks();
	}
	if (if_sync_history == true){				//If the user chose to sync history.
		readAllHistory();
	}
	if (if_sync_tabs == true){				//If the user chose to syn tabs.
		readAllTabs();
	}
}

exports.getAll = getAll;

/*********************************************************************************************************************************
@function startUp: Called from the main module. Indicated this module to start up. When it starts up, it sets a timer to save and read all bookmarks, history and tabs. It will save and read every 30 minutes.
*********************************************************************************************************************************/
function startUp(){
	save_interval_id = timer.setInterval(saveAll, INTERVAL_MS);
	read_interval_id = timer.setInterval(getAll, INTERVAL_MS)
	myTabs.startUp();					//Tell the tabs module to start up.
	myTabs.on('save',saveTabs);				//Listen for save tabs event.
	preferences.on('deviceNameChanged',changeDeviceName);	//Listen for the device name changed event.
}


/*********************************************************************************************************************************
@function clean: On unload, clear everything, the timer has to be cleared and clear the listeners also.
*********************************************************************************************************************************/
function clean(){
	if (save_interval_id != undefined){
		timer.clearInterval(save_interval_id);
	}
	if (read_interval_id != undefined){
		timer.clearInterval(read_interval_id);
	}
	
	myTabs.removeListener('save');

}
exports.clean = clean;
exports.startUp = startUp;

 
