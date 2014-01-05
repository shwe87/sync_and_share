/*Writes a message by a dynamic way! The add-on tells this content script to write a message in the panel*/
self.port.on('write',function(messageInfo){
	var messageContainer = document.getElementById('messageContainer');
	if (messageContainer != null){
		var message = document.getElementById('message');
		//First remove the message already existing:
		clean(message);
		var text = document.createTextNode(messageInfo.msg);
		message.appendChild(text);
		message.setAttribute('class',messageInfo.type);	
	}


});

function clean(node){
	while(node.firstChild){
		node.removeChild(node.firstChild);
	}
	
}
