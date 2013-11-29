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
	//console.log(JSON.stringify(elementsToShow));
	//First clean the table, delete the previous items that were showing:
	//clean('mainContent');
	//var tabsTable = document.getElementById('tabsTable');

	var data = toShow.data;
	var element = toShow.element;
	var server = toShow.server;
	var toClean = server+element+'Content';
	window.alert("To CLEAN " + toClean);
	clean(toClean);
	if (data == null){
	        showTitle(element, server);
	        createItem('Nothing saved yet!', null, server,true, element);
	}
	else{
		var key = Object.keys(data);
		try{
			var all = data[key];
			/*if (key == 'tabs'){	
				creTitle('Saved Tabs');	
			}else if (key == 'bookmarks'){
				createTitle('Saved Bookmarks');
			}else if (key == 'history'){
				createTitle('Saved History');
			}*/
			window.alert(key);
			showTitle(key, server);
			//createTitle('Saved ' + element);
			if (all.length == 0){
				createItem('Nothing saved yet!', null, server,true, element);
				window.alert("Nothing saved!");
		
			}else{
				for each (var e in all){
					//var rowCell = document.createElement('tr');
					//var columnCell = document.createElement('td');
					createItem(e.title, e.url, server,false, element);
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
			//console.log("ERROR!!!");
			window.alert('ERROR!');
		}
	}
	

});


/*********FUNCTIONS*********************************************/
function startUp(){
	var tabsCell = document.getElementById('tab');
	tabsCell.addEventListener('click',function(event){
		self.port.emit('showTabs',null);
	});
	
	var bookmarksCell = document.getElementById('bookmark');
	bookmarksCell.addEventListener('click',function(event){
		self.port.emit('showBookmarks',null);
	});
	var historyCell = document.getElementById('history');
	historyCell.addEventListener('click',function(event){
		self.port.emit('showHistory',null);
	});

}

function showTitle(element, server){
	var titleToShow = server+element+'Title';
	var contentTitle = document.getElementById(titleToShow);			
	if (contentTitle){
		/*var hr = document.createElement('hr');
		contentTitle.appendChild(hr);
		var textNode = document.createTextNode(title);
		contentTitle.appendChild(textNode);
		var hr1 = document.createElement('hr');
		contentTitle.appendChild(hr1);*/
		var thisClass = contentTitle.className;
		window.alert(thisClass);
		if (thisClass == 'title hidden'){
			var newClass = 'title shown';
			contentTitle.setAttribute('class',newClass);
		}
		var thisClass = contentTitle.className;
		window.alert(thisClass);
	}
}


function createItem(title, url, server, nothing, element){
	//var theServer = server+'Content';
	var toPutIn = server+element+'Content';
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




