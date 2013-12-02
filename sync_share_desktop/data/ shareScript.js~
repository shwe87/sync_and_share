var PLUS_SIGN = 'http://i42.tinypic.com/2q2n295.jpg';


self.port.on('readyForm',function(listOfElements){
	for (var i=0;i<listOfElements.length;i++){
		var chooseFrom = document.getElementById('chooseFrom');
		var where = 'choose'+listOfElements[i].typeOf;
		var choose = document.getElementById(where);
		var inputCheckbox = document.createElement('INPUT');
		inputCheckbox.setAttribute('type','CHECKBOX');
		inputCheckbox.setAttribute('value',listOfElements[i].url);
		inputCheckbox.innerHTML = listOfElements[i].title;
		choose.appendChild(inputCheckbox);
	}
	var form = document.getElementById('theForm');
	form.addEventListener('submit',function(event){
		var elements = event.target.elements;
		var checkboxList = [];
		var emailsList = [];
		var chosenElements = [];
		for (var i=0;i<elements.length;i++){
			if (elements[i].type == 'checkbox'){
				//checkboxList.push(e);
				if (elements[i].checked){
					chosenElements.push(elements[i]);
				}
			}
			else if (elements[i].type == 'email'){
				emailsList.push(elements[i]);
			}
		}
	});
});



