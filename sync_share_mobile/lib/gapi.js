/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * 																														|
 * This module was created to be able to use the Google Drive API to write and read in my app's folder. Information 	|
 * about the Google Drive API, where I learnt to use Google Drive's API:												| 																									|
 * https://developers.google.com/accounts/docs/OAuth2InstalledApp														|
 * https://developers.google.com/drive/v2/reference/																	|											|
 ************************************************************************************************************************/	

/**********************************************SDK Modules*************************************************************/
var { emit, on, once, off } = require("sdk/event/core");
var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;
var cookies = require('./cookies');
/****************************************** GOOGLE DRIVE OAUTH CONSTANTS************************************************************/
const CLIENT_ID = '737302378245.apps.googleusercontent.com';
const CLIENT_SECRET = 'rcWgBDcdt9PuVnrKGXz81Hf7'; 
const REDIRECT_URI_URN = 'urn:ietf:wg:oauth:2.0:oob';
const REDIRECT_URI_LOCAL = 'http://localhost';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
var URL = 'https://accounts.google.com/o/oauth2/auth?'+'scope='+encodeURIComponent(SCOPE)+'+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&'+'redirect_uri=' + encodeURIComponent(REDIRECT_URI_URN) + '&'+ 'client_id=' + encodeURIComponent(CLIENT_ID)+'&'+'response_type='+encodeURIComponent('code');
/**********************************************CONSTANTS*****************************************************************************/
/*Files we can work with*/
const TABS_FILE = 'tabs.json';
const BOOKMARKS_FILE = 'bookmarks.json';
const HISTORY_FILE = 'history.json';
/*Actions that can be done:*/
const REWRITE = 'rewrite';
const SHOW = 'show';
const COOKIE_URL = 'http://googledrive.syncshareapp';
const SEARCH_COOKIE_URL = 'googledrive.syncshareapp';
/**********************************************Google Dive API variables:*************************************************************/
/*Google drive necessary var.*/
var access_token;
var token_type;
var expires_in;
var id_token;
var refresh_token;
var resumable_sesion_uri;
var theCode;
/************************************************************************************************************************************/
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};
/*
When the token was expired!
info: synctab: Search File = Unauthorized
info: synctab: Search File = 401
info: synctab: Search File = {"Alternate-Protocol":"443:quic","Cache-Control":"private, max-age=0","Content-Encoding":"gzip","Content-Length":"162","Content-Type":"application/json; charset=UTF-8","Date":"Tue, 29 Oct 2013 13:34:06 GMT","Expires":"Tue, 29 Oct 2013 13:34:06 GMT","Server":"GSE","WWW-Authenticate":"Bearer realm=\"https://www.google.com/accounts/AuthSubRequest\", error=invalid_token","x-content-type-options":"nosniff","X-Frame-Options":"SAMEORIGIN","X-XSS-Protection":"1; mode=block","X-Firefox-Spdy":"3"}
info: synctab: Search File = {
 "error": {
  "errors": [
   {
    "domain": "global",
    "reason": "authError",
    "message": "Invalid Credentials",
    "locationType": "header",
    "location": "Authorization"
   }
  ],
  "code": 401,
  "message": "Invalid Credentials"
 }
}

*/

/************************************************************************************************************************
@function ifAuthenticated: The user is authenticated in Dropbox? Checks it through cookies
* @return authenticated {Boolean}: IF authenticated or not:
*************************************************************************************************************************/
function ifAuthenticated(){
	//Use the cookies module to see if the user is authenticated: More details in cookies.js
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
	return authenticated;

}
exports.ifAuthenticated = ifAuthenticated;

/************************************************************************************************************************
@function setAuthenticated: Set the cookies to know that the user has authenticated.
*************************************************************************************************************************/
function setAuthenticated(){
	var cookieString = 'authenticated=true';
	cookies.setCookie(COOKIE_URL,cookieString);
}

function handleResponse(response){
	var message = {};
	message.type = 'error';
	message.msg = response.json.error.message + " Please try again!";
	emit(exports,'showMessage',message);
}


function handleResponse(response){
	var message = response.json.error.message + " Please try again!";
	emit(exports,'showMessage',message);
}

