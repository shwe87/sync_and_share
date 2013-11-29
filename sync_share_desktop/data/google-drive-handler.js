var code = document.getElementById('code');
if (code != null){
	self.port.emit('takeCode',code.value);
	//console.log(code.value);
}


self.port.on('signedIn',function(msg){
	document.body.innerHTML = msg;
	//tab.close();
	self.port.emit('closeTab','close');
});

self.on("detach", function() {
  	window.close();
});
