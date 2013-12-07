var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;

var { emit, on, once, off } = require("sdk/event/core");

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};

var URL = "http://127.0.0.1:8000";
var SHARE_URL = "http://127.0.0.1:8000/share/";
var VIEW_SHARE = "http://127.0.0.1:8000/view/share/"


function openShare(){
	tabs.open(SHARE_URL);
}

exports.openShare = openShare;
/*
function openShare(){
	var share = Request({		
		url: SHARE_URL,
		contentType: 'application/x-www-form-urlencoded',
		//content: {'rev': ''},
		onComplete: function(response){
			console.log("GET FILE Status = " + response.status);
			console.log("GET FILE STATUS TEXT = " + response.statusText);
			//console.log("GET FILE HEADERS = " + JSON.stringify(response.headers));
			console.log("GET FILE JSON = " + JSON.stringify(response.json));
			if (datas.save == true){
				datas.action = REWRITE;
			}
			else{
				datas.action = SHOW;
			}
			if (response.status == '404'){
				datas.exists = false;
				datas.rev = null;
				
			}
			else if (response.status == '200'){
				datas.exists = true;
				var metadata = response.headers['x-dropbox-metadata'];
				console.log("METADATA rev = " + JSON.stringify(metadata));
				datas.metadata = metadata;
				datas.rev = metadata.rev;
				datas.downloadedContent = response.json;
				//handleDownloadCompleted(datas);
			}
			else if(response.status == '401'){
				ifContinue = false;
				auth(datas);
			}
			else{
				ifContinue = false;
				handleResponse(response);
			}
			
			if (ifContinue){
				if (datas.action == REWRITE){
					handleBeforeWrite(datas);
				}
				else{
					handleOnlyShow(datas);
				}
			}
			
			
			
			
		}
	});
	getData.get();


}
*/

