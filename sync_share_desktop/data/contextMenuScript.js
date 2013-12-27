/*Script used to get the datas to be able to save the item which was clicked.*/
self.on('click',function(node,data){
	//The node is a LI object and the LI object has a DIV with the title and the url
	var allChildren = node.children;
	var nodeToSend = new Object();
	nodeToSend.className = node.className;	//Will be bookmark or history.
	for each(var child in allChildren){
		if (child.nodeName == 'P'){
				var moreChild = child.children;
				for(var j=0;j<moreChild.length;j++){
					if(moreChild[j].className == 'url'){
							nodeToSend.url = moreChild[j].innerHTML;
							self.postMessage(nodeToSend);
							break;
					}
				}
		}
		if (child.className == 'title'){
			nodeToSend.title = child.innerHTML;
		}
		if (child.className == 'url'){
			nodeToSend.url = child.innerHTML;
			self.postMessage(nodeToSend);
			break;
		}
		
	}
});
				
