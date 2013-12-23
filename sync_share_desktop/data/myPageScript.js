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
const SYNCING_ICON = 'http://i42.tinypic.com/103trti.jpg';
const SYNC_ICON = 'http://i44.tinypic.com/212fy3l.jpg';


/*TABS_ICON = http://i43.tinypic.com/2z4jvkk.jpg*/
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
	//This is to decide if the hidden row is going to be shown or not
	//var createEffect = false;	//Create the hidden/shown row effect:
	var createEffect = true;
	clean('mainContent');
	//clean('loading');
		
	if (element == 'bookmarks'){
		setOptions('Bookmarks','Saved Bookmarks');
		//createEffect = true;
	}
	else if(element == 'history'){
		setOptions('History','Saved History');
		//createEffect = true;
	}
	else if(element == 'tabs'){
		setOptions('Tabs','Saved Tabs');
	}
	
	if (createEffect){
		//Bookmarks, history
		showHiddenRow();
		//createEffectInTable('bCell','bSelected');
		
		var mainContent = document.getElementById('mainContent');
		var UL = document.createElement('ul');
		UL.setAttribute('id',element+'List');
		mainContent.appendChild(UL);
	}
	/*else{
		//putLoading();
		hideHiddenRow();
		/*var loading = document.getElementById('loading');
		loading.innerHTML = 'Loading. Please wait.....'*/
	//}
	
});


self.port.on('clean',function(msg){
	clean(msg);

});
//Get the hidden row ready:
self.port.on('initHiddenRow',initHiddenRow);

//Show the saved tabs. Display the elements in the content.
self.port.on('show',function(toDisplay){
	//console.log("SCRIPT : TO DISPLAY");
	//console.log(toDisplay);
	//console.log(JSON.stringify(elementsToShow));
	//First clean the table, delete the previous items that were showing:
	//clean('mainContent');
	//var tabsTable = document.getElementById('tabsTable');
	clean('loading');
	var server = toDisplay.server;
	var elementsToShow = toDisplay.data;

	if (elementsToShow == null){
		var mainContent = document.getElementById('mainContent');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Saved yet!';
		mainContent.appendChild(p);
	}
	else{
		//console.log();
		var key = Object.keys(elementsToShow);
		//console.log("SCRIPT : key = " + key);
		try{
			if (key == 'msg'){
				var mainContent = document.getElementById('mainContent');
				var p = document.createElement('p');
				p.innerHTML = elementsToShow[key];
				mainContent.appendChild(p);
			}
			else{
				var all = elementsToShow[key];
				if (all.length == 0){
					var mainContent = document.getElementById('mainContent');
					var p = document.createElement('p');
					p.innerHTML = 'Nothing Saved yet!';
					mainContent.appendChild(p);
		
				}else{
					for each (var element in all){
						//var rowCell = document.createElement('tr');
						//var columnCell = document.createElement('td');
						var mainContent = document.getElementById('mainContent');
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
						mainContent.appendChild(p1);
						//document.insertBefore(image,p1);
						var p2 = document.createElement('p');
						p2.setAttribute('class','url');
						
						var a = document.createElement('a');
						a.setAttribute('href',element.url);
						a.setAttribute('class','urlContainer');
						var text = document.createTextNode(element.url);
						a.appendChild(text);
						
						p2.appendChild(a);
						
						var line = document.createElement('hr');
						mainContent.appendChild(p2);
						mainContent.appendChild(line);
					}
				}
			}
		}catch(e){
			console.log("ERROR!!!");
		}
	}

});

