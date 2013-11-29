var { emit, on, once, off } = require("sdk/event/core");
var dropbox = require('./dropbox.js');
var gapi = require('./gapi.js');



var chosenServer;
const preferences = require("sdk/simple-prefs");


var dropboxDatas = {};
dropboxDatas.access_token;
dropboxDatas.token_type;
dropboxDatas.uid;

var gapiDatas = {};
gapiDatas.access_token;
gapiDatas.token_type;
gapiDatas.expires_in;
gapiDatas.id_token;
gapiDatas.refresh_token;

const DROPBOX = 'dropbox';
const GOOGLE_DRIVE = 'gapi';
const BOTH = 'both';



/*Handle the auth reply*/
//var access_token = dropBox.access_token;
function handleDropboxAuth(authDatas){
	/*authDatas = [response.json, callersData]
	**callersData = [whoCalled, datas...]
	*/
	authenticated = authDatas.authSuccess;
	//var accessDatas = authDatas[0];
	//var callersData = authDatas[1];
	
	//var whoCalled = authDatas.whoCalled;
	var message = '';
	//Save the respective value of the access response.
	if (authenticated){
		dropboxDatas.access_token = authDatas.token;
		dropboxDatas.token_type = authDatas.token_type;
		dropboxDatas.uid = authDatas.uid;
		message = 'Signed in correctly!';

			
	}
	else{
		message = 'Signed in failed!';
	
	}
	
	/*var currentTab = tabs.activeTab;
	console.log("Active tab " + currentTab.title);
	var currentTabWorker = currentTab.attach({
		contentScriptFile: data.url('messages.js')
	});
	currentTabWorker.port.emit('authenticated','Signed in correctly!');
	*/
	
	emit(exports,'showMessage',message);
	/*panelMessage.write({'msg':'Signed in correctly!','type':'correct'});
	panelMessage.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds*/
	
	//console.log("EXPIRES IN " + expires_in);
	
	/*
	if (whoCalled == 'searchFile'){
		//Continue to search File
		//callersData = ['searchFile' , title, dataToSave]
		var title = authDatas.title;
		var dataToSave = authDatas.dataToSave;
		//var elementToSave = callersData[3];
		gapi.searchFile(authDatas);
	}
	/*if(whoCalled == 'OpenTab'){
		tabs.open({
  			url: data.url('GoogleDriveShare.html'),
  			inNewWindow: true
    		});
		
	}*/
	/*
	else if (whoCalled == 'downloadData'){
		//callersData = ['downloadData', fileName, downloadURL]
		var title = authDatas.title;
		var downloadURL = authDatas.dLoadURL;
		gapi.downloadData(authDatas);	
	}*/


}

/*Handle the auth reply*/
//var access_token = dropBox.access_token;
function handleGapiAuth(authDatas){
	/*authDatas = [response.json, callersData]
	**callersData = [whoCalled, datas...]
	*/
	authenticated = authDatas.authSuccess;
	//var accessDatas = authDatas[0];
	//var callersData = authDatas[1];
	
	//var whoCalled = authDatas.whoCalled;
	var message = '';
	//Save the respective value of the access response.
	if (authenticated){
		gapiDatas.access_token = authDatas.token;
		gapiDatas.token_type = authDatas.token_type;
		gapiDatas.expires_in = authDatas.expires_in;
		gapiDatas.id_token = authDatas.id_token;
		gapiDatas.refresh_token = authDatas.refresh_token;
		message = 'Signed in correctly!';
			
	}
	else{
		message = 'Signed in failed!';
	
	}
		
	
	emit(exports,'showMessage',message);
	/*var currentTab = tabs.activeTab;
	console.log("Active tab " + currentTab.title);
	var currentTabWorker = currentTab.attach({
		contentScriptFile: data.url('messages.js')
	});
	currentTabWorker.port.emit('authenticated','Signed in correctly!');
	*/
	/*panelMessage.write({'msg':'Signed in correctly!','type':'correct'});
	panelMessage.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds*/
	
	//console.log("EXPIRES IN " + expires_in);
	
	/*
	if (whoCalled == 'searchFile'){
		//Continue to search File
		//callersData = ['searchFile' , title, dataToSave]
		var title = authDatas.title;
		var dataToSave = authDatas.dataToSave;
		//var elementToSave = callersData[3];
		gapi.searchFile(authDatas);
	}
	/*if(whoCalled == 'OpenTab'){
		tabs.open({
  			url: data.url('GoogleDriveShare.html'),
  			inNewWindow: true
    		});
		
	}*/
	/*
	else if (whoCalled == 'downloadData'){
		//callersData = ['downloadData', fileName, downloadURL]
		var title = authDatas.title;
		var downloadURL = authDatas.dLoadURL;
		gapi.downloadData(authDatas);	
	}*/


}


