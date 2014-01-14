/*http://visionwidget.com/ajax-gif-loader-generators.html
LOADING ICON = https://drive.google.com/file/d/0B-QM_tizf_jpQUNpeUR1V05TWmM/edit?usp=sharing
SYNCING ICON = https://drive.google.com/file/d/0B-QM_tizf_jpQUNpeUR1V05TWmM/edit?usp=sharing

HISTORY_ICON from = http://www.softicons.com/free-icons/toolbar-icons/fatcow-hosting-icons-by-fatcow/clock-history-frame-icon
TAB_ICON from = http://www.softicons.com/free-icons/toolbar-icons/iconza-orange-icons-by-turbomilk/tab-icon
DROPBOX ICON = http://i39.tinypic.com/2pyt4xk.jpg
Bookmark = http://i39.tinypic.com/2lmvqdl.jpg
GOOGLE_DRIVE = http://i39.tinypic.com/24mgxt5.jpg
HISTORY_ICON = <http://i40.tinypic.com/b5jyqa.jpg
SHWETA = http://i42.tinypic.com/27x31jm.jpg
Syncing = http://i42.tinypic.com/103trti.jpg
tab = http://i39.tinypic.com/mry2i9.jpg
loading = http://i43.tinypic.com/1zq8vop.jpg
*/


/*CONSTANTS:*/
const LOADING_ICON = 'http://i43.tinypic.com/1zq8vop.jpg';


//As soon as the page loads, create the effect in the main table:
createEffectInTable('cell','selected');
createEffectInTable('bCell','bSelected');

//When the page loads for the first time:
self.port.on('start',function(clickedElement){
	//When the tab opens, open the bookmark table.
	var cell = document.getElementById('bookmarksCell');
	cell.click();
});


//Get the table ready depending on which element is going to be shown:
self.port.on('getTableReady',function(element){
	//Put the correct options in the upper row, depending on the clicked cell
	clean('mainContent');	//Clean the main content to write now the new datas.
	if (element == 'bookmarks'){
		setOptions('Bookmarks','Saved Bookmarks');
	}
	else if(element == 'history'){
		setOptions('History','Saved History');
	}
	else if(element == 'tabs'){
		setOptions('Tabs','Saved Tabs');
	}
	showHiddenRow();
	var mainContent = document.getElementById('mainContent');
	var UL = document.createElement('ul');
	UL.setAttribute('id',element+'List');
	mainContent.appendChild(UL);
	
	
});

//When main want to clean a node:
self.port.on('clean',function(msg){
	clean(msg);

});

//Get the hidden row ready; when any of the left side cell is clicked then click the one option of the upper row.
//For example: If Tabs is clicked then click the Tabs on the upper side.
self.port.on('initHiddenRow',initHiddenRow);

