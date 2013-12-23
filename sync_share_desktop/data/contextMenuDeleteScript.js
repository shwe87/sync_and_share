self.on('click',function(node,data){
	//The node is a LI object and the LI object has a DIV with the title and the url
	//console.log('Script context:  '+'Context clicked ' + node.className);
	var allChildren = node.children;
	/*<div class="savedItem">
	 * 	<p class="title">
	 * 	   <span class="imageHolder"> <img src="images/serverLogo.png"/></span> 
	 *     Title
	 * </p>
	 * <p class="url">
	 * 	<a href="sfsdf">
	 *  href
	 * </a>
	 * </p>
	 * </div>*/
	var nodeToSend = new Object();
	nodeToSend.className = node.className;	//Will be bookmark or history.
	for each(var child in allChildren){
		console.log("Script delete: " + child.className + " , " + child.nodeName);
		/*console.log('Script context:  '+'Context className ' + child.className);
		console.log('SCRIPT CONTEXT: ' + 'nodeName: ' + child.nodeName);
		if (child.nodeName == 'P'){
				var moreChild = child.children;
				for(var j=0;j<moreChild.length;j++){
					console.log('SCRIPT CONTEXT: ' + 'nodeName: ' + moreChild[j].className);
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
		}*/
		
	}
});