function changeServer(){	
	setServer();
	var message = 'Changed correctly!';
	emit(exports,'showMessage',message);
	
}
exports.changeServer = changeServer;


function handleDisplay(toShowDatas){
	
	emit(exports,'display',toShowDatas);
}

function handleShowMessage(messageToShow){
	emit(exports,'showMessage',messageToShow);
}





function setServer(){

	chosenServer = preferences.prefs['server'];

}
exports.setServer = setServer;

function save(writeDatas){
	var message = 'Currently, you are using ';
	if (chosenServer == DROPBOX){
		writeDatas.token = dropboxDatas.access_token;
		dropbox.save(writeDatas);
		message = message + 'Dropbox.';
	}
	else if (chosenServer == GOOGLE_DRIVE){
		writeDatas.token = gapiDatas.access_token;
		gapi.save(writeDatas);
		message = message + 'Google-Drive.';
	}
	else if (chosenServer == BOTH){
		message = message + 'Dropbox and Google-Drive.';
		writeDatas.token = dropboxDatas.access_token;
		dropbox.save(writeDatas);
		writeDatas.token = gapiDatas.access_token;
		gapi.save(writeDatas);	
	}
	message = message + 'If you want to change this, please see the help page or go to the preference page.';
	emit(exports, 'showMessage',message);

}
exports.save = save;

function read(readInfo){
	var message = 'Currently, you are using ';
	if (chosenServer == DROPBOX){
		readInfo.token = dropboxDatas.access_token;
		dropbox.read(readInfo);
		message = message + 'Dropbox.';
	}
	else if (chosenServer == GOOGLE_DRIVE){
		readInfo.token = gapiDatas.access_token;
		gapi.read(readInfo);
		message = message + 'Google-Drive.';
	}
	else if (chosenServer == BOTH){
		message = message + 'Dropbox and Google-Drive.';
		readInfo.token = dropboxDatas.access_token;
		dropbox.read(readInfo);
		readInfo.token = gapiDatas.access_token;
		gapi.read(readInfo);	
	}
	message = message + 'If you want to change this, please see the help page or go to the preference page.';
	emit(exports, 'showMessage',message);
}
exports.read = read;

function start(){
	//Set the server:
	setServer();
	//Listen for the button Save changes in the preferences panel.
	preferences.on("saveChanges", changeServer);
	//When the user is unauthorized:
	//gapi.on('Unauthorized',handleUnAuth);
	//When the authentication process is completed:
	gapi.on('authComplete',handleGapiAuth);
	//Display the downloaded data.  
	gapi.on('display',handleDisplay);
	//To show the corresponding message
	gapi.on('showMessage',handleShowMessage); 

	//dropbox.on('Unauthorized',handleUnAuth);
	//When the authentication process is completed:
	dropbox.on('authComplete',handleDropboxAuth);
	//Display the downloaded data.  
	dropbox.on('display',handleDisplay);
	//To show the corresponding message
	dropbox.on('showMessage',handleShowMessage); 
}
exports.start = start;
   
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};
