//As soon as the page loads, put the event listeners by calling this function:
startUp();
//Show the saved tabs. Display the elements in the content.
self.port.on('show',function(toDisplay){

	var server = toDisplay.server;
	var data = toDisplay.data;
	var element = toDisplay.element;
	
	if (data == null){
		showOnlyThis(server,element);
		clean(server+element+'Content');
		var mainContent = document.getElementById(server+element+'Content');
		var p = document.createElement('p');
		var img = document.createElement('img');
		img.setAttribute('class','serverLogo');
		var image = 'images/'+server+'.png';
		img.setAttribute('src',image);
		img.setAttribute('title','Message from' + server);
		p.appendChild(img);
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
		textToPut = document.createTextNode(textToPut);
		p.appendChild(textToPut);		
		mainContent.appendChild(p);
	}
	else{
		var key = Object.keys(data);
		var element = toDisplay.element;
		showOnlyThis(server,element);
		try{
			var all = data[key];
			if (key == 'msg'){
				handle_main_content(server,element);
				var mainContent = document.getElementById(server+element+'Content');
				var p = document.createElement('p');
				var t = document.createTextNode(data[key]);
				p.appendChild(t);
				mainContent.appendChild(p);
			}
			else{
				handle_main_content(server,element);
				try{
					all = JSON.parse(all);
				}
				catch(e){
					//Not a string, its a JSON object (already parsed)
					all = all;
				}
				if (all == null ||  all.length == 0){
					createItem('Nothing saved yet!', null, server,true, element);
			
				}else{
					for (var l=0;l<all.length;l++){
						createItem(all[l].title, all[l].url, server,false, element);
					}
				}
			}
		}catch(e){

		}
	}
	

});

//To show the tabs of this device and the saved tabs of other devices!
self.port.on('takeAllTabs',function(allTabs){

	var server = 'mysite';
	var element = 'tabs';
	var toClean = server+'synced'+element+'Content';
	clean(toClean);
	showOnlyThis(server,element);

	if (allTabs == null){
		handle_main_content(server+'synced',element);	
	    var mainContent = document.getElementById(server+'synced'+element+'Content');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Synced yet!';
		mainContent.appendChild(p);
	}
	else{
		var found = false;
		var this_device = false;
		handle_main_content(server,element);
		var content = document.getElementById(server+'synced'+element+'Content');
		for (var j=0;j<allTabs.length;j++){
			this_device = false;
			var ul = document.createElement('ul');
			ul.setAttribute('class','device');
			var aTab = allTabs[j];
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
						//Do nothing!
				}
			}
			
			var device_name = device.device_name;

			var h3 = document.createElement('h3');
			if (this_device == true){
				var textToShow = device_name + "(this device)";
					
			}
			else{
				var textToShow = device_name;
			}
			var text = document.createTextNode("Tabs from " + textToShow);
			h3.appendChild(text);
			ul.appendChild(h3);
			ul.addEventListener('click',function(event){
				event.stopPropagation();
			    var n = event.target;
			    var e = n.nextSibling;
			    while (e) {
					var s = e.nodeName;
					if (s == 'DIV'){
						var thisClass = e.className;
						var splitItem = thisClass.split('item')
						if (splitItem.length > 1){
						var splitted = thisClass.split('hidden');
						if (splitted.length > 1){
							e.setAttribute('class',splitted[0] + ' shown');
						}
						else{
						  e.setAttribute('class',splitted[0]+' hidden');
						}
						}
				  
					}
					e = e.nextSibling;
			    }

			});
			var tabs = aTab.tabs;
			for (var i=0;i<tabs.length;i++){
				var tabDIV = document.createElement('DIV');
				tabDIV.setAttribute('class','item hidden');
				var title = tabs[i].title;
				var url = tabs[i].url;
				var p = document.createElement('p');
				p.setAttribute('id','title');
				var span = document.createElement("SPAN");
				span.setAttribute('class','imageHolder');
				var img = document.createElement('IMG');
				var favicon = "http://www.google.com/s2/favicons?domain="+url;
				img.setAttribute('src',favicon);
				span.appendChild(img);
				p.appendChild(span);
				var titleNode = document.createTextNode(title);
				p.appendChild(titleNode);
				tabDIV.appendChild(p);
				var a = document.createElement('a');
				a.setAttribute('href',url);
				var t = document.createTextNode(url);
				a.appendChild(t);
				a.setAttribute('class','url');
				tabDIV.appendChild(a);	
				ul.appendChild(tabDIV);
	
		      }
		      content.appendChild(ul);
			
			
		
		}	
	}
});