/************************************************************************************************************************
@function auth: Authenticate the user:
* @param {object} datas: Object that contains the necessary values to authenticate the user, After authentication,
* what to do?
* 	--> datas.save: Call the save function or not. May be its just to show, then call the read function
* 	--> datas.del: Call the delete function
*************************************************************************************************************************/
function auth(datas){
	tabs.open({
		url: URL,
		onReady: function(tab){
			var tabWorker = tab.attach({
				//This javascript gets the code to make this app get to work:
				contentScriptFile: data.url('google-drive-handler.js')
	 		});
	 		tabWorker.port.on('takeCode',function(myCode){
				theCode = myCode;
				try{//Lets try to close the tab.
					tabWorker.port.on('closeTab',function(msg){
						tab.close();
					});
				}catch(e){
					//Means that it is already closed!
				}
				var getAccess = Request({		
					url: 'https://accounts.google.com/o/oauth2/token',
					contentType: 'application/x-www-form-urlencoded',
					//As specified by google drive API:
					content: {'code': myCode,'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'redirect_uri':REDIRECT_URI_URN,'grant_type':'authorization_code'},
					onComplete: function(response){
						if(response.statusText =='OK'){
							/*
							 * EVERTYTHING OK!
							The response format will be:
							 {
							  "access_token" : string,
							  "token_type" : string,
							  "expires_in" : 3600,
							  "id_token" : string,
							  "refresh_token" : string
							}
							To access this; response.json.access_token, etc
							*/
							tabWorker.port.emit('signedIn','Signed in correctly');
							datas.token = response.json.access_token;
							datas.token_type = response.json.token_type;
							datas.expires_in = response.json.expires_in;
							datas.id_token = response.json.id_token;
							datas.refresh_token = response.json.refresh_token;
							//datas.accessDatas = response.json;
							datas.authSuccess = true;
							setAuthenticated();
						}		
						else{
							datas.authSuccess = false;
						}
						//Tell the one who is listening that the auth was complete (to the server module):
						//And give it the authenticated datas:
						emit(exports, 'authComplete', datas);
						if (datas.authSuccess){
							if (datas.save){
								if (datas.del == true){
									del(datas);				//Call the delete function
								}else{
									save(datas);			//Call the save function
								}
							}
							else if (!datas.save){
								read(datas);				//Call the read function
							}
					
						}
					}
				});
				getAccess.post();	//POST the authorization datas
			});
		
		}	
	});	

	
};

exports.auth = auth;
/************************************************************************************************************************
@function handleSearchFile- Handle when the search is complete. In Google Drive, first you have to search for the file
* and then download it or write on it.
* @param {Object} fileData - Contains the following:
* 	--> fileData.exists {Boolean} - If the searched file exists or not:
* 	--> fileData.title {String} - The title of the file to download.
* 	--> fileData.dataToSave {JSON oject} - The data to save.
* 	--> fileData.token {String} - The token to let Google Drive know that I am authorized.
* 	--> fileData.dLoadURL {String} - This is given by the search file result (Google Drive API value).
* 	--> fileData.fileId {String} - Given by google drive search result (Google Drive API value).  
*************************************************************************************************************************/
//Handle the result of the search file function:
function handleSearchFile(fileData){
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	var exists = fileData.exists;
	var fileName = fileData.title;
	var dataToSave = fileData.dataToSave;		
	if (exists){
		if (fileData.save == true){		
			//Download the file & save:
			fileData.action = REWRITE;
			downloadData(fileData);
		}
		else{
			//Only for download:
			fileData.action = SHOW;
			downloadData(fileData);
		}
		
			
	}
	else{
		//If the file doesn't exist then we have to create the file
		if (fileData.save == true){
			//To save;
			var key = fileName.split('.json')[0];
			var object = {};
			object[key] = dataToSave;
			fileData.dataToSave = object;
			startUpload(fileData);
		}
		else{
			//Just to download, but there is nothing.
			var toDisplay = {};
			toDisplay.data = null;
			toDisplay.element = fileName.split('.json')[0];
			toDisplay.server = 'gapi';
			emit(exports, 'display',toDisplay);
			
		}			
	}
}




/************************************************************************************************************************
@function searchFile - Search for a file.
* @param {Object} searchDatas - Contains the following:
* 	--> searchDatas.token {Boolean} - To let Google Drive know that I am authorized
* 	--> searchDatas.title {String} - The title of the file to download.
* 	--> searchDatas.dataToSave {JSON oject} - The data to be saved.  
*************************************************************************************************************************/
//Search for specific file with the file name title.
function searchFile(searchDatas){
	//title, dataToSave, token
	var title = searchDatas.title;
	var token = searchDatas.token;
	var dataToSave = searchDatas.dataToSave;

	//If dataToSave null then there is nothing to save
	//ElementToSave: 
        var exists = false;	//Lets assume that it doesn't exist.
		var request = "https://www.googleapis.com/drive/v2/files?q=title+=+'"+encodeURIComponent(title)+"'";
        var whoCalled = 'searchFile';
        var searchFor = Request({
                url: request,
                headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token},
                onComplete: function(response){
                	if (response.status == '401'){	//Invalid token; Unauthorized
						//whoCalled set because after the authorization takes place , the call can be returned here.
						searchDatas.whoCalled = whoCalled;
						searchDatas.authorized = false;
						auth(searchDatas);
                	}
                	else if (response.status == '200'){ //Everything fine
                		var dLoadURL = '';
						var fileId = '';
		               	if (response.json.items.length == 0){
		               		// If there is no item then the file doesn't exist-
		               		exists = false;                      		
		               	}
		               	else{
		               		//The files exists.
		               		exists = true;
		               		//The format in which the Google Drive gives us the following datas:
		               		dLoadURL = response.json.items[0].downloadUrl;
		               		fileId = response.json.items[0].id;		
		               		searchDatas.dLoadURL = dLoadURL;
		               		searchDatas.fileId = fileId;               				
		               	}
		               	searchDatas.exists = exists;
		               	handleSearchFile(searchDatas);
		        }
                       
                }
        });
        searchFor.get();
}






