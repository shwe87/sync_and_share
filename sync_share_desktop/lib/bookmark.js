var {Cc, Ci, Cu} = require("chrome");
var { emit, on, once, off } = require("sdk/event/core");
var bookmarkService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
var FaviconService = (Cc['@mozilla.org/browser/favicon-service;1'].getService(Ci.mozIAsyncFavicons));
/*
 RESULT_TYPE_URI = 0;               // nsINavHistoryResultNode
RESULT_TYPE_VISIT = 1;             // nsINavHistoryVisitResultNode
RESULT_TYPE_FULL_VISIT = 2;        // nsINavHistoryFullVisitResultNode
RESULT_TYPE_DYNAMIC_CONTAINER = 4; // nsINavHistoryContainerResultNode
RESULT_TYPE_QUERY = 5;             // nsINavHistoryQueryResultNode
RESULT_TYPE_FOLDER = 6;            // nsINavHistoryQueryResultNode
RESULT_TYPE_SEPARATOR = 7;         // nsINavHistoryResultNode
RESULT_TYPE_FOLDER_SHORTCUT = 9;   // nsINavHistoryQueryResultNode

var node = result.root.getChild(i);
  // do something with the node properties...
  var title = node.title;
  var url = node.uri;
  var visited = node.accessCount;
  var lastVisitedTimeInMicrosecs = node.time;
  var iconURI = node.icon; // is null if no favicon available
*/
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};



var history = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);


exports.getFoldersId = function(){
	//There are three main folders, everything else will be their children
	var allFoldersId = [bookmarkService.bookmarksMenuFolder,bookmarkService.toolbarFolder,bookmarkService.unfiledBookmarksFolder];
	/*console.log("Menu folder =" +  bookmarkService.bookmarksMenuFolder);
	console.log("Toolbar folder =" +  bookmarkService.toolbarFolder);
	console.log("Unfiled folder =" +  bookmarkService.unfiledBookmarksFolder);*/
	return allFoldersId;
}	

exports.nameFolder = function(ID){
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

exports.ifSubFolder = function(node){
	var type = node.type;
	var subFolder = false;
	if ((type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) /*|| (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_QUERY)*/){
		//console.log(node.title + "is a subfolder!");
		subFolder = true;	
	}
	return subFolder;
} 

exports. ifUri = function(childNode){
	var uri = false;
	var type = childNode.type;
	if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
		uri = true;		
	}	
	//console.log("URI " + uri);
	return uri;
}
	 
exports.getFoldersChildren = function (myFolderId){	 
	var ifFolder = false;        
        var query = history.getNewQuery();
        //allChildren = new Array();
        //var myFolderId = bookmarkService.bookmarksMenuFolder;
        //console.log(myFolderId);
        query.setFolders([myFolderId], 1);
        var result = history.executeQuery(query, history.getNewQueryOptions());
        // The root property of a query result is an object representing the folder you specified above.
        var folderNode = result.root;
        // Open the folder, and iterate over its contents.
        folderNode.containerOpen = true;
        //console.log("ID = " + myFolderId + " Child count = " + folderNode.childCount);
        for (var i=0; i < folderNode.childCount; ++i) {
                var childNode = folderNode.getChild(i);
                 // Some item properties.
                var title = childNode.title;
                var id = childNode.itemId;
                var type = childNode.type;
                //console.log("FAVICON = " + childNode.icon);
                
                
                //console.log(title + " type is " + type);
                //allChildren.push(childNode);
                //console.log(title + " " + type);
                
                // Some type-specific actions.
                if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
                	var uri = childNode.uri;
                        ifFolder = false;
                        emit(exports, 'take',[childNode,ifFolder]);
                        
                        //this.getFoldersChildren(id);
                }
                else if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) {
                        /*childNode.QueryInterface(Ci.nsINavHistoryContainerResultNode);
                        childNode.containerOpen = true;*/
                        ifFolder = true;
                        //console.log('************'+title+'**********');
                        emit(exports, 'take',[childNode,ifFolder]);
                        this.getFoldersChildren(id);
                        // now you can iterate over a subfolder's children
                        /*for(var j=0; j < childNode.childCount;++j){
                                var myChild = childNode.getChild(j);
                                var myType = myChild.type;
                                if (myType == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI){
                                        console.log(myChild.title + " " + myChild.uri);
                        
                                }
                                //console.log(myChild.title);
                        }*/
                }
                
                //return [childNode, ifFolder];
               
        }

}



exports.getSubFoldersBookmarks = function(childNode){
	allChildOfChild = new Array();
	childNode.QueryInterface(Ci.nsINavHistoryContainerResultNode);
	childNode.containerOpen = true;
	// now you can iterate over a subfolder's children
	for(var j=0; j < childNode.childCount;++j){
		var myChild = childNode.getChild(j);
		var myType = myChild.type;
		
		if (myType == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI){
			//console.log(myChild.title + " " + myChild.uri);
			allChildOfChild.push(myChild);
		}
		/*else if(myType == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER){
			var moreChildren = getSubFoldersBookmarks(myChild);
			console.log(myChild.title + " is a subFolder of " + childNode[j]);
		}*/

		//console.log(myChild.title);
	}
	return allChildOfChild;		
}



