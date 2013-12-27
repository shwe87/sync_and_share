/*Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.
 * Still in development. This add-on is my career's final project work.
 * 
 * This module was created to obtain the bookmarks of this device by using the mozilla sdk.
 * */
 
 
/**********************************************SDK Modules*************************************************************/
var {Cc, Ci, Cu} = require("chrome");
var { emit, on, once, off } = require("sdk/event/core");
var bookmarkService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
var history = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
/**********************************************My variables*************************************************************/
var bookmarksList = new Array();		//Contains all the bookmarks of this device.
/***********************************************************************************************************************/
/*
 * Code of the type of folders:
 RESULT_TYPE_URI = 0;               // nsINavHistoryResultNode
RESULT_TYPE_VISIT = 1;             // nsINavHistoryVisitResultNode
RESULT_TYPE_QUERY = 5;             // nsINavHistoryQueryResultNode
RESULT_TYPE_FOLDER = 6;            // nsINavHistoryQueryResultNode
RESULT_TYPE_SEPARATOR = 7;         // nsINavHistoryResultNode
RESULT_TYPE_FOLDER_SHORTCUT = 9;   // nsINavHistoryQueryResultNode
*/
//So that other modules can use this one:
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


/************************************************************************************************************************
@function getFoldersId:Get the bookmarks main three folders' IDs.
* @return allFolderId {Integer}: Returns the three main folers' IDs.
*************************************************************************************************************************/
function getFoldersId(){
	//There are three main folders, everything else will be their children.
	var allFoldersId = [bookmarkService.bookmarksMenuFolder,bookmarkService.toolbarFolder,bookmarkService.unfiledBookmarksFolder];
	return allFoldersId;
}	

/************************************************************************************************************************
@function nameFolder: Get the main folders' name from their IDs:
* @param {Integer} ID: The ID of the folder.
* @return name {String}: Returns the name of the folder.
*************************************************************************************************************************/
function nameFolder(ID){
	var name = "";
	if (ID == 2){
		name = "Bookmarks Menu";	
	}
	else if (ID == 3){
		name = "Bookmarks Toolbar";
	}
	else{//ID = 5
		name = "Unsorted Bookmarks";
	}
	return name;

}




/************************************************************************************************************************
@function searchForParent: Search for the parent of the children node and place him next to his parent node:
* @param {Bookmark node} childNode: The child bookmark node.
* @param {Array} whereToSearch: The array where the parent will be searched for:
*************************************************************************************************************************/
function searchForParent(childNode, whereToSearch){
	//Get the child's parent ID
	var parentId = childNode.parentId;
	//Search for him in the whereToSearch array:
	for (var i=0;i<whereToSearch.length;i++){
		if (whereToSearch[i].itemId == parentId){
			//Parent was found!
			whereToSearch[i].children.push(childNode);
			//No need to search anymore
			break;
			return;
		
		}
		//If not found then see if the node has children, may be the parent node we are
		//searching for is a child of another node:
		if (whereToSearch[i].children){
			if (whereToSearch[i].children.length > 0){
				//Recursive search:
				searchForParent(childNode,whereToSearch[i].children);
			}
		}
	
	}

}

/************************************************************************************************************************
@function saveBookmark: Saves a bookmark in an object form:
* @param {bookmark node} aBookmark: The bookmark to be saved:
*************************************************************************************************************************/
function saveBookmark(aBookmark){
	//See if the bookmark to be saved is a folder:
	var ifFolder = aBookmark.ifFolder;
	//If it is a folder then
	if (ifFolder){
		//Create an array to save its children:
		if (!aBookmark.children){
			aBookmark.children = new Array();
		}
		//Search for this bookmark node's parent:
		searchForParent(aBookmark,bookmarksList);
	}
	else{
		//If it not a folder then just search for parent:
		searchForParent(aBookmark,bookmarksList);
	}

}

/************************************************************************************************************************
@function convertToDate: Given a time in microseconds (PRTime: from 1 January 1970) convert to date format:
* @param {PRTime} timeInMicro: The time to be  converted to date
* @return {Date} aux: Return the converted date:
*************************************************************************************************************************/
function convertToDate(timeInMicro){
	var aux = new Date(timeInMicro);
	return aux;	
}	 

/************************************************************************************************************************
@function getFoldersChildren: Given a folder's ID, get its children and form a list of all the bookmarks of this device:
* @param {Integer} myFolderId: The ID of the folder whose children we want to retrieve:
* INFO: Part of this code was taken from the Mozilla Developers page:
* https://developer.mozilla.org/en-US/docs/Places_Developer_Guide#Accessing_Folder_Contents
*************************************************************************************************************************/
function getFoldersChildren(myFolderId){	 
	//Assume that it is not a folder:
	var ifFolder = false;        
	var query = history.getNewQuery();
	query.setFolders([myFolderId], 1);
	var result = history.executeQuery(query, history.getNewQueryOptions());
	// The root property of a query result is an object representing the folder you specified above.
	var folderNode = result.root;
	// Open the folder, and iterate over its contents.
	folderNode.containerOpen = true;
	for (var i=0; i < folderNode.childCount; ++i) {
			var child = folderNode.getChild(i);
			var childNode = new Object();
			childNode.itemId = child.itemId;
			childNode.title = child.title;
			childNode.parentId = child.parent.itemId;
			childNode.url = child.uri;
			childNode.dateAdded = convertToDate(child.dateAdded/1000);
			childNode.lastModified = convertToDate(child.lastModified/1000);
			childNode.time = convertToDate(child.time/1000);
			var type = child.type;
			// Some type-specific actions.
			if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
				//If it is not a folder:
				ifFolder = false;
				childNode.ifFolder = ifFolder;
				//Save it (Will also look for its parent node)
				saveBookmark(childNode);

			}
			else if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) {
				//If it is a folder:
				ifFolder = true;
				childNode.ifFolder = ifFolder;
				//Save it and search for its parent node
				saveBookmark(childNode);
				//Recursive call: Get this folder's children
				getFoldersChildren(childNode.itemId);

			}		   
	}

}


/************************************************************************************************************************
@function getbook: This function will return all the bookmarks of this device with the help of all the functions mentioned
* above
* @return {Array} bookmarksList: Return an array of all the bookmarks of this device.
*************************************************************************************************************************/
function getbook(){
	//The bookmarks list
	bookmarksList = new Array();
	//Get the three main folders' IDs
	var folderIds = getFoldersId();
	//For each folder, get its children.
	for each (var id in folderIds){
		var thisFolder = new Object();
		thisFolder.itemId = id;
		thisFolder.title = nameFolder(id);
		thisFolder.parentId = 0;
		thisFolder.ifFolder = true;
		thisFolder.children = new Array();
		bookmarksList.push(thisFolder);
		getFoldersChildren(id);
	}
	return bookmarksList;
	
}
exports.getBookmarks = getbook;



































