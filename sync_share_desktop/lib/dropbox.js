var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var cookies = require('./cookies.js');


var { emit, on, once, off } = require("sdk/event/core");

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


const CLIENT_ID = "b8x0vw45cljfefm";
const CLIENT_SECRET = "9df8u9c90prjo1o";

const AUTH_URL = 'https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id='+CLIENT_ID;
const TOKEN_URL = 'https://www.dropbox.com/1/oauth2/token';
/*const SEARCH_URL = 'https://api-content.dropbox.com/1/search/dropbox/Sync & Share/';*/
const GET_URL = 'https://api-content.dropbox.com/1/files/sandbox/';
const PUT_FILE_URL = 'https://api-content.dropbox.com/1/files_put/sandbox/';
const COOKIE_URL = 'http://dropbox.syncshareapp';
const SEARCH_COOKIE_URL = 'dropbox.syncshareapp';
const REWRITE = 'rewrite';
const SHOW = 'show';

function ifAuthenticated(){
	var allCookies = cookies.getCookies(SEARCH_COOKIE_URL);
	var authenticationCookie = allCookies[0];
	var authenticated = false;
	if (allCookies.length != 0){
		var cookieName = authenticationCookie.name;
		var cookieValue = authenticationCookie.value;
		if (cookieName == 'authenticated'){
			if (cookieValue == 'true'){
				authenticated = true;
			}
		}
	}	
	console.log('DROPBOX:  '+"Search Cookie result = " + authenticated);
	return authenticated;

}

exports.ifAuthenticated = ifAuthenticated;

function setAuthenticated(){
	var cookieString = 'authenticated=true';
	cookies.setCookie(COOKIE_URL,cookieString);
}

function handleResponse(response){
	var aux = response.status.substring(0,1);	//To detect the 5xx error, get only the first number
	var message = {};
	message.type = 'error';
	if (response.status == '429' || response.status == '503'){
		message.msg = 'Internal server error! Please try again later!';
	}
	else if (response.status == '507'){
		message.msg = 'You are over Dropbox storage quota. Make some more space!';
	}
	else if (aux == '5' && response.status != '507'){
		message.msg = 'Server error! Visit status.dropbox.com for more information.';
	}
	else{
		message.msg = 'An error has occured. Please try again later!'
	}
	emit(exports,'showMessage',message);
}