/************************************************************************************************************************
@function uploadFile - Upload a file.
* @param {Object} uploadData - Contains the following:
* 	--> uploadData.token {String} - To let Google Drive know that I am authorized
* 	--> uploadData.title {String} - The title of the file to download.
* 	--> uploadData.dataToSave {JSON oject} - The data to be saved.  
* 	--> uploadData.resumable_sesion_uri {String} - If the upload gets disconnected, it can be resumed with this URI.
*************************************************************************************************************************/
//Upload the file
function uploadFile(uploadData){
	//uploadFile = [fileData, resumable_sesion_uri]
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	var dataToSave = uploadData.dataToSave;
	var token = uploadData.token;
	var resumable_sesion = uploadData.resumable_sesion_uri;
	var str = JSON.stringify(dataToSave);
	var session = Request({		
		url: resumable_sesion,
		headers: {'Authorization': 'Bearer '+ token/*'Content-Length':38*/,'Content-Type':'application/json; charset=UTF-8'},
		content: str,
		onComplete: function(response){			
			if (response.status == '200'){
				resumable_sesion = response.headers.Location;
				uploadData.resumable_sesion_uri = resumable_sesion;
				var message = 'Correctly Saved!';
				emit(exports, 'showMessage', message);
			}
			else if (response.status == '401'){
				auth(uploadData);
			} 
		}
	
	});
	session.put();

}
/************************************************************************************************************************
@function startUpload - In Google Drive, first you have to search the file, then start the upload (tell Google Drive that
* we are going to upload) and then upload the file
* @param {Object} fileData - Contains the following:
* 	--> fileData.token {String} - To let Google Drive know that I am authorized
* 	--> fileData.title {String} - The title of the file to download.
* 	--> uploadData.dataToSave {JSON oject} - The data to be saved.  
* 	--> uploadData.exist {Boolean} - IF the searched file exists or not.
*************************************************************************************************************************/
//Start the upload process:
function startUpload(fileData){
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	var exists = fileData.exists;
	var fileName = fileData.title;
	var dataToSave = fileData.dataToSave;
	var token = fileData.token;

	if (!exists){		
		//If it is a new file then create it:
		var parents = [{'id':'appdata'}];
		var j = {'title': fileName,'parents':parents};
		var str = JSON.stringify(j);
		var session = Request({		
			url: 'https://www.googleapis.com/upload/drive/v2/files?uploadType='+encodeURIComponent('resumable'),
			headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token,'Content-Length':38,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json'/*,'X-Upload-Content-Length':2000000*/},
			content: str,
			onComplete: function(response){
				
				if (response.status == '200'){
					resumable_sesion_uri = response.headers.Location;
					fileData.resumable_sesion_uri = response.headers.Location;
					uploadFile(fileData);
				}
				else if (response.status == '401'){
					auth(fileData);
				}
				
						
			}	
		});
		session.post();
	}
	else{
		var downloadURL = fileData.dLoadURL;
		var fileId = fileData.fileId;
		//Try to just add lines, not upload a new file.
		//First step: Start a resumable session:
		var session = Request({                
		        url: 'https://www.googleapis.com/upload/drive/v2/files/'+fileId+'?uploadType='+encodeURIComponent('resumable'),
		        headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token},
		        onComplete: function(response){
		               
					if (response.status == '200'){
						resumable_sesion_uri = response.headers.Location;  
						fileData.resumable_sesion_uri = response.headers.Location;
						uploadFile(fileData);  
					}
					else if (response.status == '401'){
						auth(fileData);
					}    
		        }        
		});
		session.put();	
	}
	
}
/*
{"sub":"103447246817889974570","name":"parihu","given_name":"parihu","family_name":".","profile":"https://plus.google.com/103447246817889974570","picture":"https://lh5.googleusercontent.com/-a858WZEYq5E/AAAAAAAAAAI/AAAAAAAAAAA/lip5jBWF6NQ/photo.jpg","email":"shweta.universidad@gmail.com","email_verified":true,"locale":"es"}

OPTIONAL: TO GET THE USER'S DATAS:
function about(token){
	var request = Request({
		url: 'https://www.googleapis.com/oauth2/v3/userinfo',
		headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token},
		onComplete: function(response){
			console.log('GAPI:  '+'ABOUT = ' + response.status+'\r\n\r\n');
			console.log('GAPI:  '+'ABOUT = ' + response.statusText+'\r\n\r\n');
			console.log('GAPI:  '+'ABOUt = ' + JSON.stringify(response.headers+'\r\n\r\n'));
			console.log('GAPI:  '+"ABOUT = " + JSON.stringify(response.json));
		
		
		}
	
	});
	request.get();



}
*/



