var email = document.getElementById('browserid-info');
if (email != null){
	var useremail = email.getAttribute('data-user-email');
	if (useremail != null){
		if (useremail != ""){
			var splitted = useremail.split('@');
			if (splitted.length > 1){
				//console.log("Logged in with = " + useremail);
				self.port.emit('takeEmail',useremail);
			}
		}
	}
}	


