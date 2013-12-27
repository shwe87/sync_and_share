/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * 																														|
 * This module was created to be able to use the Dropbox API to write and read in my app's folder. Information about	|
 * the Dropbox API, where I learnt to use Dropbox's API:																| 																									|
 * https://www.dropbox.com/developers/core/docs																			|											|
 ************************************************************************************************************************/	
/**********************************************SDK Modules*************************************************************/
var Request = require("sdk/request").Request;
var tabs = require("sdk/tabs");
var data = require("sdk/self").data;
var { emit, on, once, off } = require("sdk/event/core");
/**********************************************My Modules*************************************************************/
var cookies = require('./cookies');
/***********************************************************************************************************************/
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};

/*****************************************Dropbox CONSTANTS************************************************************/
const CLIENT_ID = "b8x0vw45cljfefm";
const CLIENT_SECRET = "9df8u9c90prjo1o";
const AUTH_URL = 'https://www.dropbox.com/1/oauth2/authorize?response_type=code&client_id='+CLIENT_ID;
const TOKEN_URL = 'https://www.dropbox.com/1/oauth2/token';
const GET_URL = 'https://api-content.dropbox.com/1/files/sandbox/';
const PUT_FILE_URL = 'https://api-content.dropbox.com/1/files_put/sandbox/';
const COOKIE_URL = 'http://dropbox.syncshareapp';
const SEARCH_COOKIE_URL = 'dropbox.syncshareapp';
const REWRITE = 'rewrite';
const SHOW = 'show';
/************************************************************************************************************************/
/************************************************************************************************************************
@function ifAuthenticated: The user is authenticated in Dropbox? Checks it through cookies
* @return authenticated {Boolean}: IF authenticated or not:
*************************************************************************************************************************/
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
/************************************************************************************************************************
@function handleResponse: Handle the response that the Dropbox server gives us:
* @param {Response object} response: The response from Dropbox
*************************************************************************************************************************/
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

/************************************************************************************************************************
@function auth: Authenticate the user:
* @param {object} datas: Object that contains the necessary values to authenticate the user, After authentication,
* what to do?
* 	--> datas.save: Call the save function or not. May be its just to show, then call the read function
* 	--> datas.del: Call the delete function
*************************************************************************************************************************/
function auth(datas){
	tabs.open({
		url: AUTH_URL,
		onReady: function onReady(tab){
			var tabWorker = tab.attach({
				//This javascript gets the code to make this app get to work:
				contentScriptFile: data.url('dropbox-handler.js')
			
			});
			tabWorker.port.on('takeCode',function(myCode){
				try{//Lets try to close the tab.
					tabWorker.port.on('closeTab',function(msg){
						tab.close();	
					});
				}catch(e){
					//Means that it is already closed!
				}
				var getAccess = Request({		
					url: TOKEN_URL,
					//The headers were specified by Dropbox in the developers website
					contentType: 'application/x-www-form-urlencoded',
					content: {'code': myCode,'client_id':CLIENT_ID,'client_secret':CLIENT_SECRET,'grant_type':'authorization_code'},
					onComplete: function(response){
						if(response.status =='200'){
							//Everything went good
							/*		
							{"access_token":A TOKEN,
							"token_type":"bearer",
							"uid":Client's ID}*/
							//the user has signed in!
							tabWorker.port.emit('signedIn','Signed in correctly');
							datas.token = response.json.access_token;
							datas.token_type = response.json.token_type;
							datas.uid = response.json.uid;
							datas.authSuccess = true;
							setAuthenticated();				
	
						}
						else{
							//If something went wrong then couldn't authenticate
							datas.authSuccess = false;
							handleResponse(response);
						}
						//Tell the one who is listening that the auth was complete (to the server module):
						//And give it the authenticated datas:
						emit(exports, 'authComplete', datas);
						//If the authentication was a success:
						if (datas.authSuccess){
							if (datas.save){
								if (datas.del == true){
									del(datas);		//Call the delete function
								}
								else{
									save(datas);	//Call the save function
								}
							}
							else if (!datas.save){	//CAll the read function
								read(datas);
							}
					
						}		
					}
				});
				getAccess.post();	//POST the request.
			});
		
		}
				
	});
		
}

exports.auth = auth;
/************************************************************************************************************************
@function handleOnlyShow - Handle when the download is complete. The downloaded content is only for show
* @param {Object} showData - Contains the following:
* 	--> showData.exists {Boolean} - If the searched file exists or not:
* 	--> showData.title {String} - The title of the file to download.
* 	--> showData.downloadedContent {JSON oject} - The downloaded object in json  format.  
*************************************************************************************************************************/
//Handle when download is completed!
function handleOnlyShow(showData){
	//The data sometimes is downlaoded as json and sometimes as string
	var downloadedData = {};
	var title = showData.title;
	
	
	downloadedData.element = title.split('.json')[0];
	downloadedData.server = 'dropbox';

	var exists = showData.exists;
	if (exists){
		//If the searched file exists then there is downloadedContent
		downloadedData.data = showData.downloadedContent;
	}
	else{
		//IF not then the downloadedContent is null
		downloadedData.data = null;
	}
	//To display to the user:
	var toDisplay = new Object();
	toDisplay.server = 'dropbox';
	toDisplay.element = title.split('.json')[0];
	toDisplay.data = downloadedData;
	//Tell the serverControl to display dropbox's data.
	emit(exports,'display',toDisplay);
	
	

}