//Show the saved tabs. Display the elements in the content.
self.port.on('show',function(toDisplay){
	clean('loading');
	console.log(toDisplay);
	var server = toDisplay.server;
	var elementsToShow = toDisplay.data;
	if (elementsToShow == null){
		var mainContent = document.getElementById('mainContent');
		var p = document.createElement('p');
		if (server == 'mysite'){
			var textToPut = 'Sync & Share: Nothing saved yet!';
		}
		else if (server == 'dropbox'){
			var textToPut = 'Dropbox: Nothing saved yet!';
		}
		else if (server == 'gapi'){
			var textToPut = 'Google Drive: Nothing saved yet!';
		}
		else{
			var textToPut = 'Nothing Saved yet!!'
		}
		p.innerHTML = textToPut;
		var img = document.createElement('img');
		img.setAttribute('class','serverLogo');
		var image = 'images/'+server+'.png';
		img.setAttribute('src',image);
		img.setAttribute('title','Message from' + server);
		p.appendChild(img);
		mainContent.appendChild(p);
	}
	else{
		var key = Object.keys(elementsToShow);
		try{
			if (key == 'msg'){
				//Not authorized message to display by the server
				var mainContent = document.getElementById('mainContent');
				var p = document.createElement('p');
				var t = document.createTextNode(elementsToShow[key]);
				p.appendChild(t);
				mainContent.appendChild(p);
			}
			else{
				var all = elementsToShow[key];
				if (all.length == 0){
					var mainContent = document.getElementById('mainContent');
					var p = document.createElement('p');
					if (server == 'mysite'){
							var textToPut = 'Sync & Share: Nothing saved yet!';
					}
					else if (server == 'dropbox'){
							var textToPut = 'Dropbox: Nothing saved yet!';
					}
					else if (server == 'gapi'){
							var textToPut = 'Google Drive: Nothing saved yet!';
					}
					else{
							var textToPut = 'Nothing Saved yet!!'
					}
					p.innerHTML = textToPut;
					var img = document.createElement('img');
					img.setAttribute('class','serverLogo');
					var image = 'images/'+server+'.png';
					img.setAttribute('src',image);
					img.setAttribute('title','Message from' + server);
					p.appendChild(img);
					mainContent.appendChild(p);
		
				}else{
					for each (var element in all){

						var mainContent = document.getElementById('mainContent');
						var mainDIV = document.createElement('div');
						mainDIV.setAttribute('id','show'+key);
						mainDIV.setAttribute('class','mainShow');
						var div = document.createElement('div');
						div.setAttribute('class','savedItem');
						var p1 = document.createElement('p');
						p1.setAttribute('class','title');
						var favQuery = "http://www.google.com/s2/favicons?domain="+element.url;
						var span = document.createElement('span');
						span.setAttribute('class','favicon');
						var favA = document.createElement('img');
						favA.setAttribute('src',favQuery);
						span.appendChild(favA);
						p1.appendChild(span);
						var text = document.createTextNode(element.title);
						var img = document.createElement('img');
						img.setAttribute('class','serverLogo');
						var image = 'images/'+server+'.png';
						img.setAttribute('src',image);
						img.setAttribute('title','saved in ' + server);
						p1.appendChild(text);
						p1.appendChild(img);
						div.appendChild(p1);
						var p2 = document.createElement('p');
						p2.setAttribute('class','url');
						
						var a = document.createElement('a');
						a.setAttribute('href',element.url);
						a.setAttribute('class','urlContainer');
						var text = document.createTextNode(element.url);
						a.appendChild(text);
						
						p2.appendChild(a);

						div.appendChild(p2);
						
						var line = document.createElement('hr');
						
						mainDIV.appendChild(div);
						mainDIV.appendChild(line);
						mainContent.appendChild(mainDIV);
						
					}
				}
			}
		}catch(e){
			//Something went bad!!
		}
	}

});


