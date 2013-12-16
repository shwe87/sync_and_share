var tabs = require('sdk/tabs');
var { emit, on, once, off } = require("sdk/event/core");
var preferences = require('./preferences.js');
var sync_tabs = true;
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


var tabsList = new Array();

function getTabs(tab){
	sync_tabs = preferences.getSyncTabs();
	if (sync_tabs == true){
		//console.log("TAB LOAD = " + tab.url + ' with ID = ' + tab.id);
		var aTab = new Object();
		aTab.url = tab.url;
		aTab.id = tab.id;
		aTab.title = tab.title;
		//console.log(JSON.stringify(aTab));
		var found = false;
		var save = true;
		for (var i=0;i<tabsList.length;i++){
			if (tabsList[i].url == tab.url){
				//console.log("Here");
				//if (aTab.url == tabsList[i].url){//Don't save this
					found = true;
					save = false;
					break;
				//}
				tabsList[i] = aTab;
				found = true;
				break;
			} 
		}
		if (!found){
			//console.log("Not found");
			tabsList.push(aTab);
		}
		//console.log(JSON.stringify(tabsList));
		if (save == true){
			console.log("Have to save : " + JSON.stringify(tabsList));
			emit(exports,'save',tabsList);
		}
	}




}

function delDuplicates(whereToSearch){
	//var duplicates = new Array();
	for (var i=0;i<whereToSearch.length;i++){
		//var found = false;
		for (var j=0;j<whereToSearch.length;j++){
			if(i != j){
				if (whereToSearch[i].url == whereToSearch[j].url){
					//found = true;
					console.log("Duplicate = " + whereToSearch[i].url);
					whereToSearch.splice(j,1);
				}
			}
		}
	}
	return whereToSearch;

}

function getAllTabs(){
	var openTabs = new Array();
	for each(var tab in tabs){
		var aTab = {'title':tab.title,'url':tab.url,'id':tab.id}
		openTabs.push(aTab);
	}
	console.log("Have to save : " + JSON.stringify(openTabs));
	return openTabs;
	//emit(exports,'save',tabsList);

}

function listenPageShow(){
console.log("Start listening!!!");
tabs.on('pageshow',function(tab){
		/*sync_tabs = preferences.getSyncTabs();
		if (sync_tabs == true){
			//console.log("TAB LOAD = " + tab.url + ' with ID = ' + tab.id);
			var aTab = new Object();
			aTab.url = tab.url;
			aTab.id = tab.id;
			aTab.title = tab.title;
			//console.log(JSON.stringify(aTab));
			var found = false;
			var save = true;
			for (var i=0;i<tabsList.length;i++){
				if (tabsList[i].id == tab.id){
					//console.log("Here");
					if (aTab.url == tabsList[i].url){//Don't save this
						found = true;
						save = false;
						break;
					}
					tabsList[i] = aTab;
					found = true;
					break;
				} 
			}
			if (!found){
				//console.log("Not found");
				tabsList.push(aTab);
			}
			//console.log(JSON.stringify(tabsList));
			if (save == true){
			
				emit(exports,'save',tabsList);
			}
		}*/
		sync_tabs = preferences.getSyncTabs();
		if (sync_tabs == true){ 
			console.log("TABS: Page show!!! HAve to send tabs!");
			var openTabs = getAllTabs();
			openTabs = delDuplicates(openTabs);
			console.log("TABS: Page show!!! HAve to send tabs! " + JSON.stringify(openTabs));
			emit(exports, 'save',openTabs);
		}

});
}



function listenClose(){
console.log("Start listening Close");
tabs.on('close',function(tab){
		//console.log("TAB CLOSE = " + tab.id);
		/*sync_tabs = preferences.getSyncTabs();
		if (sync_tabs == true){
			var found = false;
			for (var i=0;i<tabsList.length;i++){
				if (tabsList[i].id == tab.id){
					//console.log("found");
					tabsList.splice(i,1);
					found = true;
					break;
				} 
			}

	
			emit(exports,'save',tabsList);
		}*/
		sync_tabs = preferences.getSyncTabs();
		if (sync_tabs == true){
			console.log("TABS: Page close!! Have to send!");
			var openTabs = getAllTabs();
			openTabs = delDuplicates(openTabs);
			console.log("TABS: Page show!!! HAve to send tabs! " + JSON.stringify(openTabs));
			emit(exports, 'save',openTabs);	
		}
});

}

function startUp(){
	sync_tabs = preferences.getSyncTabs();
	if (sync_tabs == true){
		console.log("Mytabs : start!!!!");
		var openTabs = getAllTabs();
		openTabs = delDuplicates(openTabs);
		emit(exports,'save',openTabs);
		listenPageShow();
		listenClose();
		//console.log("saveTabs = " + JSON.stringify(dataToSave));
		//listenOpen();
		//listenClose();
	}
	
	



}

exports.startUp = startUp;
