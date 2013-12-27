/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to control the user's preferences.															|
 * Learnt from:																											|
 * https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/simple-prefs.html							|																					
 ************************************************************************************************************************/

var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};
var settings = require("sdk/simple-prefs");


function onDeviceNameChange(prefName) {
    var message = "Device name set to " + settings.prefs['deviceName'];
    emit(exports,'showMessage', message);
    emit(exports,'deviceNameChanged',settings.prefs['deviceName']);    
}

function onExtraServerChange(prefName){
	var message = "Extra server set to " + settings.prefs[prefName];
	emit(exports, 'showMessage', message);
	emit(exports, 'serverChanged',settings.prefs[prefName]);
}
function onSyncTabs(prefName){
	var message = "Tabs won't be auto synchronized anymore";
	emit(exports, 'showMessage', message);
}
function onSyncBookmarks(prefName){
	var message = "Bookmarks won't be auto synchronized anymore";
	emit(exports, 'showMessage', message);
}
function onSyncHistory(prefName){
	var message = "History won't be auto synchronized anymore ";
	emit(exports, 'showMessage', message);
}

function getDeviceName(){
	return settings.prefs['deviceName'];
}

function setDeviceName(deviceName){
	settings.prefs['deviceName'] = deviceName;
}

function getExtraServer(){
	return settings.prefs['extraServer'];
}

function getSyncTabs(){
	return settings.prefs['syncTabs'];

}

function getSyncBookmarks(){
	return settings.prefs['syncBookmarks'];
}

function getSyncHistory(){
	return settings.prefs['syncHistory'];
}
function setSyncBookmarks(sync){
	settings.prefs['syncBookmarks'] = sync;
}

function setSyncHistory(sync){
	settings.prefs['syncHistory'] = sync;
}

function setSyncTabs(sync){
	settings.prefs['syncTabs'] = sync;
}
exports.setSyncBookmarks = setSyncBookmarks;
exports.setSyncHistory = setSyncHistory;
exports.setSyncTabs = setSyncTabs;

function turnOffSync(){
	setSyncBookmarks(false);
	setSyncHistory(false);
	setSyncTabs(false);	
}
exports.turnOffSync = turnOffSync;

function startUp(){
	settings.on("extraServer", onExtraServerChange);
	settings.on("saveDeviceName",onDeviceNameChange);
	settings.on("syncTabs",onSyncTabs);
	settings.on("syncBookmarks",onSyncBookmarks);
	settings.on("syncHistory",onSyncHistory);	
}

function clean(){
	settings.removeListener('extraServer',onExtraServerChange);
	settings.removeListener('saveDeviceName',onDeviceNameChange);
	settings.removeListener('syncTabs',onSyncTabs);
	settings.removeListener('syncBookmarks',onSyncBookmarks);
	settings.removeListener('syncHistory',onSyncHistory);
}

exports.getExtraServer = getExtraServer;
exports.getDeviceName = getDeviceName;
exports.getSyncTabs = getSyncTabs;
exports.getSyncBookmarks = getSyncBookmarks;
exports.getSyncHistory = getSyncHistory;
exports.startUp = startUp;
exports.clean = clean;

