/*When the user clicks the Tabs-Tabs cell: Then get all the saved tabs and show them to the user.*/
self.port.on('takeAllTabs',function(allTabs){
	clean('loading');
	var tabsList = document.getElementById('tabsList');
	if (allTabs.length == 0){
		var tabsP = document.createElement('p');
		tabsP.innerHTML = "No Tabs to show.";
		tabsList.appendChild(tabsP);
	}
	else{
		var found = false;
		var this_device = false;
		for (var j=0;j<allTabs.length;j++){
			this_device = false;
			var anItem = document.createElement('DIV');
			anItem.setAttribute('class','item');
			var aTab = allTabs[j]
			try{
				var device = JSON.parse(aTab.device);
			
			}
			catch(e){
				var device = aTab.device;
			}
			if (found == false){
				try{
					//See if these tabs are from this device
					this_device = device.this_device;
					found = true;
				}
				catch(e){
						//Do nothing
				}
			}
			var device_name = device.device_name;
			var tabs = aTab.tabs;
			var aDeviceUL = document.createElement('UL');
			aDeviceUL.setAttribute('class','device');
			aDeviceUL.addEventListener('click',function(event){
				//Add a click listener to this. So that the user can expand it whenever it is clicked:
				var node = event.target;
				var children = node.children;
				for (var k=0;k<children.length;k++){
					var child = children[k];
					var childClass = child.className;
					if (childClass == 'hidden'){
						child.setAttribute('class','shown');
					}
					else{
						child.setAttribute('class','hidden');
					}
				}
				if (children.length == 0){
					var messageLI = document.createElement('LI');
					var text = document.createTextNode('Nothing to show');
					messageLI.appendChild(text);
					messageLI.setAttribute('class','shown');
					node.appendChild(messageLI);
				}
			});
			if (this_device == true){
				var textToShow = "Tabs from " + device_name + " (this device)";
			}
			else{
				var textToShow = "Tabs from " + device_name ;
			}
			var text = document.createTextNode(textToShow);
			aDeviceUL.appendChild(text);
			for (var i=0;i<tabs.length;i++){
				var aTabLI = document.createElement('li');
				aTabLI.setAttribute('class','hidden');
				var favQuery = "http://www.google.com/s2/favicons?domain="+tabs[i].url;
				aTabLI.style.listStyleImage = "url('"+favQuery+"')";
				aTabLI.style.margin = '0px';
				var liDiv = makeLiContent(tabs[i].title, tabs[i].url);
				liDiv.setAttribute('class','tab');
				aTabLI.appendChild(liDiv);
				aDeviceUL.appendChild(aTabLI);
			}
			
			anItem.appendChild(aDeviceUL);
			tabsList.appendChild(anItem);
		
		}
	}


});

/*Take all history when the user clicks the History-History option:*/
self.port.on('takeAllHistory',function(allHistory){
	clean('loading');
	var historyList = document.getElementById('historyList');
	if (allHistory.length == 0){
		var historyP = document.createElement('p');
		historyP.innerHTML = "No history to show.";
		historyList.appendChild(historyP);
	}
	else{
		var found = false;
		var this_device = false;
		for (var j=0;j<allHistory.length;j++){
			this_device = false;
			var anItem = document.createElement('DIV');
			anItem.setAttribute('class','item');
			var aHistory = allHistory[j]
			try{
				var device = JSON.parse(aHistory.device);
			
			}
			catch(e){
				var device = aHistory.device;
			}
			if (found == false){
				//See if from this device
				try{
						this_device = device.this_device;
						found = true;
				}
				catch(e){
						//Do nothing
				}
			}
			var device_name = device.device_name;
			var history = aHistory.history;
			var aDeviceUL = document.createElement('UL');
			aDeviceUL.setAttribute('class','device');
			aDeviceUL.addEventListener('click',function(event){
				//Add a click listener to this. So that the user can expand it whenever it is clicked:
				var node = event.target;
				var children = node.children;
				for (var k=0;k<children.length;k++){
					var child = children[k];
					var childClass = child.className;
					if (childClass == 'hidden'){
						child.setAttribute('class','shown');
					}
					else{
						child.setAttribute('class','hidden');
					}
				}
			});
			if (this_device == true){
					var textToShow = "History from " + device_name + ' (this device )';
			}
			else{
					var textToShow = "History from " + device_name;
			}
			var text = document.createTextNode(textToShow);
			aDeviceUL.appendChild(text);
			for (var i=0;i<history.length;i++){
				var aHistoryLI = document.createElement('li');
				aHistoryLI.setAttribute('class','hidden');
				var favQuery = "http://www.google.com/s2/favicons?domain="+history[i].url;
				aHistoryLI.style.listStyleImage = "url('"+favQuery+"')";
				aHistoryLI.style.margin = '0px';
				var liDiv = makeHistoryLiContent(history[i].title, history[i].url,history[i].lastVisited,history[i].visited);
				liDiv.setAttribute('class','history');
				aHistoryLI.appendChild(liDiv);
				aDeviceUL.appendChild(aHistoryLI);
			}
			
			anItem.appendChild(aDeviceUL);
			historyList.appendChild(anItem);
		
		}
	}


});




