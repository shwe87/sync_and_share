/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to save datas locally in the user's drive. This module uses mozilla sdk's module.Learnt from	|
 * https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/simple-storage.html							|
 ************************************************************************************************************************/

/**********************************************SDK Modules*************************************************************/
var ss = require("sdk/simple-storage");		//Permanent variables will be saved here, even the bookmarks,history and tabs.
var { emit, on, once, off } = require("sdk/event/core");
var {Cc, Ci, Cu} = require("chrome");
/********************************************My Modules*****************************************************************/
var myServer = require('./myServer');
var preferences = require('./preferences');
/***********************************************************************************************************************/

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


/************************************************************************************************************************
@function setStarted: This is called by the main function when the user gets logged in for the first time.
* @param {Boolean} if_started: Set the started to this value.
*************************************************************************************************************************/ 
function setStarted (if_started){
		ss.storage.started = if_started;
}
exports.setStarted = setStarted;
/************************************************************************************************************************
@function getStarted: Get the started value from the local storage.
* @return {Boolean} : Return true is started otherwise return false.
*************************************************************************************************************************/ 
function getStarted(){
		if (!ss.storage.started){
			return false;
		}
		else{
			return ss.storage.started;
		}
}
exports.getStarted = getStarted;

/************************************************************************************************************************
@function setRegistered: This is called by the main function when this device gets registered in the django server.
* @param {Boolean} if_registered: Set the started to this value.
*************************************************************************************************************************/
function setRegistered(if_registered){
		ss.storage.registered = if_registered;
}
exports.setRegistered = setRegistered;
/************************************************************************************************************************
@function checkIfRegistered: To see if thie device was registered or not!
* @return {Boolean}: True if registered and if not return false.
*************************************************************************************************************************/
function checkIfRegistered(){
	if (!ss.storage.registered){
			return false;
	}	
	else{
			return ss.storage.registered;
	}
}
exports.checkIfRegistered = checkIfRegistered;
/************************************************************************************************************************
@function setId: This is called by the main function when this add-on starts up. Generates an unique ID and saves it locally,
* everytime a request is send to the django server, then this value has to be send.
*************************************************************************************************************************/
function setId(){
	if (!ss.storage.id){
		//Generate an unique id for each device:
		var uuidGenerator = Cc['@mozilla.org/uuid-generator;1'].
		                  getService(Ci.nsIUUIDGenerator);
		ss.storage.id = uuidGenerator.generateUUID().toString();
		myServer.setDeviceId(ss.storage.id);
	}
	else{
		myServer.setDeviceId(ss.storage.id);
	}
}

exports.setId = setId;
/************************************************************************************************************************
@function moreThanXMinutes: To see if it is more than X minutes. If is so, then it will return true. This function is 
* used to create a interval based call function. Every X minute the addon updates its bookmarks, tabs and history value.
* @param {time in micro} before: The time which has to be compared to now
* @param {time in minutes} x: X minutes. Know if it is more than this minute.
*************************************************************************************************************************/
function moreThanXMinutes(before, x){
	var now = new Date();
	var nTime = now.getTime();	//milliseconds
	var diff = (nTime - before)/1000;	//seconds
	var diffInMins = Math.round(diff/60);	//minutes
	if (diffInMins > x){
		return true;
	}
	else{
		return false;
	}
}

