startUp();


//Show the saved tabs. Display the elements in the content.
self.port.on('show',function(toDisplay){
	//console.log("To show!!!");
	//clean('loading');
	//console.log(toDisplay);
	var server = toDisplay.server;
	var data = toDisplay.data;
	var element = toDisplay.element;

	if (data == null){
		console.log("TO SHOW " + toDisplay.element+" is NULL!!!!");
		showOnlyThis(server,element);
		clean(server+element+'Content');
		var mainContent = document.getElementById(server+element+'Content');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Saved yet!';
		mainContent.appendChild(p);
	}
	else{
		var key = Object.keys(data);
		var element = toDisplay.element;
		showOnlyThis(server,element);
		try{
			var all = data[key];
			console.log("Sent from " + server+" = " + JSON.stringify(all));
			/*if (key == 'tabs'){	
				creTitle('Saved Tabs');	
			}else if (key == 'bookmarks'){
				createTitle('Saved Bookmarks');
			}else if (key == 'history'){
				createTitle('Saved History');
			}*/
			//window.alert(key);
			if (key == 'msg'){
				
				handle_main_content(server,element);
				console.log("HERE");
				console.log(server+element+'Content');
				var mainContent = document.getElementById(server+element+'Content');
				console.log("Going to write in = " + server+element+'Content');
				var p = document.createElement('p');
				p.innerHTML = data[key];
				mainContent.appendChild(p);
			}
			else{
				//clea(element+'Content');
				//showTitle(key, server);
				console.log(server+element+'Content');
				handle_main_content(server,element);
				try{
					all = JSON.parse(all);
				}
				catch(e){
					//nothing
					console.log("SCRIPT: Can't parse");
				}
				//createTitle('Saved ' + element);
				console.log("SCRIPT: all length = " + all.length);
				if (all == null ||  all.length == 0){
					createItem('Nothing saved yet!', null, server,true, element);
					//window.alert("Nothing saved!");
			
				}else{
					console.log("SCRIPT: all mas de cero ");
					for (var l=0;l<all.length;l++){
						console.log("SCRIPT title: " + all[l].title);
						//var rowCell = document.createElement('tr');
						//var columnCell = document.createElement('td');
						createItem(all[l].title, all[l].url, server,false, element);
						/*var content = document.getElementById('content');
						var div = document.createElement('div');
						div.setAttribute('class','item');
						var p = document.createElement('p');
						p.setAttribute('id','title');
						p.innerHTML = element.title;
						div.appendChild(p);
						//document.insertBefore(image,p1);
						var a = document.createElement('a');
						a.setAttribute('href',element.url);
						a.innerHTML = element.url;
						div.appendChild(a),
						content.appendChild(div);*/
					}
				}
			}
		}catch(e){
			console.log("ERROR!!! " + e.toString());
			//window.alert('ERROR!');
		}
	}
	

});

