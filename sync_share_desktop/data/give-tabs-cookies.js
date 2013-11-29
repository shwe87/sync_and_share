self.port.on('giveCookies',function(id){
	//console.log("GOT TAB ID!!!");
	var cookieInfo = document.cookie.split(";");
	// At last we push the tab's id, to know later on who's cookies is it.
	cookieInfo.push(id);
	//console.log("Cookie INFO " + cookieInfo);
	self.port.emit('takeCookies',cookieInfo);
});
