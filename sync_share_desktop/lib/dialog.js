var data = require("sdk/self").data;
var constants = require('./constants.js');
var tabs = require('sdk/tabs');
var { emit, on, once, off } = require("sdk/event/core");


const LOGIN_URL = constants.LOGIN_URL;
var alreadyOpen = false;


exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


function checkIfOpen(){
	var found = false;
	for each(var aTab in tabs){
		if (aTab.url == LOGIN_URL){
			found = true;
			break;
		}
	}
	if (found == false){
		if (alreadyOpen == false){
			return false;
		}
	}
	else{
		return true;
	}
	
}

var thisTab;
function loginDialog(){
	console.log("Dialog = " + LOGIN_URL);
	try{
		
		var if_open = checkIfOpen();
		if (if_open == false){
			console.log("DIALOG: if open = " + if_open);
			tabs.open({
				url: LOGIN_URL,
				onReady: function(tab){
					thisTab = tab;
					var tabWorker = tab.attach({
						contentScriptFile: data.url('mysite-login.js')
						
					});
					try{
						tabWorker.port.on('takeEmail',function(email){
							console.log("DIALOG: logged in!");
						emit(exports,'loggedIn',email);
				
						});
					}catch(f){
						console.log('dialog: Error ' + f.toString());
					}
				},
				onClose: function(tab){
						alreadyOpen = false;
				}
			});
			alreadyOpen = true;
			
		}
		else{
				if (thisTab){
					thisTab.activate();
				}
		}
	}catch(e){
		console.log('dialog:  '+e.toString());
	}
}


exports.loginDialog = loginDialog;