/*Take all bookmarks when the user clicks the Bookmarks-Bookmarks option:*/
self.port.on('takeAllBookmarks',function(bookmarksToShow){

	var found = false;
	var this_device = false;
	for (var i=0;i<bookmarksToShow.length;i++){
		this_device = false;
		var anItem = document.createElement('DIV');
		anItem.setAttribute('class','item');
		var aBookmark = bookmarksToShow[i];
		var bookmarks = aBookmark.bookmarks;
		try{
			var device = JSON.parse(aBookmark.device);	
		}
		catch(e){
			var device = aBookmark.device;
		}
		if (found == false){
			try{
					this_device = device.this_device;
					found = true;
			}
			catch(e){
					//Do nothing
			}
		}
		var device_name = device.device_name;
		var device_id = device.device_id;
		var aDeviceUL = document.createElement('UL');
		aDeviceUL.setAttribute('class','device');
		if (this_device == true){
			var textToShow = "Bookmarks from " + device_name + ' (this device)';
		}
		else{
			var textToShow = "Bookmarks from " + device_name;
		}
		var text = document.createTextNode(textToShow);
		aDeviceUL.appendChild(text);
		var bookmarksList = document.getElementById('bookmarksList');
		anItem.appendChild(aDeviceUL);
		bookmarksList.appendChild(anItem);
		aDeviceUL.addEventListener('click',function(event){
			var node = event.target;
			var children = node.children;
			for (var k=0;k<children.length;k++){
				var child = children[k];
				var childClass = child.className;
				
				if (child.nodeName != 'HR'){
					
					if (childClass == 'hidden'){
						child.setAttribute('class','shown');
					}
					else{
						child.setAttribute('class','hidden');
					}
				
				}
			}
		});
		
		var bookmarkDiv = document.createElement('DIV');
		bookmarkDiv.setAttribute('class','hidden');
		aDeviceUL.appendChild(bookmarkDiv);
		for (var j=0;j<bookmarks.length;j++){
			var ifFolder = bookmarks[j].ifFolder;
			var aBookmark = bookmarks[j];
			var parentId = bookmarks[j].parentId;
			if (parentId == 0){
				handle_children(aBookmark,bookmarkDiv,device_id);
			}
		}
		
		
		
	}
	clean('loading');

	
	
});




/*************FUNCTIONS****************/

/*Create a exapandable folder illusion: Whenever a folder is clicked then show its children:*/
function handle_event(event){
	var whatWasClicked = event.target;
	if (whatWasClicked.nodeName == 'UL'){ //Only when a folder is clicked
		var ULChildren = event.target.children;	//The third child is the LI elements
			if (ULChildren != undefined){
				for (var i=0;i<ULChildren.length;i++){
					if (ULChildren[i].nodeName != 'HR'){
						if (ULChildren[i].className == 'hidden'){
							ULChildren[i].setAttribute('class','shown');
						}
						else if(ULChildren[i].className == 'shown'){
							ULChildren[i].setAttribute('class','hidden');
						}
					}
				}
			}
	}

	// this ought to keep the parent node from getting the click.
	//Stop the bubble efect
	event.stopPropagation();
}




