/*This content script gets the code that Google Drive gives when the user gives the authorization for this app to write in this app's file.*/
var code = document.getElementById('code');
if (code != null){
	self.port.emit('takeCode',code.value);
}


self.port.on('signedIn',function(msg){
	//document.body.innerHTML = msg;
	self.port.emit('closeTab','close');
});

self.on("detach", function() {
  	//window.close();
});
