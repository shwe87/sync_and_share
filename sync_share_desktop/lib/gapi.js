var { emit, on, once, off } = require("sdk/event/core");

var data = require("sdk/self").data;
var tabs = require("sdk/tabs");
var Request = require("sdk/request").Request;
var cookies = require('./cookies.js');


/* GOOGLE DRIVE OAUTH CONSTANTS */
const CLIENT_ID = '737302378245.apps.googleusercontent.com';
const CLIENT_SECRET = 'rcWgBDcdt9PuVnrKGXz81Hf7'; 
const REDIRECT_URI_URN = 'urn:ietf:wg:oauth:2.0:oob';
const REDIRECT_URI_LOCAL = 'http://localhost';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata+';
var URL = 'https://accounts.google.com/o/oauth2/auth?'+'scope='+SCOPE+'https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&'+'redirect_uri=' + REDIRECT_URI_URN + '&'+ 'client_id=' + CLIENT_ID+'&'+'response_type=code';

/*Files we can work with*/
const TABS_FILE = 'tabs.json';
const BOOKMARKS_FILE = 'bookmarks.json';
const HISTORY_FILE = 'history.json';


/*Actions that can be done:*/
const REWRITE = 'rewrite';
const SHOW = 'show';


const COOKIE_URL = 'http://googledrive.syncshareapp';
const SEARCH_COOKIE_URL = 'googledrive.syncshareapp';

/*Google drive necessary var.*/
var access_token;
var token_type;
var expires_in;
var id_token;
var refresh_token;
var resumable_sesion_uri;
var theCode;




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
	console.log('GAPI:  '+"Search Cookie result = " + authenticated);
	return authenticated;

}

exports.ifAuthenticated = ifAuthenticated;

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