/************************************************************************************************************************
@function getNowTime: Get the now's time in PRTime (time in microseconds since 1st January 1970)
* @return {time in milli} nowTime: now time
*************************************************************************************************************************/
function getNowTime(){
	var now = new Date();
	var nowTime = now.getTime();
	return nowTime;

}
/**********************************************************************************************************************************
@function updateBookmarksSentTime: When myServer module saves all the bookmarks of this device on the server then save the time when the bookmarks were saved in the server. This is done to check later onload if it is necessary to save the bookmarks again. (Have to save bookmarks every 30 minutes).
@param time {PRTime}: microsends expressed from 1 Januray 1970. The last bookmarks sent to server time.
*********************************************************************************************************************************/
function updateBookmarksSentTime(time){
	ss.storage.bookmarksSent = time;

}
/**********************************************************************************************************************************
@function updateHistorySentTime: When myServer module saves all the history of this device on the server then save the time when the history were saved in the server. This is done to check later onload if it is necessary to save the history again. (Have to save history every 30 minutes).
@param time {PRTime}: microsends expressed from 1 Januray 1970. The last history sent to server time.
***********************************************************************************************************************************/
function updateHistorySentTime(time){
	ss.storage.historySent = time;	
}
/*********************************************************************************************************************************
@function saveReadBookmarks: When the server has read all the bookmarks of all devices of this user, save them.
@param listOfBookmarks {Array}: a List of all bookmarks.
*******************************************************************************************************************************/
function saveReadBookmarks(listOfBookmarks){
	if (ss.quotaUsage < 1){
		ss.storage.bookmarks = listOfBookmarks;
		ss.storage.lastBookmarkRead = getNowTime();
	}
}

/*******************************************************************************************************************************
@function saveReadHistory: When the server has read all the history of all devices of this user, save them.
@param listOfHistory {Array}: a List of all history.
********************************************************************************************************************************/
function saveReadHistory(listOfHistory){
	if (ss.quotaUsage < 1){
		ss.storage.history = listOfHistory;
		ss.storage.lastHistoryRead = getNowTime();
	}
}
/*******************************************************************************************************************************
@function saveReadTabs: When the server has read all the tabs of all devices of this user, save them.
@param listOfTabs {Array}: a List of all tabs.
********************************************************************************************************************************/
function saveReadTabs(listOfTabs){
	if (ss.quotaUsage < 1){
		ss.storage.tabs = listOfTabs;
		ss.storage.lastTabRead = getNowTime();
	}
}
/************************************************************************************************************************
@function changeDeviceName: This is called to change the device's name
*************************************************************************************************************************/
function changeDeviceName(deviceName){
	ss.storage.deviceName = deviceName;
}

/************************************************************************************************************************
@function handleDatas: This function looks if everything is up to date.
*************************************************************************************************************************/
function handleDatas(email){
	if (!ss.storage.bookmarksSent){
		//If no bookmarks was saved of this device, then save them in the server.
    	myServer.saveAllBookmarks();
    		
    }
	else{
		//If this device's bookmark was saved then see if it is time to save them again.
		var haveToUpdateB = moreThanXMinutes(ss.storage.bookmarksSent, 30);
		if (haveToUpdateB == true){
			myServer.saveAllBookmarks();
		}
	}
	if (!ss.storage.historySent){
		//If no history was saved in the server, then save it	
		myServer.saveAllHistory();
	
	}
	else{
		//If this device's history was saved then see if it is time to save them again.
		var haveToUpdateH = moreThanXMinutes(ss.storage.historySent, 30); 
		if (haveToUpdateH == true){
			myServer.saveAllHistory();
		}
   	}
    
    
	if (!ss.storage.lastBookmarkRead){
		//If other device's bookmarks were not read
		myServer.readAllBookmarks();
	}
	else{
		//See if its time to update the already read bookmarks
		var haveToUpdateRB = moreThanXMinutes(ss.storage.lastBookmarkRead, 30); 
		if (haveToUpdateRB == true){
			myServer.readAllBookmarks();
		}
	}
	if (!ss.storage.lastHistoryRead){
		//If other device's history were not read
		myServer.readAllHistory();
	}
	else{
		//See if its time to update the already read history
		var haveToUpdateRH = moreThanXMinutes(ss.storage.lastHistoryRead, 30); 
		if (haveToUpdateRH == true){
			myServer.readAllHistory();
	}
	}

	if (!ss.storage.lastTabRead){
		//If other device's rabs were not read
		myServer.readAllTabs();
	}
	else{
		//See if its time to update the already read tabs
		var haveToUpdateRT = moreThanXMinutes(ss.storage.lastTabRead, 30); 
		if (haveToUpdateRT == true){
			myServer.readAllTabs();
	}
	}

}
exports.handleDatas = handleDatas;

