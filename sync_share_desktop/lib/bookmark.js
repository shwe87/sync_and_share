var {Cc, Ci, Cu} = require("chrome");
var { emit, on, once, off } = require("sdk/event/core");
var bookmarkService = Cc["@mozilla.org/browser/nav-bookmarks-service;1"].getService(Ci.nsINavBookmarksService);
var history = Cc["@mozilla.org/browser/nav-history-service;1"].getService(Ci.nsINavHistoryService);
Cu.import("resource://gre/modules/XPCOMUtils.jsm", this);
//var FaviconService = (Cc['@mozilla.org/browser/favicon-service;1'].getService(Ci.mozIAsyncFavicons));
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
var bookmarkObserver = {
	onItemChanged: function(aItemId, aProperty, aIsAnnotationProperty, aNewValue, aLastModified, aItemType, aParentId,  aGUID, aParentGUID ) {
	    	/*console.log("Bookmark Item changed URI = " + bookmarkService.getBookmarkURI(aItemId).spec);
	    	console.log("Bookmark Item changed With title = " + aNewValue);
	    	console.log("Bookmark Item changed with title = " + bookmarkService.getItemTitle(aItemId));
	     	console.log("Bookmark Item changed GUID = " + aGUID);
	     	console.log("Bookmark Item changed id = " + aItemId);
	     	console.log("Bookmark Item changed TYPE = " + aItemType);
	     	console.log("Bookmark Item changed Property = " + aProperty);
	     	console.log("\r\n\r\n");*/
	     	try{
	     		var toSend = new Object();
		     	if (aProperty == 'title'){
		     		//An item's title has been changed by the user:
		     		//console.log("The Bookmark with " + bookmarkService.getBookmarkURI(aItemId).spec + " title has changed to: " + bookmarkService.getItemTitle(aItemId) +" and it's GUID is: " + aGUID);
		     		//console.log("T");
		     		var title = bookmarkService.getItemTitle(aItemId);
		     		var url = bookmarkService.getBookmarkURI(aItemId).spec;
		     		//var dateAdded = new Date();
		     		toSend = {'title':title,'url':url,'GUID':aGUID,'itemId':aItemId,'lastModified':aLastModified,'typeOf':'bookmarks','reason':'update'};
		     		//console.log([toSend]);
		     		emit(exports,'bookmarks',toSend);
		     
		     	}
		     	else if (aProperty == 'bookmarkProperties/description'){
		     		//An item has been added:
		     		//console.log("The Bookmark has been added " + bookmarkService.getBookmarkURI(aItemId).spec + " and title " + bookmarkService.getItemTitle(aItemId) +" and it's GUID is: " + aGUID);
		     		var title = bookmarkService.getItemTitle(aItemId);
		     		var url = bookmarkService.getBookmarkURI(aItemId).spec;
		     		var dateAdded = new Date();
		     		toSend = {'title':title,'url':url,'GUID':aGUID,'itemId':aItemId,'lastModified':aLastModified,'dateAdded':dateAdded,'typeOf':'bookmarks','reason':'add'};
		     		//console.log(toSend);
		     		emit(exports,'bookmarks',toSend);
		     	}
		}
		catch(e){
			console.log(e.toString());
		}
  	},
	onItemRemoved: function(aItemId, aParentId,aIndex, aItemType,  aURI, aGUID,  aParentGUID ){
		try{
			var toSend = new Object();
			if (aURI != null){
				//console.log("Bookmark Item removed URI = " + aURI.spec);
				//console.log("Bookmark Item removed title = " + bookmarkService.getItemTitle(aItemId));
				//console.log("Bookmark Item removed GUID = " + aGUID);
				var title = bookmarkService.getItemTitle(aItemId);
				var url = bookmarkService.getBookmarkURI(aItemId).spec;
				toSend = {'itemId':aItemId,'title':title,'url':url,'GUID':aGUID,'typeOf':'bookmarks','reason':'remove'};
				emit(exports,'bookmarks',toSend);
				//console.log(toSend);
				//console.log("Bookmark Item removed TYPE = " + aItemType);
				//console.log("\r\n\r\n");
			}
		    
		}
		catch(e){
			console.log(e.toString());
		}
  	},
  	QueryInterface: function(){
  		try{
  			XPCOMUtils.generateQI([Ci.nsINavBookmarkObserver])
  		}catch(e){
  			console.log(e.toString());
  		}
  		
  	}
};

