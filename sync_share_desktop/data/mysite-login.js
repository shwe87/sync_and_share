/*This script is to let the add-on that the use has logged in into the django server!*/
var email = document.getElementById('browserid-info');
if (email != null){
	var useremail = email.getAttribute('data-user-email');
	if (useremail != null){
		if (useremail != ""){
			var splitted = useremail.split('@');
			if (splitted.length > 1){
				//console.log("Logged in with = " + useremail);
				console.log("MY SITE SCRIPT: " + useremail);
				self.port.emit('takeEmail',useremail);
			}
		}
	}
}	


