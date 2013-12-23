function show(nodeToHide){
	var thisClass = nodeToHide.getAttribute('class');
	//var thisClass = nodeToHide.className;
	var splitted = thisClass.split(' ');
	//alert(splitted);
	if (splitted.length == 2){
		if (splitted[1] == 'hidden'){
			var newClass = splitted[0]+' '+'shown';
			nodeToHide.setAttribute('class',newClass); 
		}
	}
	else{
		if (splitted[0] == 'hidden'){
			nodeToHide.setAttribute('class','shown');
		}
	
	}


}


function hide(nodeToShow){
	//var nodeToShow = document.getElementById(nodeId);
	var thisClass = nodeToShow.getAttribute('class');
	var splitted = thisClass.split(' ');
	//alert(splitted);
	if (splitted.length == 2){
		if (splitted[1] == 'shown'){
			var newClass = splitted[0]+' '+'hidden';
			nodeToShow.setAttribute('class',newClass); 
		}
	}
	else{
		if (splitted[0] == 'shown'){
			nodeToShow.setAttribute('class','hidden');
		}
	
	}

}

function showOrHide(event){
	var node = event.target;
	var children = node.children;
	//alert(children.length);
	for (var i=0;i<children.length;i++){
		//alert(children[i].innerHTML);
		var thisClass = children[i].className;
		if (thisClass == 'hidden'){
			children[i].setAttribute('class','shown');
			node.setAttribute('class','showing');
		}
		else if (thisClass == 'shown'){
			children[i].setAttribute('class','hidden');
			node.setAttribute('class','hiding');
		}
		/*thisClass = thisClass.split(' ');
		//alert(thisClass);
		if (thisClass.length > 1){
			if (thisClass[1] == 'hidden'){
				children[i].setAttribute('class',thisClass[0]+' shown');
			}
			else if (thisClass[1] == 'shown'){
				children[i].setAttribute('class', thisClass[0]+' shown' );
			}
		}*/
	}

}

function showOrHideTree(event){
	//alert(event.target.nodeName+" clicked");
	var node = event.target;
	var children = node.children;
	
	//alert(children.length);
	//var thisOne = -1;
	for (var i=0;i<children.length;i++){
		//alert(children[i].innerHTML);
		//alert(children[0].innerHTML);
		var thisClass = children[i].className;
		thisClass = thisClass.split(' ');
		//alert(thisClass);
		//alert(thisClass);
		if (thisClass.length > 1){
			if (thisClass[1] == 'hidden'){
				children[i].setAttribute('class',thisClass[0]+' shown');
				thisOne = i;
			}
			/*else if (thisClass[1] == 'shown'){
				children[0].setAttribute('class', thisClass[0]+' hidden' );
			}*/
		}
			
	}

	


}




const FRIENDS_EMAIL = 'friendsEmail';
const CREATE_GROUP = 'createGroup';
const EXISTING_GROUP = 'existingGroup';

function handleSelect(node){
	var value = node.value;
	var friendsEmail = document.getElementById(FRIENDS_EMAIL);
	var createGroup = document.getElementById(CREATE_GROUP);
	var existingGroup = document.getElementById(EXISTING_GROUP);
	if (value == '1'){
		//With person: friendsEmail
		show(friendsEmail);
		hide(createGroup);
		hide(existingGroup);
	}
	else if(value == '2'){
		show(friendsEmail);
		show(createGroup);
		hide(existingGroup);
	
	}
	else if (value == '3'){
		hide(friendsEmail);
		hide(createGroup);
		show(existingGroup);
		
	
	}


}



var selectOption = document.getElementById('selectTypeWhom');
if (selectOption){
	handleSelect(selectOption);
	selectOption.addEventListener('change',function(event){
		//alert(event.target.value);
		//var value = event.target.value;
		handleSelect(event.target);
	});
}