/*
https://accounts.google.com/o/oauth2/token
POST /o/oauth2/token HTTP/1.1
Host: accounts.google.com
Content-Type: application/x-www-form-urlencoded

client_id=8819981768.apps.googleusercontent.com&
client_secret={client_secret}&
refresh_token=1/6BMfW9j53gdGImsiyUH5kU5RsR4zwI9lUVX-tqf8JXQ&
grant_type=refresh_token

*/
/*
function refreshToken(authDatas){
	 
	 var request = Request({
	 	url: 'https://accounts.google.com/o/oauth2/token';
	 	headers: {'Host':'accounts.google.com','Content-Type':'application/x-www-form-urlencoded'};
	 	content:{'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'refresh_token':authDatas.refresh_token,'grant_type':'authorization_code'},
	 
	 
	 
	 });

}

exports.refreshToken = refreshToken;
*/
/************************************************************************************************************************
@function handleDownloadCompleted - Handle when the download is completed. The downloaded content is only for show
* @param {Object} downloadData - Contains the following:
* 	--> downloadData.exists {Boolean} - If the searched file exists or not:
* 	--> downloadData.title {String} - The title of the file to download.
* 	--> downloadData.dataToSave {JSON oject} - The downloaded object in json  format.  
* 	--> downloadData.action {String} - What to do now? Show or Save
*************************************************************************************************************************/
//Handle when download is completed!
function handleDownloadCompleted(downloadData){
	//downloadData = [fileName, response.text]
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	//var fileData = downloadData[0];
	var actionAfterDownload = downloadData.action;
	//var data = downloadData[2];
	//The data sometimes is downlaoded as json and sometimes as string
	var downloadedData = {};
	var title = downloadData.title;
	try{
		//If it is downloaded as string:
		downloadedData = JSON.parse(downloadData.downloadedContent);
	}catch(e){
		//Otherwise it's downloaded as json
		downloadedData = downloadData.downloadedContent;
	}
	if (actionAfterDownload == REWRITE){
		var dataToSave = downloadData.dataToSave;
		//Lets search for the tab with thisTabsId in the listOfTabs.	
    	var key = Object.keys(downloadedData);
		//If it is update file then have to update the save data:
		var arrayOfObjects = new Array();	//New array containing the elements' array
		arrayOfObjects = downloadedData[key].slice(0);
		var upload = false;
		var alreadySaved = new Array();
		//Lets see if the data we are going to save was already saved before:
		for each (var oneData in dataToSave){
			var pos = arrayOfObjects.map(function(e) { 	
    			return e.url; 
    		}).indexOf(oneData.url);
    			
    			
    		if (pos == -1){//Doesn't exist
				downloadedData[key].push(oneData);
				upload = true;
					
			}
			else{
				alreadySaved.push(oneData.title);			
			}
    		}
    	if (upload){
	    	//Now dataToSave will be:
			downloadData.dataToSave = downloadedData;
			startUpload(downloadData);
		}
		if ((alreadySaved.length > 0)){
			
			var messageToShow = 'The following are already saved:\r\n\r\n';
			for each(var saved in alreadySaved){
				messageToShow = messageToShow + saved + '\r\n\r\n';
			}
			emit(exports,'showMessage', messageToShow);
		}
    		
	}
	else if(actionAfterDownload == SHOW){
		
		var toDisplay = {};
        toDisplay.data = downloadedData;
        toDisplay.element = title.split('.json')[0];
        toDisplay.server = 'gapi';
		emit(exports,'display',toDisplay);
	
	}

}