/*Recursive function to handle the children of a bookmarks folder*/
function handle_children(aBookmark,parentNode,device_name){
	var ifFolder = aBookmark.ifFolder;
	var parentId = aBookmark.parentId;
	if (parentId == 0){
		//One of the root folders, parent node will be the device ul
		var parent = parentNode;
	}
	else{
		var parent = document.getElementById(parentId+device_name);
	}
	
	if (ifFolder){
		var children = aBookmark.children;
		var bookmarkUL = document.createElement('ul');
		bookmarkUL.setAttribute('id',aBookmark.itemId+device_name);
		if (parentId != 0 ){
			bookmarkUL.setAttribute('class','hidden');
		}

		var bookmarkText = document.createTextNode(aBookmark.title);
		bookmarkUL.appendChild(bookmarkText);
		var line = document.createElement('hr');
		bookmarkUL.appendChild(line);
		var favQuery = "http://www.gettyicons.com/free-icons/103/pretty-office-2/png/256/folder_256.png";
		bookmarkUL.style.background = "url('"+favQuery+"') no-repeat left top";
		bookmarkUL.style.backgroundSize = "15px 15px";
		bookmarkUL.style.margin = '0px';
		bookmarkUL.style.padding = '0px 0px 0px 20px';	//Modify only the space between the icon and the title.
		if (parentId != 0){
			bookmarkUL.addEventListener('click',handle_event, false);
		}
		parent.appendChild(bookmarkUL);
		if (children){
			for (var j=0;j<children.length;j++){
				handle_children(children[j], null, device_name);
			}
		
		}
			
	}
	else{
		var bookmarkLI = document.createElement('LI');	
		var ifMain = (parentId == 2 || parentId == 3 || parentId == 5);
		if(ifMain == false){
			bookmarkLI.setAttribute('class','hidden');
		}

		var liDiv = makeLiContent(aBookmark.title,aBookmark.url);
		bookmarkLI.appendChild(liDiv);
		liDiv.setAttribute('class','bookmark');
	
		var favQuery = "http://www.google.com/s2/favicons?domain="+aBookmark.url;
		bookmarkLI.style.background = "url('"+favQuery+"') no-repeat left top";
		bookmarkLI.style.margin = '0px';
		/*Padding = Top, Right, Left, Bottom.*/
		bookmarkLI.style.padding = '0px 0px 0px 5px';	//Modify only the space between the icon and the title.
		parent.appendChild(bookmarkLI);
		
			
	}

}

/*This creates the layout of the table, that makes a look alike the addon manager panel*/
function createEffectInTable(cellName, selectedType){
	var td = document.getElementsByClassName(cellName);
	//Add an event listener to all the cell "menu"
	for (var i=0;i<td.length;i++){
		td[i].addEventListener('click',function(event){
			putLoading();
			//Get the element that was clicked on:
			var clickedElement = event.target;
			if (clickedElement.tagName == 'DIV'){
				var clickedElement = clickedElement.parentNode;
			}
			//Get the class of the clicked element to know if it was already selected.
			var clickedClass = clickedElement.getAttribute('class');
			if (clickedClass == cellName){//If it is not the selected one:
				//Get the selected one.
				var selected = document.getElementsByClassName(selectedType);
				//Make it unselected (a normal cell) 
				selected[0].setAttribute('class',cellName);
				//Make selected to the clicked cell.
				clickedElement.setAttribute('class',cellName+' '+selectedType);
			}
			var clickedChildren = event.target.children;
			
			
			var whatWasClicked = new Object();
			if (clickedChildren.length == 0){
				var parentNode = event.target.parentNode;
				whatWasClicked.id = parentNode.id;
				if (event.target.tagName == 'DIV' || event.target.tagName == 'div'){
					
					whatWasClicked.node = event.target.innerHTML;
				}
				
			}
			else{
				whatWasClicked.id = event.target.id;
				for each(var child in clickedChildren){
					if (child.tagName == 'DIV' || child.tagName == 'div'){
						//console.log("HTML = " + child.innerHTML);
						whatWasClicked.node = child.innerHTML;
					}
				}
			}
			self.port.emit('cellClicked',whatWasClicked);
			event.stopPropagation();
				
		},false);
	}
}


//Get the hidden row ready. Set their options to names
function initHiddenRow(){
	var twoOption = document.getElementById('twoOption');
	twoOption.setAttribute('class','bCell');
	var oneOption = document.getElementById('oneOption');
	oneOption.setAttribute('class','bCell bSelected');

}

//Shows the hidden row.
function showHiddenRow(){
	var hiddenRow = document.getElementById('hiddenRow');
		if (hiddenRow != null){
			hiddenRow.style.display='table-row';
			var content = document.getElementById('mainContent');
			content.setAttribute('class','content bContent');
	}
}

