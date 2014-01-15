/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to control all the servers used in this add-on												|							|																					
 ************************************************************************************************************************/
/**********************************************SDK Modules*************************************************************/
var { emit, on, once, off } = require("sdk/event/core");
/**********************************************My modules*************************************************************/
const dropbox = require('./dropbox');
const gapi = require('./gapi');
const myServer = require('./myServer');
const preferences = require("./preferences");
/**********************************************Variables*************************************************************/
var chosenServer;
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
/**********************************************CONSTANTS*************************************************************/
const DROPBOX = 'dropbox';
const GOOGLE_DRIVE = 'gapi';
const BOTH = 'both';
const NONE = 'none';


/************************************************************************************************************************
@function handleDropboxAuth:Called when the dropbox module lets this module know that the authorization process was complete
* @param {object} authDatas - Contains:
* 	--> authDatas.authSuccess {Boolean} - If the auth process was a success or not.
* 	--> authDatas.token {String} - The token that will let this app work in name of the user.
* 	--> authDatas.uid {String} - Unique id of the request
*************************************************************************************************************************/
/*Handle the auth reply*/
function handleDropboxAuth(authDatas){
	authenticated = authDatas.authSuccess;
	var message = {};
	//Save the respective value of the access response.
	if (authenticated){
		dropboxDatas.access_token = authDatas.token;
		dropboxDatas.token_type = authDatas.token_type;
		dropboxDatas.uid = authDatas.uid;
		message.msg = 'Dropbox: Signed in correctly!';
		message.type = 'correct';
			
	}
	else{
		message.msg = 'Dropbox: Signed in failed!';
		message.type = 'correct';
	
	}
	emit(exports,'showMessage',message);



}
/************************************************************************************************************************
@function handleGapiAuth:Called when the gapi (Google Drive)  module lets this module know that the authorization process was complete
* @param {object} authDatas - Contains:
* 	--> authDatas.authSuccess {Boolean} - If the auth process was a success or not.
* 	--> authDatas.token {String} - The token that will let this app work in name of the user.
* 	--> authDatas.expires_in {String} - The token gets expired in
* 	--> authDatas.refresh_token {String} - Refresh with this token
*************************************************************************************************************************/
/*Handle the auth reply*/
function handleGapiAuth(authDatas){
	authenticated = authDatas.authSuccess;
	var message = {};
	//Save the respective value of the access response.
	if (authenticated){
		gapiDatas.access_token = authDatas.token;
		gapiDatas.token_type = authDatas.token_type;
		gapiDatas.expires_in = authDatas.expires_in;
		gapiDatas.id_token = authDatas.id_token;
		gapiDatas.refresh_token = authDatas.refresh_token;
		message.msg = 'Google Drive: Signed in correctly!';
		message.type = 'correct';
			
	}
	else{
		message.msg = 'Google Drive: Signed in failed!';
		message.type = 'correct';
	
	}
	emit(exports,'showMessage',message);
	
}

/************************************************************************************************************************
@function changeServer:Called when the user changes the extra server option in the preferences panel
* @param newServer {String} - The new server chosen
*************************************************************************************************************************/
function changeServer(newServer){
	chosenServer = newServer;
}

/************************************************************************************************************************
@function handleDisplay: Called whenever any of the server wants to display the downloaded data.
* @param toShowDatas {Object} - Contains:
* 	--> toShowDatas.server {String} - From which server was this sent.
* 	--> toShowDatas.data {Object} - The data to be displayed.
* 	--> toShowDatas.element {String} - Type of element (tabs,bookmarks or history).
*************************************************************************************************************************/
function handleDisplay(toShowDatas){
	//Tell the main to handle it.
	emit(exports,'display',toShowDatas);
}

/************************************************************************************************************************
@function handleShowMessage: Called whenever any of the server wants to show a message to the user.
* @param messageToShow {Object} - Contains:
* 	--> messageToShow.message {String} - The message to be shown.
* 	--> messageToShow.type {String ( correct, error or info)} - Type of message.
*************************************************************************************************************************/
function handleShowMessage(messageToShow){
	emit(exports,'showMessage',messageToShow);
}

/************************************************************************************************************************
@function setServer: Set the choseServer (global var ) to the one the user chose.
*************************************************************************************************************************/
function setServer(){
	chosenServer = preferences.getExtraServer();	
}
exports.setServer = setServer;