/*
self.port.on('showbo',function(elementsToShow){
	clean('loading');
	var allBookmarks = elementsToShow.bookmarks;

	for each(var bookmark in allBookmarks){
		var mainContent = document.getElementById('mainContent');
		var p1 = document.createElement('p');
		p1.setAttribute('id','tabsTitle');
		p1.innerHTML = bookmark.title;
		mainContent.appendChild(p1);
		//document.insertBefore(image,p1);
		var p2 = document.createElement('p');
		p2.setAttribute('class','url');
		p2.innerHTML = bookmark.url;
		var line = document.createElement('hr');
		mainContent.appendChild(p2);
		mainContent.appendChild(line);
	}

});

self.port.on('showhistory',function(elementsToShow){
	clean('loading');
	var allBookmarks = elementsToShow.bookmarks;
	for each(var bookmark in allBookmarks){
		var mainContent = document.getElementById('mainContent');
		var p1 = document.createElement('p');
		p1.setAttribute('id','tabsTitle');
		p1.innerHTML = bookmark.title;
		mainContent.appendChild(p1);
		//document.insertBefore(image,p1);
		var p2 = document.createElement('p');
		p2.setAttribute('class','url');
		p2.innerHTML = bookmark.url;
		var line = document.createElement('hr');
		mainContent.appendChild(p2);
		mainContent.appendChild(line);
	}

});

*/
	