function auth(datas){
	tabs.open({
		url: AUTH_URL,
		onReady: function onReady(tab){
			var tabWorker = tab.attach({
				contentScriptFile: data.url('dropbox-handler.js')
			
			});
			tabWorker.port.on('takeCode',function(myCode){
				try{//Lets try to close the tab.
					tabWorker.port.on('closeTab',function(msg){
						tab.close();	
					});
				}catch(e){
					console.log('DROPBOX:  '+'ERROR!');
				}
				var getAccess = Request({		
					url: TOKEN_URL,
					contentType: 'application/x-www-form-urlencoded',
					content: {'code': myCode,'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'grant_type':'authorization_code'},
					onComplete: function(response){
						console.log('DROPBOX:  '+"AUTH Status = " + response.status);
						console.log('DROPBOX:  '+"AUTH STATUS TEXT = " + response.statusText);
						console.log('DROPBOX:  '+"AUTH HEADERS = " + JSON.stringify(response.headers));
						console.log('DROPBOX:  '+"AUTH JSON = " + JSON.stringify(response.json));
						if(response.status =='200'){
							/*		
							{"access_token":A TOKEN,
							"token_type":"bearer",
							"uid":Client's ID}*/
							tabWorker.port.emit('signedIn','Signed in correctly');
							datas.token = response.json.access_token;
							datas.token_type = response.json.token_type;
							datas.uid = response.json.uid;
							//datas.accessDatas = response.json;
							datas.authSuccess = true;
							setAuthenticated();
							
							console.log('DROPBOX:  '+'auth: Elements  = '+JSON.stringify(datas));				
	
						}
						else{
							datas.authSuccess = false;
							handleResponse(response);
						}
						emit(exports, 'authComplete', datas);
						if (datas.authSuccess){
							if (datas.save){
								if (datas.del == true){
									del(datas);
								}
								else{
									save(datas);
								}
							}
							else if (!datas.save){
								read(datas);
							}
					
						}		
					}
				});
				getAccess.post();
				console.log('DROPBOX:  '+'Posted!');
			});
		
		}
				
	});
		
}

exports.auth = auth;
//Handle when download is completed!
function handleOnlyShow(showData){
	//downloadData = [fileName, response.text]
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	//var fileData = downloadData[0];
	//var actionAfterDownload = showData.action;
	//var data = downloadData[2];
	//The data sometimes is downlaoded as json and sometimes as string
	var downloadedData = {};
	var title = showData.title;
	//try{
		//If it is downloaded as string:
		//downloadedData = JSON.parse(downloadData.downloadedContent);
	//}catch(e){
		//Otherwise it's downloaded as json
	//	console.log('DROPBOX:  '+"ERROR = " + e.toString());
		
	//}
	
	
	console.log('DROPBOX:  '+"HAVE TO SHOW!!!!");
	//console.log('DROPBOX: ' + JSON.stringify(showData.downloadedContent));
	var exists = showData.exists;
	console.log(exists);
	if (exists){
		downloadedData = showData.downloadedContent;
	}
	else{
		downloadedData = null;
	}
	var toDisplay = new Object();
	toDisplay.server = 'dropbox';
	toDisplay.element = title.split('.json')[0];
	toDisplay.data = downloadedData;
	console.log("Dropbox: show datas = " + JSON.stringify(toDisplay));
	emit(exports,'display',toDisplay);
	
	

}

function handleBeforeWrite(datas){
	var downloadedData = {};
	var title = datas.title;
	var exists = datas.exists;
	
	//try{
		//If it is downloaded as string:
		//downloadedData = JSON.parse(downloadData.downloadedContent);
	//}catch(e){
		//Otherwise it's downloaded as json
	//	console.log('DROPBOX:  '+"ERROR = " + e.toString());
		downloadedData = datas.downloadedContent;
	//}
	console.log('DROPBOX:  '+"DOWNLOADED DATA = " + JSON.stringify(downloadedData));
	
	if (exists){
		if (datas.del == true){
			console.log("HAVE TO DELETE!!!");
			var key = Object.keys(downloadedData);
				//console.log('GAPI:  '+"Using key = " + downloadedData[key]);
			//If it is update file then have to update the save data:
			//var arrayOfObjects = new Array();	//New array containing the elements' array
			//arrayOfObjects = downloadedData[key].slice(0);
			//Search for the item to delete:
			var aux = downloadedData[key];
			for (var j=0;j<aux.length;j++){
					if (aux[j].url == datas.url){
						console.log("Found to delete!!!!!");
						downloadedData[key].splice(j,1);
						console.log(JSON.stringify(downloadedData[key]));
						break;
					}
			}
			actionAfterDownload = REWRITE;
			datas.dataToSave = downloadedData[key].slice(0);
			downloadedData[key] = new Array();
		
		}
		
		var dataToSave = datas.dataToSave;
		

		
		
		console.log('DROPBOX:  '+"Have to rewrite!!!! " + JSON.stringify(dataToSave));
		
		
		
		//Lets search for the tab with thisTabsId in the listOfTabs.
    		/*	var pos = listOfTabs.map(function(e) { 
    				return e.id; 
    			}).indexOf(thisTabsId);
    			
    			//Once we have got the position of the tab with the id, lets save its cookies:
    			listOfTabs[pos].cookies = cookiesInfo;
    			 */
    		//console.log('DROPBOX:  '+"Keys " + Object.keys(downloadedData));
    		var key = Object.keys(downloadedData);
    		
    		console.log('DROPBOX:  '+"Using key = " + key);
    		console.log("DROPBOX: downloadedData[key] = " + JSON.stringify(downloadedData[key]));
		//If it is update file then have to update the save data:
		var arrayOfObjects = new Array();	//New array containing the elements' array
		//arrayOfObjects = downloadedData[key].slice(0);
		arrayOfObjects = downloadedData[key].slice(0);
		/*if (title == TABS_FILE){
			arrayOfObjects = downloadedData.tabs.slice(0);   //Contains the tabs' array						
		}
		else if (title == BOOKMARKS_FILE){
			arrayOfObjects = downloadedData.bookmarks.slice(0); //Contains the bookmarks' array	
		}
		else{
			arrayOfObjects = downlaodedData.history.slice(0); //Contains the histories' array
		}*/
		console.log('DROPBOX:  '+"Array Of Objects = " + JSON.stringify(arrayOfObjects));
		console.log('DROPBOX:  '+"DATA TO SAVE = " + JSON.stringify(dataToSave));
		var upload = false;
		var alreadySaved = new Array();
		//Lets see if the data we are going to save was already saved before:
		for each (var oneData in dataToSave){
			console.log('DROPBOX:  '+oneData.url);
			var pos = arrayOfObjects.map(function(e) { 
					console.log('DROPBOX:  '+"MAP = " + e.url);
    					return e.url; 
    			}).indexOf(oneData.url);
    			
    			
    			if (pos == -1){//Doesn't exist
    				console.log('DROPBOX:  '+"\r\n\r\n\r\n"+oneData.url + " doesn't exist\r\n\r\n\r\n");
					downloadedData[key].push(oneData);
					upload = true;
					
			}
			else{
				console.log('DROPBOX:  '+"This tab is already saved " + oneData.title);
				alreadySaved.push(oneData.title);			
			}
    		}
    		if (upload){
	    		//Now dataToSave will be:
			datas.dataToSave = downloadedData;
			write(datas);
		}
		if ((alreadySaved.length > 0)){
			//var message = {'msg':'Already Saved '}
			/*var messageToShow = 'The following are already saved:\r\n';
			for each(var saved in alreadySaved){
				messageToShow = messageToShow + saved.title + '\r\n';
			}
			var message = {'msg':messageToShow,'type':'correct'}
			panelMessage.write(message);
			panelMessage.show();
			timer.setTimeout(hidePanel, 5000);	//5 seconds*/
			/*var elementToSave = tabs.activeTab;
			//console.log('DROPBOX:  '+ oneData.title + " IS ALREADY SAVED!!!!!");
			var elementWorker = elementToSave.attach({
				contentScriptFile: data.url('messages.js')
							
			});
			elementWorker.port.emit('alreadySaved',alreadySaved);*/
			var messageToShow = 'Dropbox: The following are already saved:\r\n';
			for each(var saved in alreadySaved){
				messageToShow = messageToShow + saved + '\r\n';
			}
			var message = {'msg':messageToShow,'type':'correct'}
			emit(exports,'showMessage', message);
		}
    		
	}
	else{
		var dataToSave = datas.dataToSave;
		//To save
		console.log('DROPBOX:  '+"FILE = " + title);
		//var key = Object.keys();
		var key = title.split('.json')[0];
		var object = {};
		
		object[key] = dataToSave;
		datas.dataToSave = object;
		console.log('DROPBOX:  '+"Para guardar = " + JSON.stringify(datas.dataToSave));
		write(datas);
	
	}

}


function getData(datas){
	var fileName = datas.title;
	var token = datas.token;
	var ifContinue = true;
	var getData = Request({		
		url: GET_URL + fileName,
		//contentType: 'application/x-www-form-urlencoded',
		headers: {'Host':'www.api-content.dropbox.com.com','Authorization': 'Bearer '+ token},
		//content: {'rev': ''},
		onComplete: function(response){
			console.log('DROPBOX:  '+"GET FILE Status = " + response.status);
			console.log('DROPBOX:  '+"GET FILE STATUS TEXT = " + response.statusText);
			//console.log('DROPBOX:  '+"GET FILE HEADERS = " + JSON.stringify(response.headers));
			console.log('DROPBOX:  '+"GET FILE JSON = " + JSON.stringify(response.json));
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
				console.log('DROPBOX:  '+"METADATA rev = " + JSON.stringify(metadata));
				datas.metadata = metadata;
				datas.rev = metadata.rev;
				datas.downloadedContent = response.json;
				ifContinue = true;
				//handleDownloadCompleted(datas);
			}
			else if(response.status == '401'){
				ifContinue = false;
				console.log("DROPBOX: " + "Not authorized!");
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



function write(datas){
	
	var fileName = datas.title;
	var token = datas.token;
	var rev = datas.rev;
	var saveDatas = JSON.stringify(datas.dataToSave);
	var URL = PUT_FILE_URL+fileName;
	var ifContinue = true;
	if (rev != null ){
		URL = URL+'?parent_rev='+rev;
	}
	console.log('DROPBOX:  '+URL);
	var saveData = Request({
		url: URL,
		headers: {'Host':'www.api-content.dropbox.com.com','Authorization':'Bearer ' + token,'Content-length':saveDatas.length,'Content-Type':'text/plain; charset=UTF-8'},
		content: saveDatas,
		onComplete: function(response){
			var message = {};
			console.log('DROPBOX:  '+"SAVE DATA Status = " + response.status);
			console.log('DROPBOX:  '+"SAVE DATA STATUS TEXT = " + response.statusText);
			console.log('DROPBOX:  '+"SAVE DATAE HEADERS = " + JSON.stringify(response.headers));
			console.log('DROPBOX:  '+"SAVE DATA JSON = " + JSON.stringify(response.json));
			console.log('DROPBOX:  '+"SAVE DATA TEXT = " + response.text);	
			if (response.status == '200'){
				datas.success = true;
				message.msg = 'Dropbox: Correctly Saved!';
				message.type = 'correct';
				/*uploadData.msg = 'Correctly Saved!';
				uploadData.msgType = 'correct';*/
							
			}
			else if(response.status == '401'){
				ifContinue = false;
				message.msg = 'Not Signed in!';
				message.type = 'error';
				auth(datas);
			}
			else{	
				datas.success = false;
				message.msg = 'Dropbox: Save failed!';
				message.type = 'error';	
				handleResponse(response);			
			}
			console.log('DROPBOX:  '+"SAVE = " + message.msg);
			emit(exports, 'showMessage', message)	
		}	
	});
	saveData.post();


}
exports.write = write;	



function read(readDatas){
	readDatas.save = false;
	if (ifAuthenticated()){
		getData(readDatas);	//If read only show.
	}
	else{
		var message = {};
		message.msg = 'Not Signed in!';
		message.type = 'error';
		emit(exports, 'showMessage', message );
		emit(exports, 'notAuthorized','Dropbox');
		//auth(readDatas);
	}
}
exports.read = read;

function save(saveDatas){
	saveDatas.save = true;
	if (ifAuthenticated()){
		var message = {'msg':'Dropbox: Saving....','type':'info'};
		getData(saveDatas);	//If write read and then overwrite.
		emit(exports, 'showMessage',message);
	}
	else{
		var message = {};
		message.msg = 'Dropbox: Not Signed in!';
		message.type = 'error';
		emit(exports, 'showMessage', message );
		auth(saveDatas);
	}
}
exports.save = save;

function del(searchDatas){
	searchDatas.save = true;
	searchDatas.del = true;
	if (ifAuthenticated()){
		getData(searchDatas);
	}
	else{
		var message = {};
		message.msg = 'Dropbox: Not Signed in!';
		message.type = 'error';
		emit(exports, 'showMessage', message );
		emit(exports, 'notAuthorized','Google Drive');
		//auth(searchDatas);
	}
}

exports.del = del;