/************************************************************************************************************************
@function save: Called when the user wants to save something manually. Depending on the user's preferences the datas wil be
* saved in certain servers.
* @param writeDatas {Object} - Necessary datas to be saved
*************************************************************************************************************************/
function save(writeDatas){
	var message = {};
	message.msg = 'Loading..... ';
	message.type = 'info';
	if (chosenServer == DROPBOX){
		var dWrite = JSON.parse(JSON.stringify(writeDatas));
		dWrite.token = dropboxDatas.access_token;
		dropbox.save(dWrite);
		
	}
	else if (chosenServer == GOOGLE_DRIVE){
		var gWrite = JSON.parse(JSON.stringify(writeDatas));
		gWrite.token = gapiDatas.access_token;
		gapi.save(gWrite);
		
	}
	else if (chosenServer == BOTH){
		
		var dWrite = JSON.parse(JSON.stringify(writeDatas));
		dWrite.token = dropboxDatas.access_token;
		dropbox.save(dWrite);
		var gWrite = JSON.parse(JSON.stringify(writeDatas));
		gWrite.token = gapiDatas.access_token;
		gapi.save(gWrite);
	}
	else if (chosenServer == NONE){
		//Do nothing
		
	}
	//Have to send to my server:
	myServer.save(writeDatas);
	emit(exports, 'showMessage',message);

}
exports.save = save;
/************************************************************************************************************************
@function read: Called when the user wants to view his/her synced items. Depending on the user's preferences the datas wil be
* read from certain servers.
* @param readInfo {Object} - Necessary datas to be able to read
*************************************************************************************************************************/
function read(readInfo){

	if (chosenServer == DROPBOX){
		var dRead = JSON.parse(JSON.stringify(readInfo));
		dRead.token = dropboxDatas.access_token;
		dropbox.read(dRead);
	}
	else if (chosenServer == GOOGLE_DRIVE){
		var gRead = JSON.parse(JSON.stringify(readInfo));
		gRead.token = gapiDatas.access_token;
		gapi.read(gRead);
	}
	else if (chosenServer == BOTH){
		var dRead = JSON.parse(JSON.stringify(readInfo));
		dRead.token = dropboxDatas.access_token;
		dropbox.read(dRead);
		var gRead = JSON.parse(JSON.stringify(readInfo));
		gRead.token = gapiDatas.access_token;
		gapi.read(gRead);
	}
	else if (chosenServer == NONE){
		//Do nothing
	}
	myServer.read(readInfo);
}
exports.read = read;
/************************************************************************************************************************
@function del: Called when the user wants to delete any saved item. The given parameters will tell from which server to be deleted.
* @param server {String} - Where the item lies, in which server
* @param url {String} - The item to be deleted.
* @param element {String} - What type of item is it? tabs, bookmarks or history?
*************************************************************************************************************************/
function del(server,url,element){

	if (server == 'dropbox'){
		var toDelete = new Object();
		toDelete.url = url;
		toDelete.title = element+'.json';
		toDelete.token = dropboxDatas.access_token;
		dropbox.del(toDelete);
	}
	else if (server == 'gapi'){
		var toDelete = new Object();
		toDelete.url = url;
		toDelete.title = element+'.json';
		toDelete.token = gapiDatas.access_token;
		gapi.del(toDelete);
	}
	else if(server == 'mysite'){
		var message = {};
		message.msg = "Sync & Share: Please delete items from the server!";
		message.type = "error";
		emit(exports,'showMessage',message);
			
	}
}
exports.del = del;
/************************************************************************************************************************
@function handleNotAuthorized: Called when any of the server tells this module that the use is not logged in!
* @param serverName {String} - The server which makes this call
*************************************************************************************************************************/
function handleNotAuthorized(serverName){
	var toDisplay = new Object();
	toDisplay.server = serverName;
	toDisplay.data = new Object();
	toDisplay.data['msg'] = "You are not signed in "+serverName+". Please sign in!";
	emit(exports,'display',toDisplay);
}

/************************************************************************************************************************
@function start: Start function, start listening to events.
*************************************************************************************************************************/
function start(){
	//Set the server:
	setServer();
	preferences.on('serverChanged',changeServer);
	//When the authentication process is completed:
	gapi.on('authComplete',handleGapiAuth);
	//Display the downloaded data.  
	gapi.on('display',handleDisplay);
	//To show the corresponding message
	gapi.on('showMessage',handleShowMessage); 
	gapi.on('notAuthorized',handleNotAuthorized);
	//When the authentication process is completed:
	dropbox.on('authComplete',handleDropboxAuth);
	dropbox.on('notAuthorized',handleNotAuthorized);
	//Display the downloaded data.  
	dropbox.on('display',handleDisplay);
	//To show the corresponding message
	dropbox.on('showMessage',handleShowMessage); 
	//My server wants to display some datas
	myServer.on('display',handleDisplay);
	//My server : The user is not authorized
	myServer.on('notAuthorized',handleNotAuthorized);
}
exports.start = start;
function clean(){
	//Stop listening!
	preferences.removeListener('serverChanged');
	gapi.removeListener('authComplete');
	//Display the downloaded data.  
	gapi.removeListener('display');
	//To show the corresponding message
	gapi.removeListener('showMessage'); 
	gapi.removeListener('notAuthorized');
	//When the authentication process is completed:
	dropbox.removeListener('authComplete');
	dropbox.removeListener('notAuthorized');
	//Display the downloaded data.  
	dropbox.removeListener('display');
	//To show the corresponding message
	dropbox.removeListener('showMessage'); 
	//My server wants to display some datas
	myServer.removeListener('display');
	//My server : The user is not authorized
	myServer.removeListener('notAuthorized');
}

exports.clean = clean; 
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};