function addBookmarkObserver(){
	bookmarkService.addObserver(bookmarkObserver, false);
}
exports.addBookmarkObserver = addBookmarkObserver;
var historyList = new Array();
var historyObserver = {
	onVisit: function(aURI,aVisitID,aTime,aSessionID,aReferringID,aTransitionType,aGUID,aAdded){
		/*console.log("Visited = " + aURI.spec);
		console.log("Visited GUID = " + aGUID);
		console.log("VISITED Visit ID = " + aVisitID);*/
		//console.log("VISITED aAdded = " + aAdded);
		try{
			if (aAdded == false){
				//console.log("Here");
				var toSend = new Object();
				var url = aURI.spec;
				var aQueries = {};
				var aResultCount = {};
				var options = {};
				history.queryStringToQueries(aURI.spec,aQueries,aResultCount,options);
				//console.log("COUNT = " + aResultCount.value);
				//console.log("OPTIONS = " + options.value);
				//console.log(aQueries.value);
				var result = history.executeQueries(aQueries.value, aResultCount.value,options.value);
				//var result = history.executeQuery(aQueries.value, options.value);
				result.root.containerOpen = true;
				var count = result.root.childCount;
				//console.log(count);
				for (var i = 0; i < count; i++) {
					  var node = result.root.getChild(i);
					  // do something with the node properties...
					  var title = node.title;
					  var url = node.uri;
					  var visited = node.accessCount;
					  var lastVisitedTimeInMicrosecs = node.time;
					  var iconURI = node.icon; // is null if no favicon available
					  if (title == null){
					  	  var now = new Date(node.time/1000);
	    					  //var dateA = now.toString();
					          var aHistory = new Object();
					          aHistory.url = url;
					          aHistory.time =  new Date(now);
					         // console.log(aHistory.time);
					          aHistory.GUID = aGUID;
					          aHistory.reason = 'add';
					  	  historyList.push(aHistory);
					  	  //console.log("Pushed " + JSON.stringify(historyList));
					  	 // emit(exports,'history',[aHistory]);
					  	  //console.log();
					  	  //console.log();
					  	  //console.log();
						 // console.log("History Add TITLE = " + title);
						  // console.log("History add URL "+url );
						  
	    					  //console.log("History add GUID = " + aGUID);
						  //console.log("History add LAST visited = " + new Date(dateA)+ "\r\n\r\n");
						
					}
					
				  
				}

				result.root.containerOpen = false;
				
			
			}
			/*var aQueries =  history.getNewQuery();;
			var aResultCount;
			var options;
			 history.queryStringToQueries(aURI.spec,aQueries,aResultCount, options);
			 console.log(aResultCount);
			 console.log*/
		}
		catch(e){
		console.log("ERROR HISTORY = " + e.toString());
		}
	
	},
  	QueryInterface: XPCOMUtils.generateQI([Ci.nsINavHistoryObserver])
};
function addHistoryObserver(){
	history.addObserver(historyObserver,false);
}

exports.addHistoryObserver = addHistoryObserver;

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
	return uri;
}
	 
exports.getFoldersChildren = function (myFolderId){	 
	var ifFolder = false;        
        var query = history.getNewQuery();
        query.setFolders([myFolderId], 1);
        var result = history.executeQuery(query, history.getNewQueryOptions());
        // The root property of a query result is an object representing the folder you specified above.
        var folderNode = result.root;
        // Open the folder, and iterate over its contents.
        folderNode.containerOpen = true;
        //console.log("ID = " + myFolderId + " Child count = " + folderNode.childCount);
        for (var i=0; i < folderNode.childCount; ++i) {
                var child = folderNode.getChild(i);
                 // Some item properties.
                //var title = childNode.title;
                //var id = childNode.itemId;
                //var type = childNode.type;
                var childNode = new Object();
                //console.log("FAVICON = " + childNode.icon);
                childNode.title = child.title;
                childNode.url = child.uri;
                childNode.itemId = child.itemId;
                //childNode.type = child.type;
                childNode.dateAdded = child.dateAdded;
                childNode.lastModified = child.lastModified;
                childNode.parentId = child.parent.itemId;
                childNode.time =child.time;
                var type = child.type;

                // Some type-specific actions.
                if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_URI) {
                	var uri = childNode.uri;
                        ifFolder = false;
                        childNode.ifFolder = ifFolder;
                        emit(exports, 'take',childNode);

                }
                else if (type == Ci.nsINavHistoryResultNode.RESULT_TYPE_FOLDER) {

                        ifFolder = true;
                        childNode.ifFolder = ifFolder;
                        emit(exports, 'take',childNode);
             
                        this.getFoldersChildren(childNode.itemId);
 
                }

               
        }

}