var groupUL = document.getElementsByClassName('groupName');
if (groupUL){
	for (var i=0;i<groupUL.length;i++){
		groupUL[i].addEventListener('click',function(event){
			var checkbox = event.target;
			var UL = checkbox.parentNode;	
			var children = UL.children;
			for (var j=0;j<children.length;j++){
				if (children[j].nodeName == 'LI'){
					var LI = children[j];
					if (checkbox.checked){
						show(LI);
					}
					else{
						hide(LI);
					}
				}
			}

		});
	}
}

function deleteANode(nodeToDelete,Id){
	var parent = nodeToDelete.parentNode.parentNode;
	//alert("DELETE " + parent.nodeName);
    	var children = parent.children;
    	for (var i=0;i<children.length;i++){
    	//	alert("DELETE " + children[i].nodeName);
        	if (children[i].id == Id){
        		parent.removeChild(children[i]);
        	}

    	}
    	var children = parent.children;	//Have to check is there is nothing left in this table.
    	//If there is nothing left in the sync, then have to refresh this page.
    	alert(children.length);
    	if (children.length == 0){
    		//alert("Nothing!");
    		location.reload();
    	}

}


function del(event){
	//alert(uniqueId);
	var parent = event.target.parentNode.parentNode;
	alert(parent.nodeName);
	var children = parent.children;
	//alert(children.length);
	for (var i=0;i<children.length;i++){
		
		if (children[i].nodeName == "LABEL"){
			//alert(children[i].children.length);
			//var uniqueId = children[i].value;
			alert(children[i].nodeName);
			var labelChildren = children[i].children;
			for (var j=0;j<labelChildren.length;j++){
				if (labelChildren[j].nodeName == 'INPUT'){
					alert("Hello");
					var uniqueId = labelChildren[j].getAttribute('value');
					//alert(uniqueId);
					//xmlhttp.open("POST","ajax_test.asp",true);
//xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
//xmlhttp.send("fname=Henry&lname=Ford");
					var req = new XMLHttpRequest();
					req.onreadystatechange = function() {
	       					//alert(req.responseText);
	       					if (req.responseText == 'OK'){
	       						//alert(children[i].nodeName);
	       						deleteANode(event.target.parentNode,uniqueId);
	       					}
	       					else{
	       						event.target.innerHTML = "Not found. Refresh the page!"
	       					}
	    					
					}
					url = '/delete/sync/'; //+ encodeURIComponent(uniqueId);
					req.open('POST',url,false);
					req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
					var params = 'unique=' + encodeURIComponent(uniqueId);
					var params = params.replace(/%20/g, '+')
					req.send(params);
					
				}
			}
		}
	}
	
}

function delSharedFromContent(event, shareId, toDeleteId){
	
	//alert(shareId);
	//var parentOfParent = parent.parentNode;
	//var children = parentOfParent.children;
	//for (var i=0;i<children.length;i++){
		/*if (children[i].innerHTML == event.target){
			alert(event.target.nodeName);
		}*/
	//}
	//var typeOf = 'shared_from_content'
	//alert(typeOf);
	//alert( uniqueId);
	//alert(event.target.parentNode.parentNode.parentNode.getAttribute('value'));
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	       			//alert(req.responseText);
		if (req.status == '200'){
			var parent = event.target.parentNode.parentNode.parentNode;
	       		alert(parent.nodeName);
	       		if (parent.nodeName == 'DIV'){
	       			parent.setAttribute('class','hidden');
	       		}
	       		//Check if the parent node has anything left:
	       		var mainParent = document.getElementById('sharedFrom');
	       		var ifHide = true;
	       		var children = mainParent.children;
	       		for (var i=0;i<children.length;i++){
	       			alert(children[i].className)
	       			if (children[i].className != 'hidden'){
	       				ifHide = false;
	       			}
	       		}
	       		if (ifHide){
	       			var shareFromTitle = document.getElementById('shareFromTitle');
	       			shareFromTitle.setAttribute('class','hidden');
	       		}
	       		//alert("OK");
	       		//var node = document.getElementById(toDeleteId);
	       		//var parent = node.parentNode;
	       		//parent.setAttribute('class','hidden');
	       		//alert(parent.nodeName)
	       		//alert(node.nodeName + ' ' + node.innerHTML);
			//alert(parent.nodeName);
			/*var children = parent.children;
			for (var i=0;i<children.length;i++){
				parent.removeChild(children[i]);
			}
			parent.setAttribute('class','hidden');*/
	       			
	       	}
	       	else{
	       		//alert("Something went wrong!!!!! " + req.status);
	       			//event.target.innerHTML = "Not found. Refresh the page!"
	       	}
	    					
	}
	url = '/delete/share/from/content/'; //+ encodeURIComponent(uniqueId);
	req.open('POST',url,false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	var params = 'shareId=' + encodeURIComponent(shareId);
	params = params + '&toDeleteId=' + encodeURIComponent(toDeleteId);
	//params = params + 'typeOf=' + encodeURIComponent(typeOf);
	var params = params.replace(/%20/g, '+')
	req.send(params);	
}


