var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};
var ss = require("sdk/simple-storage");		//Permanent variables will be saved here, even the bookmarks,history and tabs.

var {Cc, Ci, Cu} = require("chrome");

var myServer = require('./myServer.js');
var preferences = require('./preferences.js');




function setId(){
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
}

exports.setId = setId;

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

/*********************************************************************************************************************************
@function saveReadBookmarks: When the server has read all the bookmarks of all devices of this user, save them.
@param listOfBookmarks {Array}: a List of all bookmarks.
*******************************************************************************************************************************/
function saveReadBookmarks(listOfBookmarks){
	ss.storage.bookmarks = listOfBookmarks;
	ss.storage.lastBookmarkRead = getNowTime();
}

/*******************************************************************************************************************************
@function saveReadHistory: When the server has read all the history of all devices of this user, save them.
@param listOfHistory {Array}: a List of all history.
********************************************************************************************************************************/
function saveReadHistory(listOfHistory){
	ss.storage.history = listOfHistory;
	ss.storage.lastHistoryRead = getNowTime();
}
/*******************************************************************************************************************************
@function saveReadTabs: When the server has read all the tabs of all devices of this user, save them.
@param listOfTabs {Array}: a List of all tabs.
********************************************************************************************************************************/
function saveReadTabs(listOfTabs){
	console.log("localStorage: Save tabs!!! " + JSON.stringify(listOfTabs));
	ss.storage.tabs = listOfTabs;
	ss.storage.lastTabRead = getNowTime();
}

function changeDeviceName(deviceName){
	ss.storage.deviceName = deviceName;

}


function handleDatas(email){
	
    
    
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

}
exports.handleDatas = handleDatas;


function setDeviceName(deviceName){
	ss.storage.deviceName = deviceName;
}

exports.setDeviceName = setDeviceName;
/*
aBookmark.device = {'device_id':ss.storage.id,'device_name':ss.storage.deviceName}
		aBookmark.bookmarks = allThisDeviceBookmarks;
		allBookmarks.push(aBookmark);
		if (ss.storage.bookmarks){
			//allBookmarks.push(ss.storage.bookmarks);
			var allBookmarks = allBookmarks.concat(ss.storage.bookmarks);

		}

*/

function getDeviceId(){
	return ss.storage.id
}
exports.getDeviceId = getDeviceId;

function getDeviceName(){
	return ss.storage.deviceName;
}
exports.getDeviceName = getDeviceName;


function getAllSavedBookmarks(){
	if (ss.storage.bookmarks){
		return ss.storage.bookmarks;
	}
	else{
		return null;
	}

}

exports.getAllSavedBookmarks = getAllSavedBookmarks;

function getAllSavedHistory(){
	if (ss.storage.history){
		return ss.storage.history;
	}
	else{
		return null;
	}

}
exports.getAllSavedHistory = getAllSavedHistory;

function getAllSavedTabs(){
	console.log("Local storage: get all saved tabs!!!" );
	if (ss.storage.tabs){
		console.log("localStorage: SAvED TABS = " + JSON.stringify(ss.storage.tabs));
		return ss.storage.tabs;
	}
	else{
		return null;
	}

}

exports.getAllSavedTabs = getAllSavedTabs;


function startUp(){
	myServer.on('allBookmarksReadFromServer',saveReadBookmarks);
	myServer.on('allHistoryReadFromServer',saveReadHistory);
	myServer.on('allTabsReadFromServer',saveReadTabs);
	preferences.on('deviceNameChanged',changeDeviceName);
}

exports.startUp = startUp;


