//Show the locally saved bookmarks of other devices:
self.port.on('takeAllBookmarks',function(bookmarksToShow){
	var server = 'mysite';
	var element = 'bookmarks';
	var toClean = server+'synced'+element+'Content';
	clean(toClean);
	showOnlyThis(server,element);
	if (bookmarksToShow == null || bookmarksToShow.length == 0){
		handle_main_content(server+'synced',element);
		var mainContent = document.getElementById(server+'synced'+element+'Content');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Synced yet!';
		mainContent.appendChild(p);
	}
	else{
		handle_main_content(server+'synced',element);
		for (var i=0;i<bookmarksToShow.length;i++){
			var aBookmark = bookmarksToShow[i];
			var bookmarks = aBookmark.bookmarks;
			try{
				var device = JSON.parse(aBookmark.device);	
			}
			catch(e){
				var device = aBookmark.device;
			}
			var device_name = device.device_name;
			var device_id = device.device_id;
			var aDeviceUL = document.createElement('UL');
			aDeviceUL.setAttribute('class','device');
			var text = document.createTextNode(device_name);
			var h3 = document.createElement('h3');
			h3.appendChild(text);
			aDeviceUL.appendChild(h3);
			var bookmarksList = document.getElementById(server+'synced'+element+'Content');
			bookmarksList.appendChild(aDeviceUL);
			aDeviceUL.addEventListener('click',function(event){
				event.stopPropagation();
				var node = event.target;
				var children = node.children;
				for (var k=0;k<children.length;k++){
					var child = children[k];
					var childClass = child.className;
					if (child.nodeName != 'HR' && child.nodeName != 'H3'){
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
	}
});

self.port.on('takeAllHistory',function(allHistory){
	var server = 'mysite';
	var element = 'history';
	var toClean = server+'synced'+element+'Content';
	clean(toClean);
	var historyList = document.getElementById('mysitesyncedhistoryContent');
	showOnlyThis(server,element);
	if (allHistory == null || allHistory.length == 0){
		handle_main_content(server+'synced',element);
		var mainContent = document.getElementById(server+'synced'+element+'Content');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Synced yet!';
		mainContent.appendChild(p);	
	}
	else{
		handle_main_content(server+'synced',element);
		var content = document.getElementById(server+'synced'+element+'Content');
		for (var j=0;j<allHistory.length;j++){
			var ul = document.createElement('ul');
			
			ul.setAttribute('class','device');
			var aHistory = allHistory[j];
			try{
				var device = JSON.parse(aHistory.device);
			}
			catch(e){
				var device = aHistory.device;
			}
			var device_name = device.device_name;
			
			var text = document.createTextNode('History from ' + device_name);
			
			var h3 = document.createElement('h3');
			h3.appendChild(text);
			ul.appendChild(h3);
			ul.addEventListener('click',function(event){
				event.stopPropagation();
			    var n = event.target;
			    var e = n.nextSibling;
			    while (e) {
				var s = e.nodeName;
				if (s == 'DIV'){
				    var thisClass = e.className;
				    var splitItem = thisClass.split('item')
				    if (splitItem.length > 1){
					var splitted = thisClass.split('hidden');
					if (splitted.length > 1){
					    e.setAttribute('class',splitted[0] + ' shown');
					}
					else{
					  e.setAttribute('class',splitted[0]+' hidden');
					}
				    }
				  
				}
				e = e.nextSibling;
			    }

			});
			var history = aHistory.history;
			for (var i=0;i<history.length;i++){
				var historyDIV = document.createElement('DIV');
				historyDIV.setAttribute('class','item hidden');
				var title = history[i].title;
				var url = history[i].url;
				var p = document.createElement('p');
				p.setAttribute('id','title');
				var span = document.createElement("span");
				span.setAttribute('class','imageHolder');
				var img = document.createElement('img');
				var favicon = "http://www.google.com/s2/favicons?domain="+url;
				img.setAttribute('src',favicon);
				span.appendChild(img);
				p.appendChild(span);
				var titleNode = document.createTextNode(title);
				p.appendChild(titleNode);
				historyDIV.appendChild(p);
				var a = document.createElement('a');
				a.setAttribute('class','url');
				a.setAttribute('href',url);
				var t = document.createTextNode(url);
				a.appendChild(t);
				
				historyDIV.appendChild(a);
				var lastVisited = history[i].lastVisited;
				var visited = history[i].visited;
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
				historyDIV.appendChild(p);
				ul.appendChild(historyDIV);
	
		      }
		      content.appendChild(ul);
			
			
		
		}
		
	}


});



/*********FUNCTIONS*********************************************/
function startUp(){
	//Put the event listeners to the nav menu buttons:
	var tabsCell = document.getElementById('tab');
	if (tabsCell){
		tabsCell.addEventListener('click',function(event){
			event.stopPropagation();
			//When the Tabs is clicked. Hide the options panel and show the tabs panel
			hideOptions();
			self.port.emit('showTabs',null);
		});
	}
	var bookmarksCell = document.getElementById('bookmark');
	if (bookmarksCell){
		bookmarksCell.addEventListener('click',function(event){
			event.stopPropagation();
			//When the Bookmarks is clicked. Hide the options panel and show the tabs panel
			hideOptions();
			self.port.emit('showBookmarks',null);
		});
	}
	var historyCell = document.getElementById('history');
	if (historyCell){
		historyCell.addEventListener('click',function(event){
			event.stopPropagation();
			//When the History is clicked. Hide the options panel and show the tabs panel
			hideOptions();
			self.port.emit('showHistory',null);
		});
	}
	var optionCell = document.getElementById('options');
	if (optionCell){
		optionCell.addEventListener('click',function(event){
			event.stopPropagation();
			//Show only the main options
			handle_main_content(null,'options');
			//When the Options is clicked. Show only the Options panel
			showOptions();
		});
	}
	var share = document.getElementById('share');
	if (share){
		share.addEventListener('click',function(event){
			event.stopPropagation();
			//In the options panel, when the Share Options is clicked
			self.port.emit('share',null);
		
		});
	}
	var saveTabs = document.getElementById('saveTabs');
	if (saveTabs){
		saveTabs.addEventListener('click',function(event){
			event.stopPropagation();
			//In the options panel when Save All Tabs is clicked
			self.port.emit('saveTabs',null);
		});
	}
	var help = document.getElementById('help');
	if (help){
		help.addEventListener('click',function(event){
			event.stopPropagation();
			//In the options panel when Help is clicked
			self.port.emit('help',null);
		});
	}
	var syncAll = document.getElementById('syncAll');
	if (syncAll){
		syncAll.addEventListener('click',function(event){
			event.stopPropagation();
			//In the options panel when Sync All Now is clicked
			self.port.emit('syncAll',null);
		});
	}

}


function hideOptions(){
	var optionsContent = document.getElementById('optionsContent');
	optionsContent.setAttribute('class','hidden');
	
}

/*Show the option panel, which is hidden*/
function showOptions(){
	var optionsContent = document.getElementById('optionsContent');
	optionsContent.setAttribute('class','shown');
}

/*Show the title of the respective element and server.*/
function showTitle(element, server){
	var titleToShow = server+element+'Title';
	var contentTitle = document.getElementById(titleToShow);			
	if (contentTitle){
		var thisClass = contentTitle.className;
		if (thisClass == 'title hidden'){
			var newClass = 'title shown';
			contentTitle.setAttribute('class',newClass);
		}
		var thisClass = contentTitle.className;
	}
}

function createLi(title,url,parent){
	var div = document.createElement('div');
	div.setAttribute('class','item');
	var p = document.createElement('p');
	p.setAttribute('id','title');
	var t = document.createTextNode(title);
	p.appendChild(t);
	div.appendChild(p);
	var a = document.createElement('a');
	a.setAttribute('class','url');
	a.setAttribute('href',url);
	var t = document.createTextNode(url);
	a.appendChild(t);
	div.appendChild(a);		
	
	parent.appendChild(div);


}


function createItem(title, url, server, nothing, element){
	/*create:
	 * <div id="server+element+Content">
	 * 		<div class="item">
	 * 			<p id="title">title</p>
	 * 			<a href=url>url</a>
	 * 		</div>
	 * </div>
	 * 
	 * */
	var toPutIn = server+element+'Content';
	var content = document.getElementById(toPutIn);
	var div = document.createElement('div');
	div.setAttribute('class','item');
	var p = document.createElement('p');
	p.setAttribute('id','title');
	var t = document.createTextNode(title);
	p.appendChild(t);
	div.appendChild(p);
	if (!nothing){
		var a = document.createElement('a');
		a.setAttribute('href',url);
		var t = document.createTextNode(url);
		a.appendChild(t);
		div.appendChild(a);		
	}
	content.appendChild(div);
}

/*Clean the given node*/
function clean(elementToClean){
	var toClean = document.getElementById(elementToClean);
	if (toClean != null){
		while (toClean.firstChild) {
    			toClean.removeChild(toClean.firstChild);
		}
	}
	
}

/*Handle the click on the bookmarks folders.*/
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
	event.stopPropagation();
}



function handle_children(aBookmark,parentNode,device_name){
	var ifFolder = aBookmark.ifFolder;
	var parentId = aBookmark.parentId;
	if (parentId == 0){
		//One of the root folders
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
		bookmarkLI.style.listStyleImage = "url('"+favQuery+"') no-repeat left top";
		bookmarkLI.style.margin = '0px';
		/*Padding = Top, Right, Left, Bottom.*/
		bookmarkLI.style.padding = '0px 0px 0px 5px';	//Modify only the space between the icon and the title.
		parent.appendChild(bookmarkLI);
		
			
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
	urlA.setAttribute('class','url');
	urlA.setAttribute('href',url);
	var t = document.createTextNode(url);
	urlA.appendChild(t);
	urlA.setAttribute('class','url');
	urlP.appendChild(urlA);
	div.appendChild(urlP);
	
	return div;
}




/*Depending on what was clicked, show or hide panel*/
function handle_main_content(server,element){
		//Show only the indicated content.
		clean(server+element+'Content');
		if (element == 'options'){
			var toHide = document.getElementById('bookmarksContent');
			toHide.setAttribute('class','hidden');
			var toHide = document.getElementById('historyContent');
			toHide.setAttribute('class','hidden');
			var toHide = document.getElementById('tabsContent');
			toHide.setAttribute('class','hidden');
			
		}
		else if (element == 'tabs'){
			var toHide = document.getElementById('bookmarksContent');
			toHide.setAttribute('class','hidden');
			var toHide = document.getElementById('historyContent');
			toHide.setAttribute('class','hidden');
			
			var toShow = document.getElementById('tabsContent');
			toShow.setAttribute('class','shown');
				
		}
		else if(element == 'bookmarks'){
			var toHide = document.getElementById('tabsContent');
			toHide.setAttribute('class','hidden');
			var toHide = document.getElementById('historyContent');
			toHide.setAttribute('class','hidden');
			
			var toShow = document.getElementById('bookmarksContent');
			toShow.setAttribute('class','shown');
		}
		else if(element == 'history'){
			var toHide = document.getElementById('bookmarksContent');
			toHide.setAttribute('class','hidden');
			var toHide = document.getElementById('tabsContent');
			toHide.setAttribute('class','hidden');
			
			var toShow = document.getElementById('historyContent');
			toShow.setAttribute('class','shown');
		}

	
	
}

/*Show only for example:  tabsOfmysite or tabsOfdropbox, only the div that has elements*/
function showOnlyThis(server,element){
		var toShow = document.getElementById(element+'Of'+server);
		if (toShow != null){
			toShow.setAttribute('class','shown');
		}
		
}





