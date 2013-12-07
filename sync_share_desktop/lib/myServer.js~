/*
This add-on will try to communicate with the Django Server created by me.
*/
var data = require('sdk/self').data;
var Request = require('sdk/request').Request;
var tabs = require('sdk/tabs');
var bookmarks = require('./bookmark.js');
var URL = 'http://127.0.0.1:8000/';
var SAVE_URL = 'http://127.0.0.1:8000/save/';
var READ_URL = 'http://127.0.0.1:8000/read';
var deviceId;
var bookmarksList = new Array();

function reDirectAuth(){
	tabs.open(URL+'login/');
}

/* Manual save */
function save(datas){
	var element = datas.title.split('.json')[0];
	/*This is to send the tabs list to the server.*/
	//console.log('Send ');
	//var dataToSave = new Array();
	/*for each (var tabToSave in tabs){				
		var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
		dataToSave.push(newTab);		
	}*/
	console.log(JSON.stringify(dataToSave))
	console.log("Going to send = " + URL);
	var saveRequest = Request({
		url: SAVE_URL + element+'/',
		contentType: 'application/json',
		content:  JSON.stringify(dataToSave),
		onComplete: function (response) {	
		    	if (response.status == '401' && response.headers.error == 'Unauthorized'){
		    		reDirectAuth();
		    	}
		    	else if (response.status == '200'){
		    		console.log("SAVED CORRECTLY");
		    			
		    	}
	 	}
 	});
	saveRequest.post();
	
}

exports.save = save;


function read(datas){
	var element = datas.title.split('.json')[0];
	for each(var tab in tabs){
		var URL = READ_URL + element+'/';
		console.log("Going to send = " + URL);
		var readRequest = Request({
		    url: READ_URL + element+'/',
		    //contentType: 'application/json',
		    //content: {'title':tab.title,'url':tab.url,'id':tab.id},
		    onComplete: function (response) {
		    	console.log(response.text);
    			console.log(response.status);
    			console.log(JSON.stringify(response.headers));
    			console.log(response.statusText);
    			
    			if (response.status == '401' && response.headers.error == 'Unauthorized'){
    				reDirectAuth();
    			}
    			else if (response.status == '200'){
    				console.log("READ CORRECTLY");
    				//JSON.parse(response.text)
    				console.log(response.text)
    			
    			}
 		    }
 		});
		readRequest.get();
	}

}

exports.read = read;

function handleBookmarks(datas){
	/*
	toSend = {'title':title,'url':url,'GUID':aGUID,'itemId':aItemId,'lastModified':aLastModified,'dateAdded':dateAdded,'typeOf':'bookmarks','reason':'add'};*/
	var reason = datas.reason;
	var sendURL = URL;
	if (reason == 'add'){
		sendURL = sendURL + 'add/bookmark/';
	}
	else if (reason == 'update'){
		sendURL = sendURL + 'update/bookmark/';
	}
	else if(reson == 'remove'){
		sendURL = sendURL + 'remove/bookmark/'
	}
	datas.deviceId = deviceId;
	/*This is to send the tabs list to the server.*/
	//console.log('Send ');
	//var dataToSave = new Array();
	/*for each (var tabToSave in tabs){				
		var newTab = {'id':tabToSave.id,'title':tabToSave.title,'url':tabToSave.url};
		dataToSave.push(newTab);		
	}*/
	//console.log(JSON.stringify(dataToSave))
	//console.log("Going to send = " + URL);
	var saveRequest = Request({
		url: sendURL,
		contentType: 'application/json',
		content:  JSON.stringify(datas),
		onComplete: function (response) {	
		    	if (response.status == '401' && response.headers.error == 'Unauthorized'){
		    		reDirectAuth();
		    	}
		    	else if (response.status == '200'){
		    		console.log("SAVED CORRECTLY");
		    			
		    	}
	 	}
 	});
	saveRequest.post();
	
}


function searchForParent(childNode, whereToSearch){
	var parentId = childNode.parentId;
	//console.log("Parent ID of "+ childNode.title +" = " + parentId);
	//console.log(JSON.stringify(bookmarksList));
	for (var i=0;i<whereToSearch.length;i++){
		//console.log("Searching in ......");
		//console.log("Title = "+ whereToSearch[i].title +" & ID of this = " + whereToSearch[i].id);
		if (whereToSearch[i].itemId == parentId){
			//console.log("Indent level of  "+ childNode.title + "  "+childNode.indentLevel);
			whereToSearch[i].children.push(childNode);
			//console.log();
			//console.log("Break and return!");
			break;
			return;
		
		}
		if (whereToSearch[i].children){
			if (whereToSearch[i].children.length > 0){
				searchForParent(childNode,whereToSearch[i].children);
			}
		}
	
	}

}

function takeBookmark(thisBookmark){
	//var thisBookmark = bookmarkInfo[0];
	ifFolder = thisBookmark.ifFolder;
	//thisBookmark.deviceId = deviceId;
	if (ifFolder){
		//console.log("A Folder " + things[0].title);
		if (!thisBookmark.children){
			//console.log("Create children folder!!!!");
			//console.log("No children " + things[0].title);
			//var aux = new Object();
			//aux = things[0];
			//aux.children = new Array();
			//thisBookmark.ifFolder = true;
			thisBookmark.children = new Array();
		}
		//console.log("<ul>"+things[0].title);
		//console.log("SEarch for parent = " + things[0].title);
		searchForParent(thisBookmark,bookmarksList);
	}
	else{
		//thisBookmark.ifFolder = ifFolder;
		//console.log("<li>"+things[0].title);
		//console.log("Not a folder = " + things[0].title);
		searchForParent(thisBookmark,bookmarksList);
	}

}

function saveAllBookmarks(datasToSave){
	var sendURL = URL + 'add/all/bookmarks/';
	console.log("Gonna send to = " + sendURL );
	console.log("Gonna send = " + JSON.stringify(datasToSave));
	var saveRequest = Request({
		url: sendURL,
		contentType: 'application/json',
		headers: {'myName':'shweta-ubuntu','myId':deviceId},
		content:  JSON.stringify(datasToSave),
		onComplete: function (response) {	
		    	if (response.status == '401' && response.headers.error == 'Unauthorized'){
		    		reDirectAuth();
		    	}
		    	else if (response.status == '200'){
		    		console.log("SAVED CORRECTLY");
		    			
		    	}
	 	}
 	});
	saveRequest.post();


}


function getBookmarks(){
	bookmarksList = new Array();
	var folderIds = bookmarks.getFoldersId();
	for each (var id in folderIds){
		var thisFolder = new Object();
		thisFolder.itemId = id;
		thisFolder.title = bookmarks.nameFolder(id);
		//thisFolder.deviceId = deviceId;
		thisFolder.children = new Array();
		thisFolder.parentId = 0;
		bookmarksList.push(thisFolder);
		bookmarks.getFoldersChildren(id);
	}
	
	//console.log("Bookmarks = " + JSON.stringify(bookmarksList));
	saveAllBookmarks(bookmarksList);
	
}

exports.getBookmarks = getBookmarks;
function startUp(id){
	deviceId = id;
	
	//if (reason == 'install'){
		//Then we have to retrieve all the bookmarks and save them:
		
		//Get all the bookmarks and save them!!!
	//getBookmarks();
	//}
	
	bookmarks.on('take',takeBookmark);
	
	
	//bookmarks.on('bookmarks',handleBookmarks);
}

exports.startUp = startUp;






 
