var settings = require("sdk/simple-prefs");
var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


/*Preferences list in this app:
,
  "preferences": [
  	{
	    "description": "Auto sync tabs?",
	    "type": "bool",
	    "name": "syncTabs",
	    "value": true,
	    "title": "Tabs"
	},
	{
	    "description": "Auto sync bookmarks?",
	    "type": "bool",
	    "name": "syncBookmarks",
	    "value": true,
	    "title": "Bookmarks"
	},
	{
	    "description": "Auto sync history?",
	    "type": "bool",
	    "name": "syncHistory",
	    "value": true,
	    "title": "History"
	},
        {
            "type": "string",
            "name": "deviceName",
            "value": "username-desktop",
            "title": "Name this device as: "
        },
        {
           "type": "control",
           "label": "Save device name",
           "name": "saveDeviceName",
           "title": "Save device name"
        },
        {
	    "name": "extraServer",
	    "type": "radio",
	    "title": "Extra server",
	    "value": "None",
	    "options": [
		{
		    "value": "None",
		    "label": "Don't user extra server"
		},
		{
		    "value": "D",
		    "label": "Use Dropbox"
		},
		{
		    "value": "G",
		    "label": "User Google-Drive"
		},
		{
		    "value": "B",
		    "label": "Use both"
		
		}
	    ]
	}
    ]



*/
function onDeviceNameChange(prefName) {
   // console.log("Device name set to " + settings.prefs['deviceName']);
    var message = {'msg':"Device name set to " + settings.prefs['deviceName'], 'type': 'correct'}
    emit(exports,'showMessage', message);
    emit(exports,'deviceNameChanged',settings.prefs['deviceName']);
    
}

function onExtraServerChange(prefName){
	var message = {'msg':"Extra server set to " + settings.prefs[prefName], 'type': 'correct'};
	emit(exports, 'showMessage', message);
}
function onSyncTabs(prefName){
	var message = {'msg':"Tabs won't be auto synchronized anymore", 'type': 'correct'};
	emit(exports, 'showMessage', message);
}
function onSyncBookmarks(prefName){
	var message = {'msg':"Bookmarks won't be auto synchronized anymore", 'type': 'correct'};
	emit(exports, 'showMessage', message);
}
function onSyncHistory(prefName){
	var message = {'msg':"History won't be auto synchronized anymore ", 'type': 'correct'};
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

















