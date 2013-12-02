function show(nodeId){
	var nodeToHide = document.getElementById(nodeId);
	var thisClass = nodeToHide.getAttribute('class');
	var splitted = thisClass.split(' ');
	//alert(splitted);
	if (splitted[1] == 'hidden' || splitted[0] == 'hidden'){
		var newClass = splitted[0]+' '+'shown';
		nodeToHide.setAttribute('class',newClass); 
	}


}


function hide(nodeId){
	var nodeToShow = document.getElementById(nodeId);
	var thisClass = nodeToShow.getAttribute('class');
	var splitted = thisClass.split(' ');
	//alert(splitted);
	if (splitted[1] == 'shown'){
		var newClass = splitted[0]+' '+'hidden';
		nodeToShow.setAttribute('class',newClass); 
	}

}

const FRIENDS_EMAIL = 'friendsEmail';
const CREATE_GROUP = 'createGroup';
const EXISTING_GROUP = 'existingGroup';

var selectOption = document.getElementById('selectTypeWhom');
selectOption.addEventListener('change',function(event){
	//alert(event.target.value);
	var value = event.target.value;
	if (value == '1'){
		//With person: friendsEmail
		show(FRIENDS_EMAIL);
		hide(CREATE_GROUP);
		hide(EXISTING_GROUP);
	}
	else if(value == '2'){
		show(FRIENDS_EMAIL);
		show(CREATE_GROUP);
		hide(EXISTING_GROUP);
	
	}
	else if (value == '3'){
		hide(FRIENDS_EMAIL);
		hide(CREATE_GROUP);
		show(EXISTING_GROUP);
		
	
	}
});
