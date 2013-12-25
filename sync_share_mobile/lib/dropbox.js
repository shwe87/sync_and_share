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
	//console.log("Search Cookie result = " + authenticated);
	return authenticated;

}

exports.ifAuthenticated = ifAuthenticated;

function setAuthenticated(){
	var cookieString = 'authenticated=true';
	cookies.setCookie(COOKIE_URL,cookieString);
}

function handleResponse(response){
	var aux = response.status.substring(0,1);	//To detect the 5xx error, get only the first number
	var message = '';
	if (response.status == '429' || response.status == '503'){
		message = 'Internal server error! Please try again later!';
	}
	else if (response.status == '507'){
		message = 'You are over Dropbox storage quota. Make some more space!';
	}
	else if (aux == '5' && response.status != '507'){
		message = 'Server error! Visit status.dropbox.com for more information.';
	}
	else{
		message = 'An error has occured. Please try again later!'
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
					//console.log('ERROR!');
				}
				var getAccess = Request({		
					url: TOKEN_URL,
					contentType: 'application/x-www-form-urlencoded',
					content: {'code': myCode,'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'grant_type':'authorization_code'},
					onComplete: function(response){
						//console.log("AUTH Status = " + response.status);
						//console.log("AUTH STATUS TEXT = " + response.statusText);
						//console.log("AUTH HEADERS = " + JSON.stringify(response.headers));
						//console.log("AUTH JSON = " + JSON.stringify(response.json));
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
							
							//console.log('auth: Elements  = '+JSON.stringify(datas));				
	
						}
						else{
							datas.authSuccess = false;
							handleResponse(response);
						}
						emit(exports, 'authComplete', datas);
						if (datas.authSuccess){
							if (datas.save){
								save(datas);
							}
							else if (!datas.save){
								read(datas);
							}
					
						}		
					}
				});
				getAccess.post();
				//console.log('Posted!');
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
	//	//console.log("ERROR = " + e.toString());
		
	//}
	
	downloadedData.element = title.split('.json')[0];
	downloadedData.server = 'dropbox';
	//console.log("HAVE TO SHOW!!!!");
	var exists = showData.exists;
	if (exists){
		downloadedData.data = showData.downloadedContent;
	}
	else{
		downloadedData.data = null;
	}
	emit(exports,'display',downloadedData);
	
	

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
	//	//console.log("ERROR = " + e.toString());
		downloadedData = datas.downloadedContent;
	//}
	//console.log("DOWNLOADED DATA = " + JSON.stringify(downloadedData));
	var dataToSave = datas.dataToSave;
	if (exists){

		
		
		//console.log("Have to rewrite!!!! " + JSON.stringify(dataToSave));
		
		
		
		//Lets search for the tab with thisTabsId in the listOfTabs.
    		/*	var pos = listOfTabs.map(function(e) { 
    				return e.id; 
    			}).indexOf(thisTabsId);
    			
    			//Once we have got the position of the tab with the id, lets save its cookies:
    			listOfTabs[pos].cookies = cookiesInfo;
    			 */
    		////console.log("Keys " + Object.keys(downloadedData));
    		var key = Object.keys(downloadedData);
    		////console.log("Using key = " + downloadedData[key]);
		//If it is update file then have to update the save data:
		var arrayOfObjects = new Array();	//New array containing the elements' array
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
		//console.log("Array Of Objects = " + JSON.stringify(arrayOfObjects));
		//console.log("DATA TO SAVE = " + JSON.stringify(dataToSave));
		var upload = false;
		var alreadySaved = new Array();
		//Lets see if the data we are going to save was already saved before:
		for each (var oneData in dataToSave){
			//console.log(oneData.url);
			var pos = arrayOfObjects.map(function(e) { 
					//console.log("MAP = " + e.url);
    					return e.url; 
    			}).indexOf(oneData.url);
    			
    			
    			if (pos == -1){//Doesn't exist
    				//console.log("\r\n\r\n\r\n"+oneData.url + " doesn't exist\r\n\r\n\r\n");
				downloadedData[key].push(oneData);
				upload = true;
					
			}
			else{
				//console.log("This tab is already saved " + oneData.title);
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
			////console.log( oneData.title + " IS ALREADY SAVED!!!!!");
			var elementWorker = elementToSave.attach({
				contentScriptFile: data.url('messages.js')
							
			});
			elementWorker.port.emit('alreadySaved',alreadySaved);*/
			var messageToShow = 'The following are already saved:\r\n\r\n';
			for each(var saved in alreadySaved){
				messageToShow = messageToShow + saved + '\r\n\r\n';
			}
			var message = messageToShow;
			emit(exports,'showMessage', message);
		}
    		
	}
	else{
		//To save
		//console.log("FILE = " + title);
		//var key = Object.keys();
		var key = title.split('.json')[0];
		var object = {};
		
		object[key] = dataToSave;
		datas.dataToSave = object;
		//console.log("Para guardar = " + JSON.stringify(datas.dataToSave));
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
			//console.log("GET FILE Status = " + response.status);
			//console.log("GET FILE STATUS TEXT = " + response.statusText);
			////console.log("GET FILE HEADERS = " + JSON.stringify(response.headers));
			//console.log("GET FILE JSON = " + JSON.stringify(response.json));
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
				//console.log("METADATA rev = " + JSON.stringify(metadata));
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
	//console.log(URL);
	var saveData = Request({
		url: URL,
		headers: {'Host':'www.api-content.dropbox.com.com','Authorization':'Bearer ' + token,'Content-length':saveDatas.length,'Content-Type':'text/plain; charset=UTF-8'},
		content: saveDatas,
		onComplete: function(response){
			var message = '';
			//console.log("SAVE DATA Status = " + response.status);
			//console.log("SAVE DATA STATUS TEXT = " + response.statusText);
			//console.log("SAVE DATAE HEADERS = " + JSON.stringify(response.headers));
			//console.log("SAVE DATA JSON = " + JSON.stringify(response.json));
			//console.log("SAVE DATA TEXT = " + response.text);	
			if (response.status == '200'){
				datas.success = true;
				message = 'Dropbox: Correctly Saved!';
				/*uploadData.msg = 'Correctly Saved!';
				uploadData.msgType = 'correct';*/
							
			}
			else if(response.status == '401'){
				ifContinue = false;
				message = 'Dropbox: Not Signed in!';
				auth(datas);
			}
			else{	
				datas.success = false;
				message = 'Dropbox: Save failed!';	
				handleResponse(response);			
			}
			//console.log("SAVE = " + message.msg);
			emit(exports, 'showMessage', message);	
		}	
	});
	saveData.post();


}
exports.write = write;	



function read(readDatas){
        readDatas.save = false;
        if (ifAuthenticated()){
                getData(readDatas);        //If read only show.
        }
        else{
                var toShow = new Object();
                toShow.data = new Object();
                toShow.data['msg'] = "Dropbox: Not signed in. Please sign in!";
                toShow.element = readDatas.title.split('.json')[0];
                toShow.server = 'dropbox';
                //emit(exports, 'showMessage', message );
                emit(exports, 'notAuthorized',toShow);
                //auth(readDatas);
        }
}
exports.read = read;

function save(saveDatas){
        saveDatas.save = true;
        if (ifAuthenticated()){
                var message = 'Saving....';
                getData(saveDatas);        //If write read and then overwrite.
                emit(exports, 'showMessage',message);
        }
        else{
                var message = 'Dropbox: Not Signed in!';
                emit(exports, 'showMessage', message );
                auth(saveDatas);
        }
}
exports.save = save;