self.port.on('takeAllTabs',function(allTabs){
	//showMainContent();
	var server = 'mysite';
	var element = 'tabs';
	var toClean = server+'synced'+element+'Content';
	//window.alert("To CLEAN " + toClean);
	//clean(toClean);
	showOnlyThis(server,element);
	//hideOthers(element);
	if (allTabs == null){
		console.log("TABSS NOT NULL!!!!");
		handle_main_content(server+'synced',element);
		//showTitle(element, server+'synced');
		//console.log("SCRIPT: bookmarks: Show title = " + server+element+'synced' );
		//createItem(title, url, server, nothing, element)
	     //createItem('Nothing synced yet!', null, server+'synced',true, element);	
	    var mainContent = document.getElementById(server+'synced'+element+'Content');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Saved yet!';
		mainContent.appendChild(p);
	}
	else{
		console.log("TABS NOT NULL");
		//showTitle(element, server+'synced');
		handle_main_content(server,element);
		//var thisTitle = document.getElementById(server+'synced'+element+'Title');
		/*thisTitle.addEventListener('click',function(event){
			var node = event.target;
			var nodeId = node.id;
			var thisContentId = nodeId.split('Title')[0]+'Content';	//mysitesyncedtabs, 
			var thisContent = document.getElementById(thisContentId);
			var thisContentClass = thisContent.className;
			var classSplitted = thisContentClass.split('content ')[1];
			if (thisContentClass == 'hidden'){
				thisContent.setAttribute('class','shown');
			}
			else{
				thisContent.setAttribute('class','hidden');
			}
		});*/
		var content = document.getElementById(server+'synced'+element+'Content');
		for (var j=0;j<allTabs.length;j++){
			//var deviceWrapper = document.createElement('DIV');
			//var aWrapper = document.createElement('DIV');
			//aWrapper.setAttribute('class','wrapper');
			var ul = document.createElement('ul');
			ul.setAttribute('class','device');
			//var div = document.createElement('div');
			//div.setAttribute('class','deviceName');
			var aTab = allTabs[j];
			try{
				var device = JSON.parse(aTab.device);
			}
			catch(e){
				var device = aTab.device;
			}

			var device_name = device.device_name;
			//var span = document.createElement('span');
			//span.setAttribute('class','imageOfDevice');
			//div.appendChild(span);
			var h3 = document.createElement('h3');
			var text = document.createTextNode('Tabs from ' + device_name);
			//div.setAttribute('class','hiding ');
			h3.appendChild(text);
			//div.setAttribute('data-role','collapsible');
			
			//div.appendChild(h5);
			ul.appendChild(h3);
			//div.attr('data-role','collapsible');
			//console.log("DIV CLASS = " + div.className);
			//console.log(div.innerHTML);
			ul.addEventListener('click',function(event){
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
			//aWrapper.appendChild(div);
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
				//document.insertBefore(image,p1);
				var a = document.createElement('a');
				a.setAttribute('href',url);
				a.innerHTML = url;
				a.setAttribute('class','url');
				tabDIV.appendChild(a);	
				ul.appendChild(tabDIV);
				//aWrapper.appendChild(tabDIV);	
	
		      }
		      content.appendChild(ul);
			
			
		
		}
		
	
	}
});
self.port.on('takeAllBookmarks',function(bookmarksToShow){
	/*https://cdn3.iconfinder.com/data/icons/block/32/sync-512.png*/
	//showMainContent();
	console.log("Show all bookmarks");
	var server = 'mysite';
	var element = 'bookmarks';
	var toClean = server+'synced'+element+'Content';
	console.log("SCRIPT: bookmarks to clean = " + toClean);
	//window.alert("To CLEAN " + toClean);
	clean(toClean);
	showOnlyThis(server,element);
	//hideOthers(element);
	if (bookmarksToShow == null){
		console.log("BOOKMARKS NOT NULL!!!!");
		handle_main_content(server+'synced',element);
		//showTitle(element, server+'synced');
		//console.log("SCRIPT: bookmarks: Show title = " + server+element+'synced' );
		//createItem(title, url, server, nothing, element)
		var mainContent = document.getElementById(server+'synced'+element+'Content');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Saved yet!';
		mainContent.appendChild(p);
	    // createItem('Nothing synced yet!', null, server+'synced',true, element);	
	}
	else{
		console.log("BOOKMARKS LENGTH = " + bookmarksToShow.length);
		//showTitle(element,server+'synced');
		handle_main_content(server+'synced',element);
		//var thisTitle = document.getElementById(server+'synced'+element+'Title');
		/*thisTitle.addEventListener('click',function(event){
			var node = event.target;
			var nodeId = node.id;
			var thisContentId = nodeId.split('Title')[0]+'Content';	//mysitesyncedtabs, 
			console.log(thisContentId);
			//var thisContent = document.getElementById(thisContentId);
			var thisContent = document.getElementById('mysitesyncedbookmarksContent');
			var thisContentClass = thisContent.className;
			var classSplitted = thisContentClass.split('content ')[1];
			if (thisContentClass == 'hidden'){
				thisContent.setAttribute('class','shown');
			}
			else{
				thisContent.setAttribute('class','hidden');
			}
		});*/
		//console.log(bookmarksToShow);
		for (var i=0;i<bookmarksToShow.length;i++){
		//var anItem = document.createElement('DIV');
		//anItem.setAttribute('class','item');
		var aBookmark = bookmarksToShow[i];
		console.log(aBookmark.device);
		var bookmarks = aBookmark.bookmarks;
		try{
			var device = JSON.parse(aBookmark.device);	
		}
		catch(e){
			var device = aBookmark.device;
		}
		var device_name = device.device_name;
		var device_id = device.device_id;
		console.log("********"+device_name+"********");
		var aDeviceUL = document.createElement('UL');
		aDeviceUL.setAttribute('class','device');
		//var div = document.createElement('div');
		//div.setAttribute('class','deviceName');
		var text = document.createTextNode(device_name);
		var h3 = document.createElement('h3');
		h3.appendChild(text);
		//div.appendChild(text);
		aDeviceUL.appendChild(h3);
		var bookmarksList = document.getElementById(server+'synced'+element+'Content');
		//anItem.appendChild(aDeviceUL);
		bookmarksList.appendChild(aDeviceUL);
		aDeviceUL.addEventListener('click',function(event){
			var node = event.target;
			var children = node.children;
			console.log(node.innerHTML);
			for (var k=0;k<children.length;k++){
				var child = children[k];
				var childClass = child.className;
				console.log('device: mychild = ' + child.nodeName);
				if (child.nodeName != 'HR' && child.nodeName != 'H3'){
					//console.log('device: mychild = ' + child.nodeName);
					console.log('device: mychild before = ' + child.className);
					if (childClass == 'hidden'){
						child.setAttribute('class','shown');
					}
					else{
						child.setAttribute('class','hidden');
					}
					console.log("my child after: " + child.className);
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
			console.log(device_name + " " + parentId + "  " + aBookmark.title)
			//console.log('takeABookmark received : ' + bookmarks[j].title);
			if (parentId == 0){
				console.log(device_name + " " + parentId + "  " + aBookmark.title)
				handle_children(aBookmark,bookmarkDiv,device_id);
			}
		}
		
		
		
	}	
	}
});

self.port.on('takeAllHistory',function(allHistory){
	//showMainContent();
	//console.log("HISTORY " + allHistory.length);
	var server = 'mysite';
	var element = 'history';
	var toClean = server+'synced'+element+'Content';
	//window.alert("To CLEAN " + toClean);
	clean(toClean);
	//hideOthers(element);
	//console.log(allHistory);
	var historyList = document.getElementById('mysitesyncedhistoryContent');
	//console.log("History length = " +  allHistory.length);
	//showTitle(element, server+'synced');
	showOnlyThis(server,element);
	if (allHistory == null){
		console.log("HISTORY NULL!!!!");
		handle_main_content(server+'synced',element);
		//showTitle(element, server+'synced');
		//createItem(title, url, server, nothing, element)
		var mainContent = document.getElementById(server+'synced'+element+'Content');
		var p = document.createElement('p');
		p.innerHTML = 'Nothing Saved yet!';
		mainContent.appendChild(p);
	    //createItem('Nothing synced yet!', null, server+'synced',true, element);	
	}
	else{
		//showTitle(element, server+'synced');
		console.log("HISTORY NOT NULL!!!!");
		handle_main_content(server+'synced',element);
		//var thisTitle = document.getElementById(server+'synced'+element+'Title');
		/*thisTitle.addEventListener('click',function(event){
			var node = event.target;
			var nodeId = node.id;
			var thisContentId = nodeId.split('Title')[0]+'Content';	//mysitesyncedtabs, 
			var thisContent = document.getElementById('mysitesyncedhistoryContent');
			//var thisContent = document.getElementById(thisContentId);
			var thisContentClass = thisContent.className;
			var classSplitted = thisContentClass.split('content ')[1];
			if (thisContentClass == 'hidden'){
				thisContent.setAttribute('class','shown');
			}
			else{
				thisContent.setAttribute('class','hidden');
			}
		});*/
		var content = document.getElementById(server+'synced'+element+'Content');
		for (var j=0;j<allHistory.length;j++){
			//var deviceWrapper = document.createElement('DIV');
			//var aWrapper = document.createElement('DIV');
			//aWrapper.setAttribute('class','wrapper');
			var ul = document.createElement('ul');
			
			ul.setAttribute('class','device');
			//var div = createElement('div');
			//div.setAttribute('class','deviceName');
			var aHistory = allHistory[j];
			try{
				var device = JSON.parse(aHistory.device);
			}
			catch(e){
				var device = aHistory.device;
			}
			var device_name = device.device_name;
			
			var text = document.createTextNode('History from ' + device_name);
			//div.setAttribute('class','deviceName');
			
			var h3 = document.createElement('h3');
			h3.appendChild(text);
			//div.appendChild(h3);
			ul.appendChild(h3);
			//div.setAttribute('data-role','collapsible');
			//div.attr('data-role','collapsible');
			ul.addEventListener('click',function(event){
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
			//aWrapper.appendChild(div);
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
				//document.insertBefore(image,p1);
				var a = document.createElement('a');
				a.setAttribute('class','url');
				a.setAttribute('href',url);
				a.innerHTML = url;
				historyDIV.appendChild(a);
				ul.appendChild(historyDIV);
				//aWrapper.appendChild(historyDIV);	
	
		      }
		      content.appendChild(ul);
			
			
		
		}
		console.log(content.innerHTML);
	}


});



/*********FUNCTIONS*********************************************/
function startUp(){
	var tabsCell = document.getElementById('tab');
	if (tabsCell){
		tabsCell.addEventListener('click',function(event){
			hideOptions();
			self.port.emit('showTabs',null);
		});
	}
	var bookmarksCell = document.getElementById('bookmark');
	if (bookmarksCell){
		bookmarksCell.addEventListener('click',function(event){
			console.log("Bookmark clicked!!");
			hideOptions();
			self.port.emit('showBookmarks',null);
		});
	}
	var historyCell = document.getElementById('history');
	if (historyCell){
		historyCell.addEventListener('click',function(event){
			hideOptions();
			self.port.emit('showHistory',null);
		});
	}
	var optionCell = document.getElementById('options');
	if (optionCell){
		optionCell.addEventListener('click',function(event){
			//self.port.emit('showOptions',null);
			showOptions();
		});
	}
	var share = document.getElementById('share');
	if (share){
		share.addEventListener('click',function(event){
			self.port.emit('share',null);
		
		});
	}
	var saveTabs = document.getElementById('saveTabs');
	if (saveTabs){
		saveTabs.addEventListener('click',function(event){
			self.port.emit('saveTabs',null);
		});
	}
	var help = document.getElementById('help');
	if (help){
		help.addEventListener('click',function(event){
			self.port.emit('help',null);
		});
	}

}


function hideOptions(){
	var optionsContent = document.getElementById('optionsContent');
	optionsContent.setAttribute('class','hidden');
	
}


function showOptions(){
	var optionsContent = document.getElementById('optionsContent');
	optionsContent.setAttribute('class','shown');
	//var mainContent = document.getElementById('mainContent');
	//mainContent.setAttribute('class','hidden');
}


function showTitle(element, server){
	var titleToShow = server+element+'Title';
	console.log("SCRIPT: titleToShow = " + titleToShow);
	var contentTitle = document.getElementById(titleToShow);			
	if (contentTitle){
		/*var hr = document.createElement('hr');
		contentTitle.appendChild(hr);
		var textNode = document.createTextNode(title);
		contentTitle.appendChild(textNode);
		var hr1 = document.createElement('hr');
		contentTitle.appendChild(hr1);*/
		var thisClass = contentTitle.className;
		//window.alert(thisClass);
		if (thisClass == 'title hidden'){
			var newClass = 'title shown';
			contentTitle.setAttribute('class',newClass);
		}
		var thisClass = contentTitle.className;
		//window.alert(thisClass);
	}
}

function createLi(title,url,parent){
	var div = document.createElement('div');
	div.setAttribute('class','item');
	var p = document.createElement('p');
	p.setAttribute('id','title');
	p.innerHTML = title;
	div.appendChild(p);
	//document.insertBefore(image,p1);
	var a = document.createElement('a');
	a.setAttribute('class','url');
	a.setAttribute('href',url);
	a.innerHTML = url;
	div.appendChild(a);		
	
	parent.appendChild(div);


}


function createItem(title, url, server, nothing, element){
	//var theServer = server+'Content';
	var toPutIn = server+element+'Content';
	console.log("\t\t SCRIPT: CreateItem = To put in = " + toPutIn);
	var content = document.getElementById(toPutIn);
	var div = document.createElement('div');
	div.setAttribute('class','item');
	var p = document.createElement('p');
	p.setAttribute('id','title');
	p.innerHTML = title;
	div.appendChild(p);
	if (!nothing){
		//document.insertBefore(image,p1);
		var a = document.createElement('a');
		a.setAttribute('href',url);
		a.innerHTML = url;
		div.appendChild(a);		
	}
	content.appendChild(div);
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

function handle_event(event){
	console.log("I was clicked!!  " + event.target.nodeName);
	var whatWasClicked = event.target;
	if (whatWasClicked.nodeName == 'UL'){ //Only when a folder is clicked
		console.log(whatWasClicked.children);
		var ULChildren = event.target.children;	//The third child is the LI elements
			console.log(ULChildren);
			if (ULChildren != undefined){
				for (var i=0;i<ULChildren.length;i++){
					console.log(i+" ULChildren = " + ULChildren[i].nodeName);
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
		console.log("I am a root folder!!!!");
		console.log("My parent is = " + parent.nodeName + '  ' + parent.className );
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
			console.log("Create title!!!! "+aBookmark.title);
			var bookmarkText = document.createTextNode(aBookmark.title);
			bookmarkUL.appendChild(bookmarkText);
			var line = document.createElement('hr');
			bookmarkUL.appendChild(line);
			var favQuery = "http://www.gettyicons.com/free-icons/103/pretty-office-2/png/256/folder_256.png";
			bookmarkUL.style.background = "url('"+favQuery+"') no-repeat left top";
			bookmarkUL.style.backgroundSize = "15px 15px";
			bookmarkUL.style.margin = '0px';
			bookmarkUL.style.padding = '0px 0px 0px 20px';	//Modify only the space between the icon and the title.
			
			console.log("Add event Listener to " + aBookmark.title);
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
			bookmarkLI.style.listStyleImage = "url('"+favQuery+"') no-repeat left top";
			bookmarkLI.style.margin = '0px';
			/*Padding = Top, Right, Left, Bottom.*/
			bookmarkLI.style.padding = '0px 0px 0px 5px';	//Modify only the space between the icon and the title.
			parent.appendChild(bookmarkLI);
			
				
			}
		//}
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
	urlA.setAttribute('class','url');
	urlA.setAttribute('href',url);
	urlA.innerHTML = url;
	urlA.setAttribute('class','url');
	urlP.appendChild(urlA);
	div.appendChild(urlP);
	
	//Make the line and add it to the div.
	/*var line = document.createElement('hr');
	line.setAttribute('class','liLine');
	div.appendChild(line);*/
	
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

function handle_main_content(server,element){
		console.log("Clean = " + server+element+'Content');
		clean(server+element+'Content');
		if (element == 'tabs'){
				var toHide = document.getElementById('bookmarksContent');
				toHide.setAttribute('class','hidden');
				var toHide = document.getElementById('historyContent');
				toHide.setAttribute('class','hidden');
				console.log("\t\t\t\t Show " + server+element+'Content');
				var toShow = document.getElementById('tabsContent');
				toShow.setAttribute('class','shown');
				
		}
		else if(element == 'bookmarks'){
				var toHide = document.getElementById('tabsContent');
				toHide.setAttribute('class','hidden');
				var toHide = document.getElementById('historyContent');
				toHide.setAttribute('class','hidden');
				console.log("\t\t\t\t Show " + server+element+'Content');
				var toShow = document.getElementById('bookmarksContent');
				toShow.setAttribute('class','shown');
		}
		else if(element == 'history'){
				var toHide = document.getElementById('bookmarksContent');
				toHide.setAttribute('class','hidden');
				var toHide = document.getElementById('tabsContent');
				toHide.setAttribute('class','hidden');
				console.log("\t\t\t\t Show " + server+element+'Content');
				var toShow = document.getElementById('historyContent');
				toShow.setAttribute('class','shown');
		}
		//console.log("CLEANED AND SHOWING");
	
	
}

function showOnlyThis(server,element){
		console.log("\t\t\t\t Show Only " + element+'Of'+server);
		var toShow = document.getElementById(element+'Of'+server);
		toShow.setAttribute('class','shown');

}