/*function delShareFromUser(event, shareId, f_email, syncId){
	
	//alert(f_email)
	//var parentOfParent = parent.parentNode;
	//var children = parentOfParent.children;
	//for (var i=0;i<children.length;i++){
		/*if (children[i].innerHTML == event.target){
			alert(event.target.nodeName);
		}*/
	//}
	//var typeOf = 'shared_from_content'
	//alert(typeOf);
	//alert( uniqueId);
	//alert(event.target.parentNode.parentNode.parentNode.getAttribute('value'));
/*	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	       			//alert(req.responseText);
		if (req.status == '200'){
	       		//alert("OK");
	       		var parent = event.target.parentNode;
	       		//alert(parent.nodeName);
	       		var previousSibling = parent.previousSibling;
	       		alert(previousSibling.innerHTML);
	       		/*var parent = event.target.parentNode.parentNode.parentNode;
			//alert(parent.nodeName);
			var children = parent.children;
			for (var i=0;i<children.length;i++){
				parent.removeChild(children[i]);
			}
			parent.setAttribute('class','hidden');*/
	       			
/*	       	}
	       	else{
	       		//alert("Something went wrong!!!!! " + req.status);
	       			//event.target.innerHTML = "Not found. Refresh the page!"
	       	}
	    					
	}
	url = '/delete/share/from/user/'; //+ encodeURIComponent(uniqueId);
	req.open('POST',url,false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	var params = 'shareId=' + encodeURIComponent(shareId);
	params = params + '&friends_email=' +  encodeURIComponent(f_email);
	//params = params + 'typeOf=' + encodeURIComponent(typeOf);
	var params = params.replace(/%20/g, '+')
	req.send(params);	
}*/

function delFromGroup(event, groupId){
	
	
	
	//alert(shareId);
	//var parentOfParent = parent.parentNode;
	//var children = parentOfParent.children;
	//for (var i=0;i<children.length;i++){
		/*if (children[i].innerHTML == event.target){
			alert(event.target.nodeName);
		}*/
	//}
	//var typeOf = 'shared_from_content'
	//alert(typeOf);
	//alert( uniqueId);
	//alert(event.target.parentNode.parentNode.parentNode.getAttribute('value'));
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	       			//alert(req.responseText);
		if (req.status == '200'){
			var node = document.getElementById(groupId);
			var parent = node.parentNode;
			parent.setAttribute('class','hidden');
			var sharedGroup = document.getElementById('sharedGroup');
			var children = sharedGroup.children;
			var ifHide = true;
		for (var i=0;i<children.length;i++){
		       	alert(children[i].className)
		       	if (children[i].className != 'hidden'){
		       		ifHide = false;
		       	}
		}
		if (ifHide){
		       	var groupTitle = document.getElementById('groupTitle');
		       	groupTitle.setAttribute('class','hidden');
		}
		       			
		       	}
		       	else{
		       		//alert("Something went wrong!!!!! " + req.status);
		       			//event.target.innerHTML = "Not found. Refresh the page!"
		       	}
	    					
	}
	url = '/delete/from/group/'; //+ encodeURIComponent(uniqueId);
	req.open('POST',url,false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	var params = 'groupId=' + encodeURIComponent(groupId);
	//params = params + '&toDeleteId=' + encodeURIComponent(toDeleteId);
	//params = params + 'typeOf=' + encodeURIComponent(typeOf);
	var params = params.replace(/%20/g, '+')
	req.send(params);	
}