/************************************************************************************************************************
@function downloadData - Download data from the given link
* @param {Object} datas - Contains the following:
* 	--> datas.token {String} - Tell Google Drive, I am authorized
* 	--> datas.dLoadURL {String} - The Url from which the content will be downloaded
*************************************************************************************************************************/
function downloadData(datas){
	/*fileData = [exists, title, dataToSave, token, dLoadURL, fileId]*/
	var token = datas.token;
	var downloadURL = datas.dLoadURL;
	var whoCalls = 'downloadData';
        var download = Request({
                url: downloadURL,
                headers: {'Authorization': 'Bearer '+ token},
                onComplete: function(response){
                      
                    if(response.status == '401'){
                       		
						auth(datas);
                       
                    }
                    else if(response.status == '200'){
						//If it is just download the datas then:
						datas.downloadedContent = response.text;	
						handleDownloadCompleted(datas);	
                    }
                      
                }
        
        });
        download.get();
}


/*********************************************************************************************************************************
@function read: Calls the searchFile and then the searchFile calls the download and then download calls the handle after download function
@param {Object} searchDatas- object in which all the necessary datas are saved. 
**********************************************************************************************************************************/
function read(searchDatas){
	searchDatas.save = false;
	if (ifAuthenticated()){
		searchFile(searchDatas);
	}
	else{
		var message = 'Not Signed in!';
		emit(exports, 'showMessage', message );
		var toShow = new Object();
		toShow.data = new Object();
		toShow.data['msg'] = "You are not signed in Google-Drive. Please sign in!";
		toShow.element = searchDatas.title.split('.json')[0];
		toShow.server = 'gapi';
		emit(exports, 'notAuthorized',toShow);
	}
}

exports.read = read;

/*********************************************************************************************************************************
@function write: Write in the given data file.
@param {Object} writeDatas- object in which the following details are specified:
	--> @param {string} writeDatas.title - the file's title: can be tabs.json, bookmarks.json or history.json
	--> @param {string} writeDatas.token - the  
**********************************************************************************************************************************/
function save(writeDatas){
	writeDatas.save = true;
	if (ifAuthenticated()){
		searchFile(writeDatas);
	}
	else{
		auth(writeDatas);
	}
}

exports.save = save;




















