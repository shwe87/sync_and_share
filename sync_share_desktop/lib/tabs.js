/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module listens for the tab's pageShow and the close event. If any event occurs then								|
 * sends the information to the server and saves it. 																	|																					
 ************************************************************************************************************************/
/**********************************************SDK Modules*************************************************************/
var tabs = require('sdk/tabs');
var { emit, on, once, off } = require("sdk/event/core");
/**********************************************My Modules*************************************************************/
var preferences = require('./preferences');
var sync_tabs = true;
var tabsList = new Array();
/*********************************************************************************************************************/

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};



/************************************************************************************************************************
@function getTabs: If the sync tab option is on then get all the open tabs right now 
*************************************************************************************************************************/
function getTabs(tab){
	//Know if sync tabs is turned on.
	sync_tabs = preferences.getSyncTabs();
	if (sync_tabs == true){
		var aTab = new Object();
		aTab.url = tab.url;
		aTab.id = tab.id;
		aTab.title = tab.title;
		var found = false;
		var save = true;
		for (var i=0;i<tabsList.length;i++){
			if (tabsList[i].url == tab.url){
				found = true;
				save = false;
				break;
			} 
		}
		if (!found){
			tabsList.push(aTab);
		}
		if (save == true){
			emit(exports,'save',tabsList);
		}
	}
}
/************************************************************************************************************************
@function delDuplicates: Only save tabs once, if there are more same tabs open, only save it once.
* @param {Array} whereToSearch - Searche here the duplicates
* @return {Array} whereToSearch - return the value without duplicates.
*************************************************************************************************************************/
function delDuplicates(whereToSearch){
	
	for (var i=0;i<whereToSearch.length;i++){
		for (var j=0;j<whereToSearch.length;j++){
			if(i != j){
				if (whereToSearch[i].url == whereToSearch[j].url){
					whereToSearch.splice(j,1);	//Delete the duplicate value.
				}
			}
		}
	}
	return whereToSearch;

}
/************************************************************************************************************************
@function getAllTabs: Get all the tabs that are open right now in the browser.
* @return openTabs {Array} - All the open tabs.
*************************************************************************************************************************/
function getAllTabs(){
	var openTabs = new Array();
	//Have to make a simple object, to avoid the cyclic object value error
	for each(var tab in tabs){
		var aTab = {'title':tab.title,'url':tab.url,'id':tab.id}
		openTabs.push(aTab);
	}

	return openTabs;

}

/************************************************************************************************************************
@function listePageShow: Whenever a new page opens, send it to the server, to always have the tabs synced! Only if the 
* sync tabs options is turned on!
*************************************************************************************************************************/
function listenPageShow(){
	tabs.on('pageshow',function(tab){	
		sync_tabs = preferences.getSyncTabs();
		if (sync_tabs == true){ 
			var openTabs = getAllTabs();
			openTabs = delDuplicates(openTabs);
			emit(exports, 'save',openTabs);
		}

	});
}


/************************************************************************************************************************
@function listenClose: Whenever a page closes, send it to the server, to always have the tabs synced! Only if the 
* sync tabs options is turned on!
*************************************************************************************************************************/
function listenClose(){
	tabs.on('close',function(tab){
		sync_tabs = preferences.getSyncTabs();
		if (sync_tabs == true){
			var openTabs = getAllTabs();
			openTabs = delDuplicates(openTabs);
			emit(exports, 'save',openTabs);	
		}
	});

}
/************************************************************************************************************************
@function start up function: Listen to the events
*************************************************************************************************************************/
function startUp(){
	sync_tabs = preferences.getSyncTabs();
	if (sync_tabs == true){
		var openTabs = getAllTabs();
		openTabs = delDuplicates(openTabs);
		emit(exports,'save',openTabs);
		listenPageShow();
		listenClose();
	}
}

exports.startUp = startUp;
