/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to get this device's history.																|
 ************************************************************************************************************************/	

/**********************************************SDK Modules*************************************************************/
var {Cc, Ci, Cu} = require("chrome");
var historyService = Cc["@mozilla.org/browser/nav-history-service;1"]
                               .getService(Ci.nsINavHistoryService);             
/***********************************************************************************************************************/

/************************************************************************************************************************
@function convertToDate: Given a time in microseconds (PRTime: from 1 January 1970) convert to date format:
* @param {PRTime} timeInMicro: The time to be  converted to date
* @return {Date} aux: Return the converted date:
*************************************************************************************************************************/             
function convertToDate(timeInMicro){
	var aux = new Date(timeInMicro/1000);
	return aux;
	
}  

/************************************************************************************************************************
@function queryHistory: Get all the history of this device
* INFO: Part of this code was taken from the Mozilla Developers page:
* https://developer.mozilla.org/en-US/docs/Places_Developer_Guide#Accessing_Folder_Contents
*************************************************************************************************************************/            
exports.queryHistory = function(){
	var listOfHistory = new Array();
	//var history = {};
	var query = historyService.getNewQuery();
	var options = historyService.getNewQueryOptions();
	options.sortingMode = options.SORT_BY_VISITCOUNT_DESCENDING;
	options.maxResults = 10;

	// execute the query
	var result = historyService.executeQuery(query, options);

	// iterate over the results
	result.root.containerOpen = true;
	var count = result.root.childCount;
	for (var i = 0; i < count; i++) {
		var node = result.root.getChild(i);
		var nodeHistory = {};
		// do something with the node properties...
		var title = node.title;
		var url = node.uri;
		var visited = node.accessCount;
		var lastVisitedTimeInMicrosecs = node.time;
		var iconURI = node.icon; // is null if no favicon available

		nodeHistory.title = title;
		nodeHistory.url = url;
		nodeHistory.visited = visited;

		nodeHistory.lastVisited = convertToDate(lastVisitedTimeInMicrosecs);

		listOfHistory.push(nodeHistory);
	  
	}

	result.root.containerOpen = false;
	return listOfHistory;


}
