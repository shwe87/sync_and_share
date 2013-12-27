/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * 																														|
 * This module was created to open a tab where the user can sign in into my Django Server.																						|
 ********************************************************************************************************************** |*/	

/**********************************************SDK Modules*************************************************************/
var { emit, on, once, off } = require("sdk/event/core");
var data = require("sdk/self").data;
var tabs = require('sdk/tabs');
var constants = require('./constants');
/******************************************Variables*******************************************************************/
const LOGIN_URL = constants.LOGIN_URL;			//The log in url
var alreadyOpen = false;						//If the log in dialog is already open
var thisTab;									//The log in tab
/***********************************************************************************************************************/

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};

/**********************************************************************
@function checkIfOpen- Checks if the log in dialog is open or not.
@return if_open: Returns true if open and false if not:
***********************************************************************/  
function checkIfOpen(){
	//Assume that the log in tab is not open
	var found = false;
	//For each tab of all the open tabs see is the log in url is open:
	for each(var aTab in tabs){
		if (aTab.url == LOGIN_URL){
			//The log in tab found!
			found = true;
			//Stop searching
			break;
		}
	}
	//If not found then, it is not open
	if (found == false){
		if (alreadyOpen == false){
			return false;
		}
	}
	else{
		//It is open
		return true;
	}
	
}

/**********************************************************************
@function loginDialog- Open the log in dialog
***********************************************************************/ 
function loginDialog(){
	try{
		//Check if already open
		var if_open = checkIfOpen();
		if (if_open == false){
			//IF not open then open it
			tabs.open({
				url: LOGIN_URL,
				onReady: function(tab){
					//When the document is ready just attach a content script file
					thisTab = tab;
					var tabWorker = tab.attach({
						//This javascript will tells us when the user logs in
						contentScriptFile: data.url('mysite-login.js')
						
					});
					try{
						//Listen to the content script. When the user logs in, the content script
						//gives us the user's email:
						tabWorker.port.on('takeEmail',function(email){
							emit(exports,'loggedIn',email);
				
						});
					}catch(f){
						//The log in tab was closed before the user could log in
					}
				},
				onClose: function(tab){
					//When the tab is closed, then change the var to false:
					alreadyOpen = false;
				}
			});
			//After opening it, tell everyone that the tab is open
			alreadyOpen = true;
	
		}
		else{
			//If already open then just make the log in tab active to the user:
			if (thisTab){
				thisTab.activate();
			}
		}
	}catch(e){
		//Something went wrong while opening the log in tab
	}
}


exports.loginDialog = loginDialog;
