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





/*TABS_ICON = http://i43.tinypic.com/2z4jvkk.jpg*/
//As soon as the page loads, create the effect in the main table:

/*
<body>
<center>
<div class="logo">
<center><img src="http://i43.tinypic.com/2lka2s2.jpg" title="logo by Shweta"/><br>
<span class="small">Sync & Share</span>
</center>

</div>
</div>
<nav class="menu">
	<ul>
		<li id="tab"><div id="tabCell" onClick="alert('Hello')">Tabs</div></li>
		<br><br>
		<li id="bookmark"><div id="bookmarkCell" onClick="alert('Hello')">Bookmarks</div></li>
		<br><br>
		<li id="history"><div id="historyCell" onClick="alert('Hello')">History</div></li><br><br>
	</ul>
</nav>

</center>
<div id="contentTitle"><hr>Saved Tabs:<hr></div>
<div id="content">
  <div class="item">
  <p id="title">A title</p>
  <a href="http://www.urjc.es">www.urjc.es</a>
  </div>
<div class="item">
  <p id="title">A title</p>
  <a href="http://www.urjc.es">www.urjc.es</a>
  </div>
<div class="item">
  <p id="title">A title</p>
  <a href="http://www.urjc.es">www.urjc.es</a>
  </div>
<div class="item">
  <p id="title">A title</p>
  <a href="http://www.urjc.es">www.urjc.es</a>
  </div>

</div>
*/


startUp();
//Show the saved tabs. Display the elements in the content.
self.port.on('show',function(toShow){
	console.log("To show!!!");
	//console.log(JSON.stringify(elementsToShow));
	//First clean the table, delete the previous items that were showing:
	//clean('mainContent');
	//var tabsTable = document.getElementById('tabsTable');
	showMainContent();
	var data = toShow.data;
	var element = toShow.element;
	var server = toShow.server;
	var toClean = server+element+'Content';
	console.log("SHOW " + JSON.stringify(toShow));
	//window.alert("To CLEAN " + toClean);
	clean(toClean);
	if (data == null){
	        showTitle(element, server);
	        createItem('Nothing saved yet!', null, server,true, element);
	}
	else{
		var key = Object.keys(data);
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
			showTitle(key, server);
			try{
				all = JSON.parse(all);
			}
			catch(e){
				//nothing
				console.log("SCRIPT: Can't parse");
			}
			//createTitle('Saved ' + element);
			console.log("SCRIPT: all length = " + all.length);
			if (all.length == 0){
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
		}catch(e){
			console.log("ERROR!!!");
			//window.alert('ERROR!');
		}
	}
	

});