//This is the auth function: controls the authentication process:
function auth(datas){
	tabs.open({
		url: URL,
		onReady: function(tab){
			var tabWorker = tab.attach({
				contentScriptFile: data.url('google-drive-handler.js')
	 		});
	 		tabWorker.port.on('takeCode',function(myCode){
				theCode = myCode;
				try{
					tabWorker.port.on('closeTab',function(msg){
						tab.close();
					});
				}catch(e){
					console.log('GAPI:  '+'Shut down!!');
				}
				var getAccess = Request({		
					url: 'https://accounts.google.com/o/oauth2/token',
					contentType: 'application/x-www-form-urlencoded',
					content: {'code': myCode,'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'redirect_uri':REDIRECT_URI_URN,'grant_type':'authorization_code'},
					onComplete: function(response){
						//console.log('GAPI:  '+'STATUS ' + response.statusText);
						if(response.statusText =='OK'){
							/*
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
							console.log('GAPI:  '+'auth: Elements  = '+JSON.stringify(datas));						
							//about(datas.token);
						}		
						else{
							datas.authSuccess = false;
						}
						
						emit(exports, 'authComplete', datas);
						if (datas.authSuccess){
							if (datas.save){
								if (datas.del == true){
									del(datas);
								}else{
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
				//console.log('GAPI:  '+'Posted!');
			});
		
		}	
	});	

	
};

exports.auth = auth;

//Handle the result of the search file function:
function handleSearchFile(fileData){
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	var exists = fileData.exists;
	var fileName = fileData.title;
	var dataToSave = fileData.dataToSave;		
	if (exists){
		console.log('GAPI:  '+"handleSearchFile : File " + fileName + " exists!");
		if (fileData.save == true){		
			//Download the file & save:
			fileData.action = REWRITE;
			downloadData(fileData);
		}
		else{
			//Only for download:
			console.log ("Only for download");
			fileData.action = SHOW;
			downloadData(fileData);
		}
		
			
	}
	else{
		//If the file doesn't exist then we have to create the file
		console.log('GAPI:  '+"handleSearchFile: File " + fileName + " doesn't exists! ");
		/*
		var anArray = ['Hola','Yo','Soy','Shweta'];
	var anObject = {'title':'new','author':'nobody','array':anArray};
        var j = [];
        j.push(anObject);
        var objects = {'obj':j}
		*/
		//var anArray = [];
		//anArray.concat(dataToSave);
		if (fileData.save == true){
			//To save
			console.log('GAPI:  '+"FILE = " + fileName);
			//var key = Object.keys();
			var key = fileName.split('.json')[0];
			var object = {};
			/*if (fileName == TABS_FILE){
				object = {'tabs':dataToSave};
			}
			else if (fileName == BOOKMARKS_FILE){
				object = {'bookmarks':dataToSave};
			}
			else if (fileName == HISTORY_FILE){
				object = {'history':dataToSave};
			}*/
			object[key] = dataToSave;
			fileData.dataToSave = object;
			console.log('GAPI:  '+"Para guardar = " + JSON.stringify(fileData.dataToSave));
			startUpload(fileData);
		}
		else{
			//Just to show, but there is nothing.
			console.log('GAPI:  '+"Nothing saved!!!");
			var toDisplay = new Object();
			toDisplay.server = 'gapi';
			toDisplay.element = fileName.split('.json')[0];
			toDisplay.data = null;                            
            emit(exports, 'display',toDisplay);
			
		}			
	}
}





//Search for specific file with the file name title.
function searchFile(searchDatas){
	//title, dataToSave, token
	console.log('GAPI:  '+"Search File.");
	var title = searchDatas.title;
	var token = searchDatas.token;
	var dataToSave = searchDatas.dataToSave;
	console.log('GAPI:  '+"SEARCH FOR = " + title);
	//If dataToSave null then there is nothing to save
	//ElementToSave: 
        var exists = false;	//Lets assume that it doesn't exist.
        var request = "https://www.googleapis.com/drive/v2/files?q=title+=+'"+title+"'";
        var whoCalled = 'searchFile';
        var searchFor = Request({
                url: request,
                headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token},
                onComplete: function(response){
                	//console.log('GAPI:  '+);
                	console.log('GAPI:  '+"Search File = " + response.statusText);
                	console.log('GAPI:  '+"Search File = " + response.status);
                	console.log('GAPI:  '+"Search File = " + JSON.stringify(response.headers));
                	//console.log('GAPI:  '+"Search File = " + response.text);
                	if (response.status == '401'){	//Invalid token; Unauthorized
                		//auth('searchFile',[title,dataToSave]);
                		console.log('GAPI:  '+"Search file : Unauthorized.");
                		searchDatas.whoCalled = whoCalled;
                		searchDatas.authorized = false;
                		auth(searchDatas);
                		//emit(exports,'Unauthorized',searchDatas);
                	}
                	else if (response.status == '200'){ //Everything fine
                		var dLoadURL = '';
        			var fileId = '';
		               	if (response.json.items.length == 0){
		               		// If there is no item then the file doesn't exist-
		               		console.log('GAPI:  '+"Search File Doesn't Exist " + response.text); 
		               		exists = false;                      		
		               	}
		               	else{
		               		//The files exists.
		               		console.log('GAPI:  '+"Search File It exists " + title);
		               		exists = true;
		               		dLoadURL = response.json.items[0].downloadUrl;
		               		fileId = response.json.items[0].id;		
		               		searchDatas.dLoadURL = dLoadURL;
		               		searchDatas.fileId = fileId;               				
		               	}
		               	searchDatas.exists = exists;
		               	//emit(exports, 'searchFile',searchDatas);
		               	handleSearchFile(searchDatas);
		        }
                       
                }
        });
        searchFor.get();
}







//Upload the file
function uploadFile(uploadData){
	//uploadFile = [fileData, resumable_sesion_uri]
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	

	console.log('GAPI:  '+'uploadFile: UPLOAD!!!!');
	//var fileData = uploadData[0];
	var dataToSave = uploadData.dataToSave;
	var token = uploadData.token;
	var resumable_sesion = uploadData.resumable_sesion_uri;
	//var token = uploadData[2];
	
	var str = JSON.stringify(dataToSave);
	console.log('GAPI:  '+"Going to upload = " + str ) ;
	var session = Request({		
		url: resumable_sesion,
		//contentType: 'application/json; charset=UTF-8',
		headers: {'Authorization': 'Bearer '+ token/*'Content-Length':38*/,'Content-Type':'application/json; charset=UTF-8'},
		content: str,
		onComplete: function(response){			
			console.log('GAPI:  '+'Upload file = ' + response.text);
			console.log('GAPI:  '+'Upload file status = ' + response.status);
			console.log('GAPI:  '+'Upload File status text = ' + response.statusText);
			console.log('GAPI:  '+'Headers = ' + JSON.stringify(response.headers));
			console.log('GAPI:  '+'uploadFile: Upload completed!!');
			if (response.status == '200'){
				resumable_sesion = response.headers.Location;
				uploadData.resumable_sesion_uri = resumable_sesion;
				//var elementToSave = uploadData[3];
				var message = {};
				message.msg = 'Google Drive: Correctly Saved!';
				message.type = 'correct';
				/*uploadData.msg = 'Correctly Saved!';
				uploadData.msgType = 'correct';*/
				emit(exports, 'showMessage', message);
			}
			else if (response.status == '401'){
				auth(uploadData);
			} 
		}
	
	});
	session.put();

}

//Start the upload process:
function startUpload(fileData){
	//fileData = [exists, title, dataToSave, token, dLoadURL, fileId]
	var exists = fileData.exists;
	var fileName = fileData.title;
	var dataToSave = fileData.dataToSave;
	var token = fileData.token;
	//var elementToSave = fileData[6];
	/*var dataToSave = fileData[4];
	var token = fileData[5];*/
	
	
	if (!exists){		
		//If it is a new file then create it:
		console.log('GAPI:  '+'handleSave: NO EXSITE '+ fileName);
		var parents = [{'id':'appdata'}];
		var j = {'title': fileName,'parents':parents};
		var str = JSON.stringify(j);
		var session = Request({		
			url: 'https://www.googleapis.com/upload/drive/v2/files?uploadType=resumable',
			//contentType: 'application/json; charset=UTF-8',
			headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token,'Content-Length':38,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json'/*,'X-Upload-Content-Length':2000000*/},
			content: str,
			onComplete: function(response){
				console.log('GAPI:  '+'Start Upload file = ' + response.statusText+'\r\n\r\n');
				console.log('GAPI:  '+'Start Upload file status = ' + response.status+'\r\n\r\n');
				console.log('GAPI:  '+'Start Upload File status text = ' + response.statusText+'\r\n\r\n');
				console.log('GAPI:  '+'Start Headers = ' + JSON.stringify(response.headers+'\r\n\r\n'));
				if (response.status == '200'){
					resumable_sesion_uri = response.headers.Location;
					//console.log('GAPI:  '+resumable_sesion_uri);
					//this.uploadFile(dataToSave, resumable_sesion_uri, token);
					//this.listen;
					//emit(exports, 'startComplete', [dataToSave, resumable_sesion_uri, token]);
					/*
					var dataToSave = uploadData[0];
					var resumable_sesion = uploadData[1];
					var token = uploadData[2];
					*/
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
		console.log('GAPI:  '+'handleSave: Existe ' + fileName );
		var session = Request({                
		        url: 'https://www.googleapis.com/upload/drive/v2/files/'+fileId+'?uploadType=resumable',
		        //contentType: 'application/json; charset=UTF-8',
		        headers: {'Host':'www.googleapis.com','Authorization': 'Bearer '+ token/*,'Content-Length':38,'Content-Type':'application/json; charset=UTF-8','X-Upload-Content-Type':'application/json'/*,'X-Upload-Content-Length':2000000*/},
		        //content: str,
		        onComplete: function(response){
		                console.log('GAPI:  '+'Start Upload file = ' + response.statusText+'\r\n\r\n');
				console.log('GAPI:  '+'Start Upload file status = ' + response.status+'\r\n\r\n');
				console.log('GAPI:  '+'Start Upload File status text = ' + response.statusText+'\r\n\r\n');
				console.log('GAPI:  '+'Start Headers = ' + JSON.stringify(response.headers+'\r\n\r\n'));
		                if (response.status == '200'){
				        resumable_sesion_uri = response.headers.Location;
				        //this.uploadFile(dataToSave, resumable_sesion_uri, token);
				        //emit(exports, 'startComplete', [dataToSave, resumable_sesion_uri, token ]); 
				        //this.listen;   
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

*/
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
		console.log('GAPI:  '+"ERROR = " + e.toString());
		downloadedData = downloadData.downloadedContent;
	}
	//console.log('GAPI:  '+"DOWNLOADED DATA = " + JSON.stringify(downloadedData));
	if (downloadData.del == true){
		console.log("HAVE TO DELETE!!!");
		var key = Object.keys(downloadedData);
    		//console.log('GAPI:  '+"Using key = " + downloadedData[key]);
		//If it is update file then have to update the save data:
		//var arrayOfObjects = new Array();	//New array containing the elements' array
		//arrayOfObjects = downloadedData[key].slice(0);
		//Search for the item to delete:
		var aux = downloadedData[key];
		for (var j=0;j<aux.length;j++){
				if (aux[j].url == downloadData.url){
					console.log("Found to delete!!!!!");
					downloadedData[key].splice(j,1);
					console.log(JSON.stringify(downloadedData[key]));
					break;
				}
		}
		actionAfterDownload = REWRITE;
		downloadData.dataToSave = downloadedData[key].slice(0);
		downloadedData[key] = new Array();
		
	}
	
	if (actionAfterDownload == REWRITE){

		console.log('GAPI:  '+"Have to rewrite!!!!");
		
		 var dataToSave = downloadData.dataToSave;
		
		
		
		var key = Object.keys(downloadedData);
    		//console.log('GAPI:  '+"Using key = " + downloadedData[key]);
		//If it is update file then have to update the save data:
		var arrayOfObjects = new Array();	//New array containing the elements' array
		//if (downloadedData[key] != null){
			
			
			arrayOfObjects = downloadedData[key].slice(0);
		//}
		//Lets search for the tab with thisTabsId in the listOfTabs.
    		/*	var pos = listOfTabs.map(function(e) { 
    				return e.id; 
    			}).indexOf(thisTabsId);
    			
    			//Once we have got the position of the tab with the id, lets save its cookies:
    			listOfTabs[pos].cookies = cookiesInfo;
    			 */
    		//console.log('GAPI:  '+"Keys " + Object.keys(downloadedData));
    		
		/*if (title == TABS_FILE){
			arrayOfObjects = downloadedData.tabs.slice(0);   //Contains the tabs' array						
		}
		else if (title == BOOKMARKS_FILE){
			arrayOfObjects = downloadedData.bookmarks.slice(0); //Contains the bookmarks' array	
		}
		else{
			arrayOfObjects = downlaodedData.history.slice(0); //Contains the histories' array
		}*/
		console.log('GAPI:  '+"Array Of Objects = " + JSON.stringify(arrayOfObjects));
		console.log('GAPI:  '+"DATA TO SAVE = " + JSON.stringify(dataToSave));
		var upload = false;
		var alreadySaved = new Array();
		//Lets see if the data we are going to save was already saved before:
		for each (var oneData in dataToSave){
			console.log('GAPI:  '+oneData.url);
			var pos = arrayOfObjects.map(function(e) { 
					console.log('GAPI:  '+"MAP = " + e.url);
    					return e.url; 
    			}).indexOf(oneData.url);
    			
    			
    			if (pos == -1){//Doesn't exist
    				console.log('GAPI:  '+"\r\n\r\n\r\n"+oneData.url + " doesn't exist\r\n\r\n\r\n");
				downloadedData[key].push(oneData);
				upload = true;
					
			}
			else{
				console.log('GAPI:  '+"This tab is already saved " + oneData.title);
				alreadySaved.push(oneData.title);			
			}
    		}
    		if (upload){
	    		//Now dataToSave will be:
			downloadData.dataToSave = downloadedData;
			startUpload(downloadData);
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
			//console.log('GAPI:  '+ oneData.title + " IS ALREADY SAVED!!!!!");
			var elementWorker = elementToSave.attach({
				contentScriptFile: data.url('messages.js')
							
			});
			elementWorker.port.emit('alreadySaved',alreadySaved);*/
			var messageToShow = 'Google-Drive: The following are already saved:\r\n';
			for each(var saved in alreadySaved){
				messageToShow = messageToShow + saved + '\r\n';
			}
			var message = {'msg':messageToShow,'type':'correct'}
			emit(exports,'showMessage', message);
		}
    		
	}
	else if(actionAfterDownload == SHOW){
		/*try{
			openMenuTabWorker.port.emit('show',downloadedData);		
		}catch(e){
			console.log('GAPI:  '+"ERROR!");
		}*/
		var toDisplay = new Object();
		toDisplay.server = 'gapi';
		toDisplay.element = title.split('.json')[0];
		toDisplay.data = downloadedData;
		emit(exports,'display',toDisplay);
	
	}

}



function downloadData(datas){
	/*fileData = [exists, title, dataToSave, token, dLoadURL, fileId]*/
	var token = datas.token;
	var downloadURL = datas.dLoadURL;
	var whoCalls = 'downloadData';
        var download = Request({
                url: downloadURL,
                headers: {'Authorization': 'Bearer '+ token},
                onComplete: function(response){
                       // console.log('GAPI:  '+"downloadData: Downloaded data = "  response.text);
                        console.log('GAPI:  '+"downloadData: status " + response.status);
                        console.log('GAPI:  '+"downloadData: status text " + response.statusText);
                        //console.log('GAPI:  '+"downloadData: Headers " + JSON.stringify(response.headers));
                       // console.log('GAPI:  '+);
                       if(response.status == '401'){
                       		//refresh_token
                       		//emit(exports,'auth',[fileName, downloadURL]);
                       		//datas.whoCalled = whoCalls;
                       		//datas.fileData = fileData;
                       		//emit(exports,'Unauthorized',datas);
                       		auth(datas);
                       
                       }
                       else if(response.status == '200'){
				//If it is just download the datas then:
				datas.downloadedContent = response.text;
		               	//emit(exports,'downloadComplete',datas);	
		               	handleDownloadCompleted(datas);	
                       }
                      
                }
        
        });
        download.get();
}



function read(searchDatas){
	searchDatas.save = false;
	if (ifAuthenticated()){
		searchFile(searchDatas);
	}
	else{
		var message = {};
		message.msg = 'Google Drive: Not Signed in!';
		message.type = 'error';
		emit(exports, 'showMessage', message );
		emit(exports, 'notAuthorized','Google Drive');
		//auth(searchDatas);
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
	writeDatas.del = false;
	if (ifAuthenticated()){
		searchFile(writeDatas);
	}
	else{
		auth(writeDatas);
	}
}

exports.save = save;



function del(searchDatas){
	searchDatas.save = true;
	searchDatas.del = true;
	if (ifAuthenticated()){
		searchFile(searchDatas);
	}
	else{
		var message = {};
		message.msg = 'Google Drive: Not Signed in!';
		message.type = 'error';
		emit(exports, 'showMessage', message );
		emit(exports, 'notAuthorized','Google Drive');
		//auth(searchDatas);
	}
}

exports.del = del;
















