var { emit, on, once, off } = require("sdk/event/core");
var dropbox = require('./dropbox.js');
var gapi = require('./gapi.js');
var myServer = require('./myServer.js');
//var myServer = require(');


var chosenServer;
//var serverInfo = {'dropbox':false,'googleDrive':false,'both':false};
const preferences = require("./preferences.js");
var theServer;
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
const NONE = 'none';



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
	var message = {};
	//Save the respective value of the access response.
	if (authenticated){
		dropboxDatas.access_token = authDatas.token;
		dropboxDatas.token_type = authDatas.token_type;
		dropboxDatas.uid = authDatas.uid;
		message.msg = 'Signed in correctly!';
		message.type = 'correct';
			
	}
	else{
		message.msg = 'Signed in failed!';
		message.type = 'correct';
	
	}
	

	
	emit(exports,'showMessage',message);



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
	var message = {};
	//Save the respective value of the access response.
	if (authenticated){
		gapiDatas.access_token = authDatas.token;
		gapiDatas.token_type = authDatas.token_type;
		gapiDatas.expires_in = authDatas.expires_in;
		gapiDatas.id_token = authDatas.id_token;
		gapiDatas.refresh_token = authDatas.refresh_token;
		message.msg = 'Signed in correctly!';
		message.type = 'correct';
			
	}
	else{
		message.msg = 'Signed in failed!';
		message.type = 'correct';
	
	}
		
	
	emit(exports,'showMessage',message);
	/*var currentTab = tabs.activeTab;
	console.log('SERVER:  '+"Active tab " + currentTab.title);
	var currentTabWorker = currentTab.attach({
		contentScriptFile: data.url('messages.js')
	});
	currentTabWorker.port.emit('authenticated','Signed in correctly!');
	*/
	/*panelMessage.write({'msg':'Signed in correctly!','type':'correct'});
	panelMessage.show();
	timer.setTimeout(hidePanel, 5000);	//5 seconds*/
	
	//console.log('SERVER:  '+"EXPIRES IN " + expires_in);
	
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


function changeServer(newServer){
	
	//setServer();
	console.log("SERVER : Server Changed to = " + newServer);
	chosenServer = newServer;
	//var message = 'Changed correctly!';
	//emit(exports,'showMessage',message);
	

}


function handleDisplay(toShowDatas){
	emit(exports,'display',toShowDatas);
}

function handleShowMessage(messageToShow){
	emit(exports,'showMessage',messageToShow);
}





function setServer(){
	//if(chosenServer != undefined){
	//	serverInfo[chosenServer] = false;
	//}
	chosenServer = preferences.getExtraServer();
	//serverInfo[chosenServer] = true;
	/*if (chosenServer == DROPBOX){//If it is not both then:
		theServer = dropbox;
	}
	else if (chosenServer == GOOGLE_DRIVE){
		theServer = gapi;
	}
	else if (chosenServer == BOTH){
		theServer = 'both';
	}*/
	console.log('SERVER:  '+'Chosen server = ' + chosenServer);	
}
exports.setServer = setServer;

function save(writeDatas){
	var message = {};
	message.msg = 'Currently, you are using ';
	message.type = 'info';
	if (chosenServer == DROPBOX){
		writeDatas.token = dropboxDatas.access_token;
		dropbox.save(writeDatas);
		message.msg = message.msg + 'Dropbox.';
	}
	else if (chosenServer == GOOGLE_DRIVE){
		writeDatas.token = gapiDatas.access_token;
		gapi.save(writeDatas);
		message.msg = message.msg + 'Google-Drive.';
	}
	else if (chosenServer == BOTH){
		message.msg = message.msg + 'Dropbox and Google-Drive.';
		writeDatas.token = dropboxDatas.access_token;
		dropbox.save(writeDatas);
		writeDatas.token = gapiDatas.access_token;
		gapi.save(writeDatas);	
	}
	else if (chosenServer == NONE){
		//Do nothing
		message.msg = message.msg + 'No extra server.'
	}
	//Have to send to my server:
	myServer.save(writeDatas);
	message.msg = message.msg + 'If you want to change this, please see the help page or go to the preference page.';
	emit(exports, 'showMessage',message);

}
exports.save = save;

function read(readInfo){
	var message = {};
	message.msg = 'Currently, you are using ';
	message.type = 'info';
	if (chosenServer == DROPBOX){
		readInfo.token = dropboxDatas.access_token;
		dropbox.read(readInfo);
		message.msg = message.msg + 'Dropbox.';
	}
	else if (chosenServer == GOOGLE_DRIVE){
		readInfo.token = gapiDatas.access_token;
		gapi.read(readInfo);
		message.msg = message.msg + 'Google-Drive.';
	}
	else if (chosenServer == BOTH){
		message.msg = message.msg + 'Dropbox and Google-Drive.';
		readInfo.token = dropboxDatas.access_token;
		dropbox.read(readInfo);
		readInfo.token = gapiDatas.access_token;
		gapi.read(readInfo);	
	}
	else if (chosenServer == NONE){
		//Do nothing
		message.msg = message.msg = 'No extra server.';
		//emit(exports, 'display',null);
	}
	myServer.read(readInfo);
	message.msg = message.msg + 'If you want to change this, please see the help page or go to the preference page.';
	emit(exports, 'showMessage',message);
}
exports.read = read;

function handleNotAuthorized(serverName){
	console.log("Not authorized!!");
	var message = {'msg':'Not authorized: Please sign in ' + serverName + ' to view the saved items.'}
	emit(exports,'display',message);
}
function start(){
	//Set the server:
	setServer();
	preferences.on('serverChanged',changeServer);
	//Listen for the button Save changes in the preferences panel.
	//preferences.on("saveChanges", changeServer);
	//When the user is unauthorized:
	//gapi.on('Unauthorized',handleUnAuth);
	//When the authentication process is completed:
	gapi.on('authComplete',handleGapiAuth);
	//Display the downloaded data.  
	gapi.on('display',handleDisplay);
	//To show the corresponding message
	gapi.on('showMessage',handleShowMessage); 
	gapi.on('notAuthorized',handleNotAuthorized);

	//dropbox.on('Unauthorized',handleUnAuth);
	//When the authentication process is completed:
	dropbox.on('authComplete',handleDropboxAuth);
	dropbox.on('notAuthorized',handleNotAuthorized);
	//Display the downloaded data.  
	dropbox.on('display',handleDisplay);
	//To show the corresponding message
	dropbox.on('showMessage',handleShowMessage); 
	
	myServer.on('display',handleDisplay);
	myServer.on('notAuthorized',handleNotAuthorized);
}
exports.start = start;
   
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};