/************************************************************************************************************************
@function handleBeforeWrite - There is no function to append in a file in Dropbox, we have to rewrite it.
* Handle before write, we have to download the already saved content and append the about to save content and rewrite in
* the file. To delete any content, we have to download a file, delete the desired content and rewrite again.
* @param {Object} datas - Contains the following:
* 	--> datas.exists {Boolean} - If the searched file exists or not:
* 	--> datas.title {String} - The title of the file to download.
* 	--> datas.downloadedContent {JSON oject} - The downloaded object in json  format.  
*************************************************************************************************************************/
function handleBeforeWrite(datas){
	var downloadedData = {};
	var title = datas.title;
	var exists = datas.exists;
	//In Dropbox, the datas gets downloaded as JSON object:
	downloadedData = datas.downloadedContent;
	var dataToSave = datas.dataToSave;
	if (exists){
		//The file exists:
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
			datas.dataToSave = downloadedData;
			write(datas);
		}
		if ((alreadySaved.length > 0)){
			
			var messageToShow = 'The following are already saved:\r\n\r\n';
			for each(var saved in alreadySaved){
				messageToShow = messageToShow + saved + '\r\n\r\n';
			}
			var message = messageToShow;
			emit(exports,'showMessage', message);
		}
    		
	}
	else{
		//To save, the key to be : tabs, bookmarks or history
		var key = title.split('.json')[0];
		// Will be {tabs: array of tabs object}
		// Or will be {bookmarks: array of tabs object}
		// Or will be {history: array of history object}
		var object = {};
		object[key] = dataToSave;
		datas.dataToSave = object;
		write(datas);	//Write it
	
	}

}


/************************************************************************************************************************
@function getData -Download datas from Dropbox of the searched file:
* @param {Object} datas - Contains the following:
* 	--> datas.token {string} - The token to let Dropbox know that I am authorized to get the datas.
* 	--> datas.title {String} - The title of the file to download.
* 	--> datas.save {Boolean} - If it is to save or read. Necessary to handle the downloaded content later.
*************************************************************************************************************************/
function getData(datas){
	var fileName = datas.title;
	var token = datas.token;
	var ifContinue = true;
	var getData = Request({		
		url: GET_URL + fileName,
		headers: {'Host':'www.api-content.dropbox.com.com','Authorization': 'Bearer '+ token},
		onComplete: function(response){
			if (datas.save == true){
				//Is save then rewrite
				datas.action = REWRITE;
			}
			else{
				//If not then it is just to show them to the user.
				datas.action = SHOW;
			}
			if (response.status == '404'){
				//It means that the file doesn't exist. Nothing is saved yet!
				datas.exists = false;
				datas.rev = null;	
			}
			else if (response.status == '200'){
				//Everything OK
				datas.exists = true;
				var metadata = response.headers['x-dropbox-metadata'];
				datas.metadata = metadata;
				datas.rev = metadata.rev;	//The version of the file
				datas.downloadedContent = response.json;
				ifContinue = true;			//Continue, everything OK!
			}
			else if(response.status == '401'){
				//Not authorized
				ifContinue = false;
				auth(datas);
				
			}
			else{
				ifContinue = false;
				//Handle rest of the response types
				handleResponse(response);
			}
			
			if (ifContinue){
				if (datas.action == REWRITE){
					//If rewrite , handle datas before update
					handleBeforeWrite(datas);
				}
				else{
					//Handle how to show the datas.
					handleOnlyShow(datas);
				}
			}
			
			
			
			
		}
	});
	getData.get();	//GET THE DATAS
				
}



/************************************************************************************************************************
@function write - Write in Dropbox.
* @param {Object} datas - Contains the following:
* 	--> datas.token {string} - The token to let Dropbox know that I am authorized to get the datas.
* 	--> datas.title {String} - The title of the file to download.
* 	--> datas.rev {Boolean} -  Version of the file to rewrite.	(prameter of Dropbox API)
* *************************************************************************************************************************/
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
	var saveData = Request({
		url: URL,
		headers: {'Host':'www.api-content.dropbox.com.com','Authorization':'Bearer ' + token,'Content-length':saveDatas.length,'Content-Type':'text/plain; charset=UTF-8'},
		content: saveDatas,
		onComplete: function(response){
			var message = "";
			if (response.status == '200'){
				datas.success = true;
				message = 'Dropbox: Correctly Saved!';
			}
			else if(response.status == '401'){
				//Not authorized
				ifContinue = false;
				message = 'Dropbox: Not Signed in!';
				auth(datas);
			}
			else{	
				// Other problems
				datas.success = false;
				message = 'Dropbox: Save failed!';	
				handleResponse(response);			
			}
			emit(exports, 'showMessage', message);	
		}	
	});
	saveData.post();


}
exports.write = write;	


/************************************************************************************************************************
@function read - Read from Dropbox. This is the same as download data for show. Actually, this calls the download file but
* tells the downlaod file function that the downloaded datas are only for show.
* @param {Object} readDatas - Contains the necessary datas to be able to read from Dropbox.
* *************************************************************************************************************************/
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
