/*
This add-on will try to communicate with the Django Server created by me.
*/
var data = require('sdk/self').data;
var Request = require('sdk/request').Request;
var tabs = require('sdk/tabs');
var bookmarks = require('./bookmark.js');
var history = require('./history.js');
var myTabs = require('./tabs.js');
var preferences = require('./preferences.js');
var { emit, on, once, off } = require("sdk/event/core");
var timer = require('sdk/timers');
var dialog = require('./dialog.js');
var localStorage = require('./localStorage.js');
var constants = require('./constants.js');

const URL = constants.URL;
const SAVE_URL = constants.SAVE_URL;
const READ_URL = constants.READ_URL;
const READ_ALL_BOOKMARKS = constants.READ_ALL_BOOKMARKS;
const READ_ALL_HISTORY = constants.READ_ALL_HISTORY;
const READ_ALL_TABS = constants.READ_ALL_TABS;
const CHANGE_DEVICE_NAME = constants.CHANGE_DEVICE_NAME;
const REGISTER = URL + '/register/';


var bookmarksList = new Array();

const INTERVAL_MS = 30*60*1000;	//In milliseconds 30 minutes
var save_interval_id;
var read_interval_id;
var deviceId;
var if_sync_tabs = true;
var if_sync_bookmarks = true;
var if_sync_history = true;



exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