//Hides the hidden row.
function hideHiddenRow(){
	var hiddenRow = document.getElementById('hiddenRow');
	hiddenRow.style.display = 'none';
	var content = document.getElementById('mainContent');
	content.setAttribute('class','content');
}

//Set the hidden row's content with the options.
function setOptions(option1, option2){
	var optionOne = document.getElementById('oneOptionDiv');
	clean('oneOptionDiv');
	var t = document.createTextNode(option1);
	optionOne.appendChild(t);
	var optionTwo = document.getElementById('twoOptionDiv');
	clean('twoOptionDiv');
	var t = document.createTextNode(option2);
	optionTwo.appendChild(t);
}

//Set the loading message with its icon:
function putLoading(){
	var loading = document.getElementById('loading');
	if (loading.innerHTML == ''){
		var loadingIconSpan = document.createElement('span');
		var loadingIcon = document.createElement('img');
		loadingIcon.setAttribute('src',LOADING_ICON);
		loadingIcon.setAttribute('title','Loading. Please wait.....');
		loadingIconSpan.appendChild(loadingIcon);
		loading.appendChild(loadingIconSpan);
	
		var loadingText = document.createElement('span');
		loadingText.innerHTML = 'Loading. Please wait.....';
		loading.appendChild(loadingText);
	}

}



//Function that makes the <li> element's content, will be a div with two <p>
function makeLiContent(title, url){
	//Always a link, never a folder.
	//Make the div element.
	var div = document.createElement('div');
	
	//Make the title and add it to the div
	var titleSpan = document.createElement('span');
	titleSpan.setAttribute('class','title');
	var t = document.createTextNode(title);
	titleSpan.appendChild(t);
	div.appendChild(titleSpan);
	
	//Make the url and add it to the div
	var urlP = document.createElement('p');
	var urlA = document.createElement('a');
	urlA.setAttribute('href',url);
	var t = document.createTextNode(url);
	urlA.appendChild(t);
	urlA.setAttribute('class','url');
	urlP.appendChild(urlA);
	div.appendChild(urlP);
	
	//Make the line and add it to the div.
	var line = document.createElement('hr');
	line.setAttribute('class','liLine');
	div.appendChild(line);
	
	return div;
}


//Function that makes the <li> element's content, will be a div with two <p> The difference with the above one is that
// this has the last visited date and the numbe of times the user has visited a url:
function makeHistoryLiContent(title, url, lastVisited, visited){
	//Always a link, never a folder.
	//Make the div element.
	var div = document.createElement('div');

	
	//Make the title and add it to the div
	var titleSpan = document.createElement('span');
	titleSpan.setAttribute('class','title');
	var t = document.createTextNode(title);
	titleSpan.appendChild(t);
	div.appendChild(titleSpan);
	
	//Make the url and add it to the div
	var urlP = document.createElement('p');
	var urlA = document.createElement('a');
	urlA.setAttribute('href',url);
	var t = document.createTextNode(url);
	urlA.appendChild(t);
	urlA.setAttribute('class','url');
	urlP.appendChild(urlA);
	var p = document.createElement('p');
	p.setAttribute('class','small visitedInfo');
	/* Two types of dates, one is javascript and another from python type datetime*/
	var aux = lastVisited.split(" ");
	if (aux.length > 1){
		//It is python type, convert to javscript
		var date = new Date(aux[0]+'T'+aux[1]);
	}
	else{
		var date = new Date(lastVisited);
	}
	var textNode = document.createTextNode('Last visited: ' + date + " and visited: " + visited + " times");
	p.appendChild(textNode);
	urlP.appendChild(p);
	div.appendChild(urlP);
	
	//Make the line and add it to the div.
	var line = document.createElement('hr');
	line.setAttribute('class','liLine');
	div.appendChild(line);
	
	
	return div;
}




function clean(elementToClean){
	var toClean = document.getElementById(elementToClean);
	if (toClean != null){
		while (toClean.firstChild) {
    		toClean.removeChild(toClean.firstChild);
		}
	}
	//Clean also the loading message:
	
}