/*Synch foto = https://cdn3.iconfinder.com/data/icons/block/32/sync-512.png*/
self.port.on('takeAllTabs',function(allTabs){
	clean('loading');
	//console.log("TAbs " + allTabs.length);
	//console.log(allHistory);
	var tabsList = document.getElementById('tabsList');
	//console.log("History length = " +  allHistory.length);
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
			//console.log(aTab.device);
			try{
				var device = JSON.parse(aTab.device);
			
			}
			catch(e){
				var device = aTab.device;
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
			//console.log(device_name);
			var tabs = aTab.tabs;
			var aDeviceUL = document.createElement('UL');
			aDeviceUL.setAttribute('class','device');
			aDeviceUL.addEventListener('click',function(event){
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
					var textToShow = device_name + " (this device)";
			}
			else{
					var textToShow = device_name ;
			}
			var text = document.createTextNode(textToShow);
			aDeviceUL.appendChild(text);
			for (var i=0;i<tabs.length;i++){
				var aTabLI = document.createElement('li');
				aTabLI.setAttribute('class','hidden');
				//aHistoryLI.setAttribute('class','history');
				var favQuery = "http://www.google.com/s2/favicons?domain="+tabs[i].url;
				aTabLI.style.listStyleImage = "url('"+favQuery+"')";
				aTabLI.style.margin = '0px';
				/*Padding = Top, Right, Left, Bottom.*/
				//aTabLI.style.padding = '0px 0px 0px 5px';	//Modify only the space between the icon and the title.
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



self.port.on('takeAllHistory',function(allHistory){
	clean('loading');
	//console.log("HISTORY " + allHistory.length);
	//console.log(allHistory);
	var historyList = document.getElementById('historyList');
	//console.log("History length = " +  allHistory.length);
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
			//console.log(aHistory.device);
			try{
				var device = JSON.parse(aHistory.device);
			
			}
			catch(e){
				var device = aHistory.device;
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
			//console.log(device_name);
			var history = aHistory.history;
			var aDeviceUL = document.createElement('UL');
			aDeviceUL.setAttribute('class','device');
			aDeviceUL.addEventListener('click',function(event){
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
					var textToShow = device_name + ' (this device )';
			}
			else{
					var textToShow = device_name;
			}
			var text = document.createTextNode(textToShow);
			aDeviceUL.appendChild(text);
			for (var i=0;i<history.length;i++){
				var aHistoryLI = document.createElement('li');
				aHistoryLI.setAttribute('class','hidden');
				//aHistoryLI.setAttribute('class','history');
				var favQuery = "http://www.google.com/s2/favicons?domain="+history[i].url;
				aHistoryLI.style.listStyleImage = "url('"+favQuery+"')";
				aHistoryLI.style.margin = '0px';
				/*Padding = Top, Right, Left, Bottom.*/
				//aHistoryLI.style.padding = '0px 0px 0px 5px';	//Modify only the space between the icon and the title.
				var liDiv = makeLiContent(history[i].title, history[i].url);
				liDiv.setAttribute('class','history');
				aHistoryLI.appendChild(liDiv);
				aDeviceUL.appendChild(aHistoryLI);
			}
			
			anItem.appendChild(aDeviceUL);
			historyList.appendChild(anItem);
		
		}
	}


});





self.port.on('takeAllBookmarks',function(bookmarksToShow){
	/*https://cdn3.iconfinder.com/data/icons/block/32/sync-512.png*/
	//console.log("Show all bookmarks");
	//console.log(bookmarksToShow);
	console.log("Length of bookmarksToShow = " + bookmarksToShow.length);
	var found = false;
	var this_device = false;
	for (var i=0;i<bookmarksToShow.length;i++){
		this_device = false;
		console.log("******************************************");
		//console.log(bookmarksToShow[i]);
		var anItem = document.createElement('DIV');
		anItem.setAttribute('class','item');
		var aBookmark = bookmarksToShow[i];
		//console.log(aBookmark.device);
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
						console.log("THIS DEVICE FOUND!!!!");
						found = true;
				}
				catch(e){
						//Do nothing
				}
		}
		var device_name = device.device_name;
		var device_id = device.device_id;
		console.log("********"+device_name+"********");
		var aDeviceUL = document.createElement('UL');
		aDeviceUL.setAttribute('class','device');
		if (this_device == true){
				var textToShow = device_name + ' (this device)';
		}
		else{
				var textToShow = device_name;
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
					//console.log('device: mychild = ' + child.nodeName);
					//console.log('device: mychild before = ' + child.className);
					if (childClass == 'hidden'){
						child.setAttribute('class','shown');
					}
					else{
						child.setAttribute('class','hidden');
					}
					//console.log("my child after: " + child.className);
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
			//console.log(device_name + " " + parentId + "  " + aBookmark.title)
			//console.log('takeABookmark received : ' + bookmarks[j].title);
			if (parentId == 0){
				//console.log(device_name + " " + parentId + "  " + aBookmark.title)
				handle_children(aBookmark,bookmarkDiv,device_id);
			}
		}
		
		
		
	}
	clean('loading');

	
	
});




/*************FUNCTIONS****************/
/*
function searchForSame(searchedUrl, parent, server){
	/*
	 * <p class="url"><a class="urlContainer" href="searchedUrl">"searchedURl"</a></p>
	 * var p2 = document.createElement('p');
						p2.setAttribute('class','url');
						
						var a = document.createElement('a');
						a.setAttribute('src',element.url);
						var text = document.createTextNode(element.url);
						a.appendChild(text);
						
						p2.appendChild(a);
	 * */
/*	var same = 
	var allUrls = parent.getElementsByClassName('urlContainer');
	for (var i=0;i<allUrls.length;i++){
			
		
	
	}
	
	
}*/

function handle_event(event){
	//console.log("I was clicked!!  " + event.target.nodeName);
	var whatWasClicked = event.target;
	if (whatWasClicked.nodeName == 'UL'){ //Only when a folder is clicked
		//console.log(whatWasClicked.children);
		var ULChildren = event.target.children;	//The third child is the LI elements
			//console.log(ULChildren);
			if (ULChildren != undefined){
				for (var i=0;i<ULChildren.length;i++){
					//console.log(i+" ULChildren = " + ULChildren[i].nodeName);
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
	event.stopPropagation();
}





function handle_children(aBookmark,parentNode,device_name){
	var ifFolder = aBookmark.ifFolder;
	var parentId = aBookmark.parentId;
	if (parentId == 0){
		//One of the root folders
		var parent = parentNode;
		//console.log("I am a root folder!!!!");
		//console.log("My parent is = " + parent.nodeName + '  ' + parent.className );
	}
	else{
		var parent = document.getElementById(parentId+device_name);
	}
	
	//var item = document.getElementById(aBookmark.itemId+device_name);
	//if (!item){
		if (ifFolder){
			var children = aBookmark.children;
			//console.log("Add " + aBookmark.title + " as folder!");
			//var aDiv = document.createElement('div');
			var bookmarkUL = document.createElement('ul');
			bookmarkUL.setAttribute('id',aBookmark.itemId+device_name);
			if (parentId != 0 ){
			bookmarkUL.setAttribute('class','hidden');
		}
			//bookmarkUL.setAttribute('class','title');
			//console.log("Create title!!!! "+aBookmark.title);
			var bookmarkText = document.createTextNode(aBookmark.title);
			bookmarkUL.appendChild(bookmarkText);
			var line = document.createElement('hr');
			bookmarkUL.appendChild(line);
			var favQuery = "http://www.gettyicons.com/free-icons/103/pretty-office-2/png/256/folder_256.png";
			bookmarkUL.style.background = "url('"+favQuery+"') no-repeat left top";
			bookmarkUL.style.backgroundSize = "15px 15px";
			bookmarkUL.style.margin = '0px';
			bookmarkUL.style.padding = '0px 0px 0px 20px';	//Modify only the space between the icon and the title.
			
			//console.log("Add event Listener to " + aBookmark.title);
			if (parentId != 0){
				bookmarkUL.addEventListener('click',handle_event, false);
			}
			parent.appendChild(bookmarkUL);
			if (children){
			
				for (var j=0;j<children.length;j++){
					//console.log("Handle my children " + aBookmark.title);
						handle_children(children[j], null, device_name);
				}
			
			}
				
		}
		else{
			//console.log("Add " + aBookmark.title + " as NO folder!");
			var bookmarkLI = document.createElement('LI');	
			var ifMain = (parentId == 2 || parentId == 3 || parentId == 5);
			//console.log("IS FROM PARENT ID = " + ifMain);
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
		//}
}




function clickEnter(_fn)
{
   return function(_evt)
   {
      var relTarget = _evt.relatedTarget;
      if (this === relTarget || isAChildOf(this, relTarget))
         { return; }

      _fn.call(this, _evt);
   }
};

function isAChildOf(_parent, _child)
{
   if (_parent === _child) { return false; }
      while (_child && _child !== _parent)
   { _child = _child.parentNode; }

   return _child === _parent;
}


function createEffectInTable(cellName, selectedType){
	//console.log("\t\t\t\t Creating effect in table " + cellName + "," + selectedType);
	var td = document.getElementsByClassName(cellName);
	
	//Add an event listener to all the cell "menu"
	for (var i=0;i<td.length;i++){
		//var ifClickedAdded = td[i].className.split(' click');
		//if (ifClickedAdded.length == 1 ){
			//console.log("\t\t\t\t Doesn't have click!!!!!");
			//td[i].setAttribute('class',td[i].getAttribute('class')+' click');	//Click added
			td[i].addEventListener('click',function(event){
				putLoading();
				//var loading = document.getElementById('loading');
				//loading.innerHTML = 'Loading. Please wait.......'
				//console.log('I have been clicked on!! ' + event.target.innerHTML);
				//Get the element that was clicked on:
				var clickedElement = event.target;
				if (clickedElement.tagName == 'DIV'){
					var clickedElement = clickedElement.parentNode;
				}
				//Get the class of the clicked element to know if it was already selected.
				var clickedClass = clickedElement.getAttribute('class');
				//var selectedOne = clickedClass.split(selectedType);
				if (clickedClass == cellName){//If it is not the selected one:
				//if (selectedOne.length == 1 ){ //Not the selected onw
					//Get the selected one.
					var selected = document.getElementsByClassName(selectedType);
					//Make it unselected (a normal cell) 
					selected[0].setAttribute('class',cellName);
					//Make selected to the clicked cell.
					clickedElement.setAttribute('class',cellName+' '+selectedType);
				}//
				/*else{//The selected one
					console.log("Adding click");
					clickedElement.setAttribute('class' + clickedClass+' click');
				
				}*/
				//console.log("Clicked on " + clickedElement.nodeName);
				var clickedChildren = event.target.children;
				//console.log("ClickedChildren length = " + clickedChildren.length );
				
				var whatWasClicked = new Object();
				if (clickedChildren.length == 0){
					var parentNode = event.target.parentNode;
					whatWasClicked.id = parentNode.id;
					if (event.target.tagName == 'DIV' || event.target.tagName == 'div'){
						//console.log("INNER HTML = " + event.target.innerHTML);
						whatWasClicked.node = event.target.innerHTML;
					}
					
				}
				else{
					whatWasClicked.id = event.target.id;
					for each(var child in clickedChildren){
						//console.log('Clicked node name ' + child.nodeName);
						//console.log('Clicked tag name ' + child.tagName);
						if (child.tagName == 'DIV' || child.tagName == 'div'){
							//console.log("HTML = " + child.innerHTML);
							whatWasClicked.node = child.innerHTML;
						}
					}
				}
				
				//whatWasClicked.node = event.target.innerHTML;
				
				//console.log("CLicked on = " + event.target.id);
				self.port.emit('cellClicked',whatWasClicked);
				//console.log("\t\t\t\t cellClicked Sent.");
		
					
			},false);
			
		//}else{
		//	console.log("\t\t\t HAS CLICK");
		//}
	}
}


//Get the hidden row ready
function initHiddenRow(){
	//console.log('\t\t\t\t initHiddenRow');
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
	optionOne.innerHTML = option1;
	var optionTwo = document.getElementById('twoOptionDiv');
	optionTwo.innerHTML = option2;
}

//Set the loading message with its icon:
function putLoading(){
	//console.log("\t\t\t\tAdding loading.....");
	var loading = document.getElementById('loading');
	if (loading.innerHTML == ''){
		var loadingIconSpan = document.createElement('span');
		var loadingIcon = document.createElement('img');
		loadingIcon.setAttribute('src',LOADING_ICON);
		//loadingIcon.setAttribute('width','15px');
		//loadingIcon.setAttribute('height','15px');
		loadingIcon.setAttribute('title','Loading. Please wait.....');
		loadingIconSpan.appendChild(loadingIcon);
		loading.appendChild(loadingIconSpan);
	
		var loadingText = document.createElement('span');
		loadingText.innerHTML = 'Loading. Please wait.....';
		loading.appendChild(loadingText);
		//console.log('\t\t\t\tLoading added complete.\r\n\r\n');
	}

}



//Function that makes the <li> element's content, will be a div with two <p>
function makeLiContent(title, url){
	//Always a link, never a folder.
	//Make the div element.
	var div = document.createElement('div');
	
	/*var imageSpan = document.createElement('span');
	imageSpan.setAttribute('class','hidden');
	var image = document.createElement('img');
	image.setAttribute('title','Click to save.');
	image.setAttribute('src',SYNC_ICON);
	image.setAttribute('width','15px');
	image.setAttribute('height','15px');
	imageSpan.appendChild(image);
	div.appendChild(imageSpan);*/
	
	//Make the title and add it to the div
	var titleSpan = document.createElement('span');
	titleSpan.setAttribute('class','title');
	titleSpan.innerHTML = title;
	div.appendChild(titleSpan);
	
	//Make the url and add it to the div
	var urlP = document.createElement('p');
	var urlA = document.createElement('a');
	urlA.setAttribute('href',url);
	urlA.innerHTML = url;
	urlA.setAttribute('class','url');
	urlP.appendChild(urlA);
	div.appendChild(urlP);
	
	//Make the line and add it to the div.
	var line = document.createElement('hr');
	line.setAttribute('class','liLine');
	div.appendChild(line);
	
	/*div.addEventListener('mouseover',function(event){
		//console.log('Hovered over ' + event.target.nodeName);		
		var DIVChildren = event.target.parentNode.children;	//The third child is the LI elements
		if (DIVChildren != undefined){
			for (var i=0;i<DIVChildren.length;i++){
				//console.log(i+" DIVChildren = " + DIVChildren[i].className);
				if (DIVChildren[i].className == 'hidden'){
					//console.log("IMG = " + DIVChildren[i].innerHTML);
					DIVChildren[i].className = 'show';
				}
				
			}
		}
			
	});*/
	
	/*div.addEventListener('mouseout',function(event){
		//console.log(event.target.parentNode);
		
		var DIVChildren = event.target.parentNode.children;	//The third child is the LI elements
		if (DIVChildren != undefined){
			for (var i=0;i<DIVChildren.length;i++){
				//console.log(i+" DIVChildren = " + DIVChildren[i].className);
				if (DIVChildren[i].className == 'show'){
					//console.log("IMG = " + DIVChildren[i].innerHTML);
					DIVChildren[i].className = 'hidden';
				}
				
			}
		}
			
	});*/
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

