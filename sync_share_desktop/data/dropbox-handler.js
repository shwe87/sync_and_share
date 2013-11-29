var code = document.getElementsByClassName('auth-code')[0];
if (code != null){
	self.port.emit('takeCode',code.innerHTML);
	//console.log(code.value);
}


self.port.on('signedIn',function(msg){
	document.body.innerHTML = msg;
	self.port.emit('closeTab','close');
});

self.on("detach", function() {
  	window.close();
});
