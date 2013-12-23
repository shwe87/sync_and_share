function decodeEntities(s){
	/*Have to convert the html characters to normal strings to compare*/
    var str, temp= document.createElement('p');
    temp.innerHTML= s;
    str= temp.textContent || temp.innerText;
    temp=null;
    return str;
}

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
	var nodeToDelete = new Object();
	var parent = node.parentNode;
	console.log("PARENT ID = " + parent.id);
	var element = parent.id;
	element = element.split('show')[1];
	console.log("ELEMENT = " + element);
	nodeToDelete.element = element;
	for each(var child in allChildren){
		console.log("Script delete: " + child.className + " , " + child.nodeName);
		if (child.className == 'title'){
			//Know the server:
			var thisChild = child.children;
			for (var j=0;j<thisChild.length;j++){
					if (thisChild[j].className == 'serverLogo'){
						var src = thisChild[j].getAttribute('src');
						var splitted = src.split('/')[1];
						var server = splitted.split('.png')[0];
						nodeToDelete.server = server;
					}
			}
				
		}
		else if (child.className == 'url'){
				var thisChild = child.children;
				for (var k=0;k<thisChild.length;k++){
						if (thisChild[k].className == 'urlContainer'){
								var toDelete = thisChild[k].innerHTML;
								toDelete = decodeEntities(toDelete);
								nodeToDelete.url = toDelete;
						}
				}
		}
		
	}
	self.postMessage(nodeToDelete);
});
