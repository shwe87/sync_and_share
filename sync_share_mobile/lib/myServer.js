/*
This add-on will try to communicate with the Django Server created by me.
*/
var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};
var data = require('sdk/self').data;
var Request = require('sdk/request').Request;
var tabs = require('sdk/tabs');
var myTabs = require('./tabs.js');
var preferences = require('./preferences.js');

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
var read_interval_id;
var deviceId;
var if_sync_tabs = true;
var if_sync_bookmarks = true;
var if_sync_history = true;





function handleErrors(response){
	if (response.status == '500'){
		console.log('MY SERVER:  '+"Did not work out!");
		var message = 'Internal server problem';
		emit(exports, 'showMessage',message);
		    	
	}
	else if (response.status == '401' && response.headers.error == 'Unauthorized'){
		console.log('MY SERVER:  '+"Not authorized!!");
		dialog.loginDialog();	
		//emit(exports, 'notAuthorized', null);
	}
	else if (response.status == '0'){
		console.log('MY SERVER: Server is not connected');
		emit(exports,'showMessage','Sync & Share server is not connected! Try again later!');
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
@function saveTabs: Save all the provided tabs.
@param datasToSave {Array}: An array of tabs to save in the server.
When the request is completed, check the response, if everything is OK then all the tabs were saved successfully.
***********************************************************************************************************************/
function saveTabs(datasToSave){
	console.log("MY SERVER: Save tabs = " + JSON.stringify(datasToSave));
	var sendURL = URL + '/add/all/tabs/';
	//console.log('MY SERVER:  '+"Gonna send to = " + sendURL );
	//console.log('MY SERVER:  '+"Gonna send = " + JSON.stringify(datasToSave));
	var deviceName = preferences.getDeviceName();
	deviceId = localStorage.getDeviceId();
	var saveRequest = Request({
		url: sendURL,
		contentType: 'application/json',
		headers: {'myName':deviceName,'myId':deviceId,'type':'mobile'},
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



function setDeviceId(id){
	deviceId = id;
}
exports.setDeviceId = setDeviceId;



/*********************************************************************************************************************************
@function save: This is for the manual save, when the user clicks anu function like Save all tabs, save this tab, save this bookmark,etc.
@param datas {Object}: It has all the information that this function needs to send the request. Only these are used:
	-@element {String}: Can be 'tabs.json', 'bookmarks.json' or 'history.json'. The element that is going to be saved.
	-@dataToSave {Array}: The list of the element to save. A list of bookmarks, a list of tabs or a list of history
*********************************************************************************************************************************/
function save(datas){
        var element = datas.title.split('.json')[0];
        var dataToSave = datas.dataToSave;
        var deviceName = preferences.getDeviceName();
        deviceId = localStorage.getDeviceId();
        console.log('MY SERVER:  '+"Going to send = " + URL);
        var saveRequest = Request({
                url: SAVE_URL + element+'/',
                contentType: 'application/json',
                headers: {'myName':deviceName,'myId':deviceId,'type':'mobile'},
                content: JSON.stringify(dataToSave),
                onComplete: function (response) {        
					if (response.status == '200'){
						console.log('MY SERVER:  '+"SAVED CORRECTLY");
						handleRegister(); 
						emit(exports,'showMessage','Sync & Share: Saved correctly!');      
					}
					else if (response.status == '401' && response.headers.error == 'Unauthorized'){
						console.log('MY SERVER:  '+"Not authorized!!");
						//dialog.loginDialog();	
						var message = "Sync & Share: You are not signed in. Please sign in!";
						emit(exports, 'showMessage', message);
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
        deviceId = localStorage.getDeviceId();
        //for each(var tab in tabs){
        var URL = READ_URL + element+'/';
        console.log('MY SERVER:  '+"Going to send = " + URL);
        var readRequest = Request({
        	url: READ_URL + element+'/',
		headers: {'myName':deviceName,'myId':deviceId,'type':'mobile'},
		onComplete: function (response) {
			if (response.status == '200'){
				handleRegister();
				//emit(exports,'showMessage','Sync & Share: Saved correctly!'); 
				console.log('MY SERVER:  '+"READ CORRECTLY");
		                console.log('MY SERVER:  '+response.text);
		                console.log('MY SERVER: ' + element);
		                toShow = new Object();
		                try{
		                	var dataToShow = JSON.parse(response.text);
		                }
		                catch(e){
		                	console.log("MYSERVER: Can't convert!!! ");
		                	var dataToShow = response.text;
		                }
		                //toShow.data = new Object();
		                toShow.data = dataToShow;
		                toShow.server = 'mysite';
		                toShow.element = element;
		                console.log("MY SERVER : display = " + JSON.stringify(toShow));
		                emit (exports,'display',toShow)
		        }
		        else if (response.status == '500'){
		        	console.log('MY SERVER:  '+"Did not work out!");
			    	var message = 'Internal server problem';
			    	emit(exports, 'showMessage',message);
			}
			else if (response.status == '404'){
				console.log("MY SERVER: Read nothing saved! ");
				var toShow = new Object();
				toShow.data = null;
				toShow.server = 'mysite';
				toShow.element = element;
				console.log("MY SERVER read: " + element);
			    	emit(exports, 'display', toShow);
			}
			else if (response.status == '401' && response.headers.error == 'Unauthorized'){
				//console.log('MY SERVER:  '+"Not authorized!!");
				//dialog.loginDialog();	
				var toShow = new Object();
				toShow.data = new Object();
				toShow.data['msg'] = "You are not signed in Sync & Share. Please sign in!";
				toShow.element = element;
				toShow.server = 'mysite';
				emit(exports, 'notAuthorized', toShow);
				//emit(exports,'toShow','Not authorized!');
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
        deviceId = localStorage.getDeviceId();
        console.log('MY SERVER:  Read all bookmarks');
        var readRequest = Request({
        	url: READ_ALL_BOOKMARKS,
		headers: {'myName':deviceName,'myId':deviceId,'type':'mobile'},
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
		                console.log("Bookmarks read = " + JSON.stringify(listOfBookmarks));
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
        deviceId = localStorage.getDeviceId();
        //for each(var tab in tabs){
                console.log('MY SERVER:  Read all history');
                var readRequest = Request({
		         url: READ_ALL_HISTORY,
		         headers: {'myName':deviceName,'myId':deviceId,'type':'mobile'},
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
		                        console.log("History read = " + JSON.stringify(listOfHistory));
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
        deviceId = localStorage.getDeviceId();
        console.log("Gonna read all tabs!");
        //for each(var tab in tabs){
               // console.log('MY SERVER:  '+"Going to send = " + URL);
               deviceId = localStorage.getDeviceId();
            	console.log(deviceId);
            	console.log(deviceName);
                var readRequest = Request({
		         url: READ_ALL_TABS,
		         headers: {'myName':deviceName,'myId':deviceId,'type':'mobile'},
		         //contentType: 'application/json',
		         //content: {'title':tab.title,'url':tab.url,'id':tab.id},
		         onComplete: function (response) {
		                 //console.log('MY SERVER:  '+response.text);
		                 /*console.log('MY SERVER:  '+response.status);
		                 console.log('MY SERVER:  '+JSON.stringify(response.headers));
		                 console.log('MY SERVER:  '+response.statusText);*/
				 if (response.status == '200'){
					 handleRegister();
				 	console.log('MY SERVER:  '+"TABS READ CORRECTLY");
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
		                        console.log("MY SERVER: Read tabs from server = " + JSON.stringify(listOfTabs));
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
        deviceId = localStorage.getDeviceId();
        console.log('MY SERVER:  '+"Going to send = " + URL);
        var changeRequest = Request({
                url: CHANGE_DEVICE_NAME,
                //contentType: 'application/json',
                headers: {'myName':new_device_name,'myId':deviceId,'type':'mobile'},
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
		headers: {'myName':device_name,'myId':device_id,'type':'mobile'},
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
@function getAll: Get all the history, bookmarks and tabs that this user has synced from the server. (Depends on the user's preferences).
*********************************************************************************************************************************/
function getAll(){
	if_sync_history = preferences.getSyncHistory();		//User's preference to sync history
	if_sync_bookmarks = preferences.getSyncBookmarks();	//User's preference to sync bookmarks.
	if_sync_tabs = preferences.getSyncTabs();
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
	console.log("MY SERVER: startUp");
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

 