/************************************************************************************************************************
@function setDeviceName:Set the device name as indicated by the parameter.
* @param {string} deviceName: The device should be named as this value.
*************************************************************************************************************************/ 
function setDeviceName(deviceName){
	ss.storage.deviceName = deviceName;
}

exports.setDeviceName = setDeviceName;
/************************************************************************************************************************
@function getDeviceId:get the device's Id
* @return {string} id: This device's id saved locally
*************************************************************************************************************************/ 
function getDeviceId(){
	return ss.storage.id;
}
exports.getDeviceId = getDeviceId;
/************************************************************************************************************************
@function getDeviceName:get the device's name
* @return {string} name: This device's name saved locally
*************************************************************************************************************************/ 
function getDeviceName(){
	return ss.storage.deviceName;
}
exports.getDeviceName = getDeviceName;

/************************************************************************************************************************
@function getAllSavedBookmarks:get all bookmarks saved locally
* @return {array of objects}: This device's locally saved bookmarks
*************************************************************************************************************************/ 
function getAllSavedBookmarks(){
	if (ss.storage.bookmarks){
		return ss.storage.bookmarks;
	}
	else{
		//If nothing saved then return null
		return null;
	}

}

exports.getAllSavedBookmarks = getAllSavedBookmarks;
/************************************************************************************************************************
@function getAllSavedHistory:get all history saved locally
* @return {array of objects}: This device's locally saved history
*************************************************************************************************************************/ 
function getAllSavedHistory(){
	if (ss.storage.history){
		return ss.storage.history;
	}
	else{
		//If nothing saved then return null
		return null;
	}

}
exports.getAllSavedHistory = getAllSavedHistory;
/************************************************************************************************************************
@function getAllSavedTabs:get all tabs saved locally
* @return {array of objects}: This device's locally saved tabs
*************************************************************************************************************************/ 
function getAllSavedTabs(){
	if (ss.storage.tabs){
		return ss.storage.tabs;
	}
	else{
		//If nothing saved then return null
		return null;
	}

}

exports.getAllSavedTabs = getAllSavedTabs;


//Listen to preferences. If the user changes the device name then we have to change the device name.
preferences.on('deviceNameChanged',changeDeviceName);
//If the quota exceeds then tell the user that this add-on is just a beta version. For more space, unlink any other  device.
ss.on('OverQuota',function(){
	preferences.turnOffSync();
	var message = {'msg': 'Quota exceeded. Remember this is just a trial version. Unsync some device to make some space.','type':'error'};
	emit(exports,'showMessage',message);
});

//Start up function
function startUp(){
	//when the bookmarks are saved in the server
	myServer.on('allBookmarksSavedInServer',updateBookmarksSentTime);
	//when the history are saved in the server
	myServer.on('allHistorySavedInServer',updateHistorySentTime);
	//when the bookmarks are read from the server
	myServer.on('allBookmarksReadFromServer',saveReadBookmarks);
	//when the history are read from the server
	myServer.on('allHistoryReadFromServer',saveReadHistory);
	//when the tabs are read from the server
	myServer.on('allTabsReadFromServer',saveReadTabs);
	
}
exports.startUp = startUp;

function clear(){
	//Will be called on uninstall or remove.
	delete ss.storage.started;
	delete ss.storage.tabs;
	delete ss.storage.history;
	delete ss.storage.bookmarks;
	delete ss.storage.deviceName;
	delete ss.storage.registered;
	//Don't delete the id to not create another.
	delete ss.storage.lastTabRead;
	delete ss.storage.lastHistoryRead;
	delete ss.storage.lastBookmarkRead;
	delete ss.storage.historySent;
	delete ss.storage.bookmarkSent;
		
}

exports.clear = clear;

function clean(){
	/*Remove listeners*/
	myServer.removeListener('allBookmarksSavedInServer');
	myServer.removeListener('allHistorySavedInServer');
	myServer.removeListener('allBookmarksReadFromServer');
	myServer.removeListener('allHistoryReadFromServer');
	myServer.removeListener('allTabsReadFromServer');
	
}
exports.clean = clean;













