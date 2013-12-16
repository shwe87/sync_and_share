var data = require("sdk/self").data;
var LOGIN_URL = 'http://192.168.1.16:8001';
var alreadyOpen = false;
var tabs = require('sdk/tabs');
var { emit, on, once, off } = require("sdk/event/core");

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


function loginDialog(){
	try{
		var if_open = checkIfOpen();
		if (if_open == false){
			tabs.open({
				url: LOGIN_URL,
				onReady: function(tab){
					var tabWorker = tab.attach({
						contentScriptFile: data.url('mysite-login.js')
						
					});
					try{
						
						tabWorker.port.on('takeEmail',function(email){
							console.log("Send logged in!!!");
							emit(exports,'loggedIn',email);
				
						});
					}catch(f){
						console.log('dialog: Error ' + f.toString());
					}
				}
			});
			alreadyOpen = true;
			
			
		}
	}catch(e){
		console.log('dialog:  '+e.toString());
	}
}


exports.loginDialog = loginDialog;