self.port.on('takeAllTabs',function(allTabs){
	showMainContent();
	var server = 'mysite';
	var element = 'tabs';
	var toClean = server+'synced'+element+'Content';
	//window.alert("To CLEAN " + toClean);
	clean(toClean);
	//hideOthers(element);
	if (allTabs == null){
		showTitle(element, server+'synced');
		//createItem(title, url, server, nothing, element)
	        createItem('Nothing synced yet!', null, server+'synced',true, element);	
	}
	else{
		showTitle(element, server+'synced');
		var thisTitle = document.getElementById(server+'synced'+element+'Title');
		thisTitle.addEventListener('click',function(event){
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
		});
		var content = document.getElementById(server+'synced'+element+'Content');
		for (var j=0;j<allTabs.length;j++){
			//var deviceWrapper = document.createElement('DIV');
			var aWrapper = document.createElement('DIV');
			aWrapper.setAttribute('class','wrapper');
			var div = document.createElement('DIV');
			
			var aTab = allTabs[j];
			try{
				var device = JSON.parse(aTab.device);
			}
			catch(e){
				var device = aTab.device;
			}
			var device_name = device.device_name;
			var text = document.createTextNode('Tabs from ' + device_name);
			div.setAttribute('class','deviceName');
			div.appendChild(text);
			div.addEventListener('click',function(event){
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
			aWrapper.appendChild(div);
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
				tabDIV.appendChild(a);	
				aWrapper.appendChild(tabDIV);	
	
		      }
		      content.appendChild(aWrapper);
			
			
		
		}
		
	
	}
});
self.port.on('takeAllBookmarks',function(bookmarksToShow){
	/*https://cdn3.iconfinder.com/data/icons/block/32/sync-512.png*/
	showMainContent();
	console.log("Show all bookmarks");
	var server = 'mysite';
	var element = 'bookmarks';
	var toClean = server+'synced'+element+'Content';
	console.log("SCRIPT: bookmarks to clean = " + toClean);
	//window.alert("To CLEAN " + toClean);
	clean(toClean);
	//hideOthers(element);
	if (bookmarksToShow == null){
		showTitle(element, server+'synced');
		//console.log("SCRIPT: bookmarks: Show title = " + server+element+'synced' );
		//createItem(title, url, server, nothing, element)
	        createItem('Nothing synced yet!', null, server+'synced',true, element);	
	}
	else{
		showTitle(element,server+'synced');
		var thisTitle = document.getElementById(server+'synced'+element+'Title');
		thisTitle.addEventListener('click',function(event){
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
		});
		//console.log(bookmarksToShow);
		for (var i=0;i<bookmarksToShow.length;i++){
			var anItem = document.createElement('DIV');
			anItem.setAttribute('class','wrapper');
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
			//console.log("********"+device_name+"********");
			var aDeviceUL = document.createElement('UL');
			aDeviceUL.setAttribute('class','item');
			var text = document.createTextNode('Bookmarks from ' + device_name);
			aDeviceUL.appendChild(text);
			var bookmarksList = document.getElementById('mysitesyncedbookmarksContent');
			anItem.appendChild(aDeviceUL);
			bookmarksList.appendChild(anItem);
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
		
			for (var j=0;j<bookmarks.length;j++){
				var ifFolder = bookmarks[j].ifFolder;
				var aBookmark = bookmarks[j];
				var parentId = bookmarks[j].parentId;
				console.log(device_name + " " + parentId + "  " + aBookmark.title)
				//console.log('takeABookmark received : ' + bookmarks[j].title);
				if (parentId == 0){
					console.log(device_name + " " + parentId + "  " + aBookmark.title)
					handle_children(aBookmark,aDeviceUL,device_id);
				}
			}
		
		
		
		}	
	}
});

self.port.on('takeAllHistory',function(allHistory){
	showMainContent();
	console.log("HISTORY " + allHistory.length);
	var server = 'mysite';
	var element = 'history';
	var toClean = server+'synced'+element+'Content';
	//window.alert("To CLEAN " + toClean);
	clean(toClean);
	//hideOthers(element);
	//console.log(allHistory);
	var historyList = document.getElementById('mysitesyncedhistoryContent');
	//console.log("History length = " +  allHistory.length);
	showTitle(element, server+'synced');
	if (allHistory.length == 0 || allHistory == null){
		showTitle(element, server+'synced');
		//createItem(title, url, server, nothing, element)
	        createItem('Nothing synced yet!', null, server+'synced',true, element);	
	}
	else{
		showTitle(element, server+'synced');
		var thisTitle = document.getElementById(server+'synced'+element+'Title');
		thisTitle.addEventListener('click',function(event){
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
		});
		var content = document.getElementById(server+'synced'+element+'Content');
		for (var j=0;j<allHistory.length;j++){
			//var deviceWrapper = document.createElement('DIV');
			var aWrapper = document.createElement('DIV');
			aWrapper.setAttribute('class','wrapper');
			var div = document.createElement('DIV');
			
			var aHistory = allHistory[j];
			try{
				var device = JSON.parse(aHistory.device);
			}
			catch(e){
				var device = aHistory.device;
			}
			var device_name = device.device_name;
			var text = document.createTextNode('History from ' + device_name);
			div.setAttribute('class','deviceName');
			div.appendChild(text);
			div.addEventListener('click',function(event){
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
			aWrapper.appendChild(div);
			var history = aHistory.history;
			for (var i=0;i<history.length;i++){
				var historyDIV = document.createElement('DIV');
				historyDIV.setAttribute('class','item hidden');
				var title = history[i].title;
				var url = history[i].url;
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
				historyDIV.appendChild(p);
				//document.insertBefore(image,p1);
				var a = document.createElement('a');
				a.setAttribute('href',url);
				a.innerHTML = url;
				historyDIV.appendChild(a);	
				aWrapper.appendChild(historyDIV);	
	
		      }
		      content.appendChild(aWrapper);
			
			
		
		}
	}


});



/*********FUNCTIONS*********************************************/
function startUp(){
	var tabsCell = document.getElementById('tab');
	if (tabsCell){
		tabsCell.addEventListener('click',function(event){
			self.port.emit('showTabs',null);
		});
	}
	var bookmarksCell = document.getElementById('bookmark');
	if (bookmarksCell){
		bookmarksCell.addEventListener('click',function(event){
			self.port.emit('showBookmarks',null);
		});
	}
	var historyCell = document.getElementById('history');
	if (historyCell){
		historyCell.addEventListener('click',function(event){
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

}


function showMainContent(){
	var optionsContent = document.getElementById('optionsContent');
	optionsContent.setAttribute('class','hidden');
	var mainContent = document.getElementById('mainContent');
	mainContent.setAttribute('class','shown');
}


function showOptions(){
	var optionsContent = document.getElementById('optionsContent');
	optionsContent.setAttribute('class','shown');
	var mainContent = document.getElementById('mainContent');
	mainContent.setAttribute('class','hidden');
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
	a.setAttribute('href',url);
	a.innerHTML = url;
	div.appendChild(a);		
	
	parent.appendChild(div);


}


function createItem(title, url, server, nothing, element){
	//var theServer = server+'Content';
	var toPutIn = server+element+'Content';
	console.log("SCRIPT: To put in = " + toPutIn);
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
		//console.log(whatWasClicked.children);
		var ULChildren = event.target.children;	//The third child is the LI elements
			//console.log(ULChildren);
			if (ULChildren != undefined){
				for (var i=0;i<ULChildren.length;i++){
					//console.log(i+" ULChildren = " + ULChildren[i].innerHTML);
					if (ULChildren[i].className == 'hidden'){
						ULChildren[i].setAttribute('class','showLi');
					}
					else if(ULChildren[i].className == 'showLi'){
						ULChildren[i].setAttribute('class','hidden');
					}
				}
			}
	}


}


function handle_children(aBookmark,parentNode,device_name){
	var ifFolder = aBookmark.ifFolder;
	var parentId = aBookmark.parentId;
	if (parentNode != null){
		//One of the root folders
		var parent = parentNode;
	}
	else{
		var parent = document.getElementById(parentId+device_name);
	}
	
	var item = document.getElementById(aBookmark.itemId+device_name);
	if (!item){
		if (ifFolder){
			var children = aBookmark.children;
			//console.log("Add " + aBookmark.title + " as folder!");
			//var aDiv = document.createElement('div');
			var bookmarkUL = document.createElement('ul');
			bookmarkUL.setAttribute('id',aBookmark.itemId+device_name);
			bookmarkUL.setAttribute('class','hidden');
			//bookmarkUL.setAttribute('class','title');
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
				//bookmarkUL.addEventListener('click',clickEnter(handle_event),true);
			}
			parent.appendChild(bookmarkUL);
			if (children){
			
				for (var j=0;j<children.length;j++){
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
				//bookmarkLI.setAttribute('class','hidden');
			}
			var liDiv = document.createElement('DIV');
			var title = aBookmark.title;
			var url = aBookmark.url;
			//Make the title and add it to the div
			var titleSpan = document.createElement('span');
			titleSpan.setAttribute('class','title');
			titleSpan.innerHTML = title;
			liDiv.appendChild(titleSpan);
	
			//Make the url and add it to the div
			var urlP = document.createElement('p');
			var urlA = document.createElement('a');
			urlA.setAttribute('href',url);
			urlA.innerHTML = url;
			urlA.setAttribute('class','url');
			urlP.appendChild(urlA);
			liDiv.appendChild(urlP);
	
			//Make the line and add it to the div.
			var line = document.createElement('hr');
			line.setAttribute('class','liLine');
			liDiv.appendChild(line);
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