function handleErrors(response){
	if (response.status == '500'){
		console.log('MY SERVER:  '+"Did not work out!");
		var message = {'msg':'Internal server problem', 'type':'error'};
		emit(exports, 'showMessage',message);
		    	
	}
	else if (response.status == '401' && response.headers.error == 'Unauthorized'){
		console.log('MY SERVER:  '+"Not authorized!!");
		/*var message = {'msg':'You are not logged in!','type':'error'};
		emit(exports, 'showMessage',message);*/
		dialog.loginDialog();	
	}
	else if (response.status == '0'){
		console.log('MY SERVER: Server is not connected');
	}
	else{
		console.log('MY SERVER:  Response status = '+response.status);
		console.log('MY SERVER:  response text = '+response.statusText);
	}

}

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
	var sendURL = URL + '/add/all/bookmarks/';
	var deviceName = preferences.getDeviceName();
	console.log('MY SERVER:  Save all bookmarks in the server' );
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
	var sendURL = URL + '/add/all/history/';
	var deviceName = preferences.getDeviceName();
	console.log('MY SERVER:  Save all history' );
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
	console.log("My server: Have to save tabs");
	var sendURL = URL + '/add/all/tabs/';
	//console.log('MY SERVER:  '+"Gonna send to = " + sendURL );
	//console.log('MY SERVER:  '+"Gonna send = " + JSON.stringify(datasToSave));
	var deviceName = preferences.getDeviceName();
	var saveRequest = Request({
		url: sendURL,
		contentType: 'application/json',
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		content:  JSON.stringify(datasToSave),
		onComplete: function (response) {	
		    	if (response.status == '200'){
		    		console.log('MY SERVER:  '+"TABS SAVED CORRECTLY");
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
        console.log('MY SERVER:  '+"Going to send = " + URL);
        var saveRequest = Request({
                url: SAVE_URL + element+'/',
                contentType: 'application/json',
                headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
                content: JSON.stringify(dataToSave),
                onComplete: function (response) {        
					if (response.status == '200'){
						console.log('MY SERVER:  '+"SAVED CORRECTLY");
						handleRegister();
						var message = new Object();
						message.msg = 'Sync & Share: Saved correctly.'
						message.type = 'correct';
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
        //for each(var tab in tabs){
        var URL = READ_URL + element+'/';
        console.log('MY SERVER:  '+"Going to send = " + URL);
        var readRequest = Request({
        	url: READ_URL + element+'/',
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		onComplete: function (response) {
			if (response.status == '200'){
				console.log('MY SERVER:  '+"READ CORRECTLY");
		                //console.log('MY SERVER:  '+response.text);
		                var readThings = JSON.parse(response.text);
		                var toDisplay = new Object();
		                toDisplay.server = 'mysite';
		                toDisplay.data = readThings;
		                toDisplay.element = element;
		                //console.log(readThings);
		                emit (exports,'display',toDisplay);
		                
		                handleRegister();
		        }
		        else if (response.status == '500'){
		        	console.log('MY SERVER:  '+"Did not work out!");
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
				//console.log('MY SERVER:  '+"Not authorized!!");
				//dialog.loginDialog();	
				emit(exports, 'notAuthorized', 'Sync & Share');
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
        console.log('MY SERVER:  Read all bookmarks');
        var readRequest = Request({
        	url: READ_ALL_BOOKMARKS,
		headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		onComplete: function (response) {
			if (response.status == '200'){
				handleRegister();
				console.log('MY SERVER:  '+"READ CORRECTLY");
				var allBookmarks = JSON.parse(response.text);	//Received as string, convert to JSON.
		                console.log('MY SERVER:  Bookmarks length='+allBookmarks.length);
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
        
        //for each(var tab in tabs){
                console.log('MY SERVER:  Read all history');
                var readRequest = Request({
		         url: READ_ALL_HISTORY,
		         headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		         //contentType: 'application/json',
		         //content: {'title':tab.title,'url':tab.url,'id':tab.id},
		         onComplete: function (response) {
		                 //console.log('MY SERVER:  '+response.text);
		                 /*console.log('MY SERVER:  '+response.status);
		                 console.log('MY SERVER:  '+JSON.stringify(response.headers));
		                 console.log('MY SERVER:  '+response.statusText);*/
				 if (response.status == '200'){
					 handleRegister();
				 	console.log('MY SERVER:  '+"READ CORRECTLY");
		                            //JSON.parse(response.text)
		                        var allHistory = JSON.parse(response.text);
		                        //console.log('MY SERVER:  '+allBookmarks);
		                        console.log('MY SERVER:  '+allHistory.length);
		                        
		                        var listOfHistory = new Array();
		                        for (var i=0;i<allHistory.length;i++){
		                        	//var bookmarks_device = JSON.parse(allBookmarks[i]);
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
		                        	//console.log('MY SERVER:  '+device);
		                        	//var thisDeviceBookmarks = JSON.parse(allBookmarks[i].bookmarks);
		                        	//aBookmark.bookmarks = thisDeviceBookmarks
		                        	//console.log('MY SERVER:  '+allBookmarks[i].bookmarks);
		                        	//console.log('MY SERVER:  '+allBookmarks[i].bookmarks.length);
		                        	var thisDeviceHistory = new Array();
		                        	for (var j=0;j<allHistory[i].history.length;j++){
		                        		var thisHistory = JSON.parse(allHistory[i].history[j]);
		                        		thisDeviceHistory.push(thisHistory);
		                        	}
		                        	aHistory.history = thisDeviceHistory;
		                        	listOfHistory.push(aHistory);
		                        	//console.log('MY SERVER:  '+JSON.parse(allBookmarks[i].bookmarks));
		                        	//listOfBookmarks.push(aBookmark);
		                        	
		                        	//console.log('MY SERVER:  '+aBookmark.title);
		                        	//listOfBookmarks.push(aBookmark);
		                        }
		                        emit(exports, 'allHistoryReadFromServer', listOfHistory);
		                 }
		                 else{
		    			handleErrors(response);
		    		}
		          }
               });
               readRequest.get();
        //}

}

exports.readAllHistory = readAllHistory;


/*********************************************************************************************************************************
@function readAllTabs: This function reads all the tabs of all the devices that this user chose to save in this server. When the server provides us all the user's tabs, they need to be handled because they come as json:
@var response.text: Is where all the datas saved
*********************************************************************************************************************************/
function readAllTabs(){
        var deviceName = preferences.getDeviceName();
        //for each(var tab in tabs){
               // console.log('MY SERVER:  '+"Going to send = " + URL);
               deviceId = localStorage.getDeviceId();
               console.log(deviceId);
                var readRequest = Request({
		         url: READ_ALL_TABS,
		         headers: {'myName':deviceName,'myId':deviceId,'type':'desktop'},
		         //contentType: 'application/json',
		         //content: {'title':tab.title,'url':tab.url,'id':tab.id},
		         onComplete: function (response) {
		                 //console.log('MY SERVER:  '+response.text);
		                 /*console.log('MY SERVER:  '+response.status);
		                 console.log('MY SERVER:  '+JSON.stringify(response.headers));
		                 console.log('MY SERVER:  '+response.statusText);*/
				 if (response.status == '200'){
					 handleRegister();
				 	console.log('MY SERVER:  '+"READ CORRECTLY");
		                            //JSON.parse(response.text)
		                        var allTabs = JSON.parse(response.text);
		                        //console.log('MY SERVER:  '+allBookmarks);
		                        console.log('MY SERVER:  '+allTabs.length);
		                        
		                        var listOfTabs = new Array();
		                        for (var i=0;i<allTabs.length;i++){
		                        	//var bookmarks_device = JSON.parse(allBookmarks[i]);
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
		                        	//console.log('MY SERVER:  '+device);
		                        	//var thisDeviceBookmarks = JSON.parse(allBookmarks[i].bookmarks);
		                        	//aBookmark.bookmarks = thisDeviceBookmarks
		                        	//console.log('MY SERVER:  '+allBookmarks[i].bookmarks);
		                        	//console.log('MY SERVER:  '+allBookmarks[i].bookmarks.length);
		                        	var thisDeviceTabs = new Array();
		                        	for (var j=0;j<allTabs[i].tabs.length;j++){
		                        		var thisTab = JSON.parse(allTabs[i].tabs[j]);
		                        		thisDeviceTabs.push(thisTab);
		                        	}
		                        	aTab.tabs = thisDeviceTabs;
		                        	listOfTabs.push(aTab);
		                        	//console.log('MY SERVER:  '+JSON.parse(allBookmarks[i].bookmarks));
		                        	//listOfBookmarks.push(aBookmark);
		                        	
		                        	//console.log('MY SERVER:  '+aBookmark.title);
		                        	//listOfBookmarks.push(aBookmark);
		                        }
		                        emit(exports, 'allTabsReadFromServer', listOfTabs);
		                 }
		                 else{
		    			handleErrors(response);
		    		}
		          }
               });
               readRequest.get();
        //}

}

exports.readAllTabs = readAllTabs;
/*********************************************************************************************************************************
@function changeDeviceName: In settings, when the user changes the device name, change it on the server also.
@param new_device_name {String}: Set the device name to this one.
*********************************************************************************************************************************/
function changeDeviceName(new_device_name){
        /*This is to send the tabs list to the server.*/
        //console.log('MY SERVER:  '+'Send ');
        //var dataToSave = new Array();
        /*for each (var tabToSave in tabs){                                
                var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
                dataToSave.push(newTab);                
        }*/
        //console.log('MY SERVER:  '+JSON.stringify(dataToSave))
        console.log('MY SERVER:  '+"Going to send = " + URL);
        var changeRequest = Request({
                url: CHANGE_DEVICE_NAME,
                //contentType: 'application/json',
                headers: {'myName':new_device_name,'myId':deviceId,'type':'desktop'},
                //content: JSON.stringify(dataToSave),
                onComplete: function (response) {        
			if (response.status == '200'){
				handleRegister();
                                 console.log('MY SERVER:  '+"SAVED CORRECTLY");
                                         
                        }
                        else{
		    		handleErrors(response);
		    	}
                 }
         });
        changeRequest.get();



}

function registerMe(){
	console.log("MY SERVER: Register me");
	var device_name = preferences.getDeviceName();
	var device_id = localStorage.getDeviceId();
	var register = Request({
		url: REGISTER,
		headers: {'myName':device_name,'myId':device_id,'type':'desktop'},
		onComplete: function (response){
				if (response.status == '200'){
						console.log('Registered all right!!!');
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
	console.log("MY SERVER : Save all called");
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
	console.log("MY SERVER: REad all");
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

 