function delSharedWith(event, shareId, toDeleteId, typeOf){
	//alert(shareId);
	//alert(typeOf);
	
	//alert(shareId);
	//var parentOfParent = parent.parentNode;
	//var children = parentOfParent.children;
	//for (var i=0;i<children.length;i++){
		/*if (children[i].innerHTML == event.target){
			alert(event.target.nodeName);
		}*/
	//}
	//var typeOf = 'shared_from_content'
	//alert(typeOf);
	//alert( uniqueId);
	//alert(event.target.parentNode.parentNode.parentNode.getAttribute('value'));
	var req = new XMLHttpRequest();
	req.onreadystatechange = function() {
	       			//alert(req.responseText);
		if (req.status == '200'){
				var node = document.getElementById(toDeleteId);
	       		//Check if the parent node has anything left:
	       		var mainParent = document.getElementById('sharedFrom');
	       		var ifHide = true;
	       		var children = mainParent.children;
	       		for (var i=0;i<children.length;i++){
	       			//alert(children[i].className)
	       			if (children[i].className != 'hidden'){
	       				ifHide = false;
	       			}
	       		}
	       		if (ifHide){
	       			var shareFromTitle = document.getElementById('shareFromTitle');
	       			shareFromTitle.setAttribute('class','hidden');
	       		}
	       		//alert("OK");
	       		var node = document.getElementById(toDeleteId);
	       		node.setAttribute('class','hidden');
	       		var parent = document.getElementById('autoSynced'+typeOf);
	       		var children = parent.children;
	       		alert(children.length);
	       		var allHidden = true; //All is hidden
	       		for (var j=0;j<children.length;j++){
						alert(children[j].nodeName);
						var thisClass = children[j].className;
						if (thisClass != 'hidden'){
								allHidden = false;
								break;
						}
				}
				if (allHidden == true){
						parent.setAttribute('class','hidden');
						var parentTitle = document.getElementById('autoSynced'+typeOf+'Title');
						parentTitle.setAttribute('class','hidden'); 
				}
	       		//var parent = node.parentNode;
	       		//parent.setAttribute('class','hidden');
	       		//alert(parent.nodeName)
	       		//alert(node.nodeName + ' ' + node.innerHTML);
			//alert(parent.nodeName);
			/*var children = parent.children;
			for (var i=0;i<children.length;i++){
				parent.removeChild(children[i]);
			}
			parent.setAttribute('class','hidden');*/
	       			
	       	}
	       	else{
	       		//alert("Something went wrong!!!!! " + req.status);
	       			//event.target.innerHTML = "Not found. Refresh the page!"
	       	}
	    					
	}
	url = '/delete/share/with/'; //+ encodeURIComponent(uniqueId);
	req.open('POST',url,false);
	req.setRequestHeader("Content-type","application/x-www-form-urlencoded");
	var params = 'shareId=' + encodeURIComponent(shareId);
	params = params + '&toDeleteId=' + encodeURIComponent(toDeleteId);
	params = params + '&typeOf=' + encodeURIComponent(typeOf);
	var params = params.replace(/%20/g, '+')
	req.send(params);	
}








