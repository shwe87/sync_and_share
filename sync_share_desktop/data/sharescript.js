var PLUS_SIGN = 'http://i42.tinypic.com/2q2n295.jpg';

function showOrHideTitle(element){
	var whatToShow = element.typeOf+'Title';
	console.log("What to show = " + whatToShow);
	var get = document.getElementById(whatToShow);
	var toShowClass = get.className;
	console.log("To show class " + toShowClass);
	var thisClass = toShowClass.split('hidden');	//If it is hidden then the array will be of length 2.
	console.log("This class " + thisClass);
	if (thisClass.length == 2){
		get.setAttribute('class','title shown'); 
	}


}

self.port.on('readyForm',function(listOfElements){
	//console.log("From script = " + JSON.stringify(listOfElements));
	//console.log("An element = " + listOfElements[0].url);
	for each (var e in listOfElements){
		showOrHideTitle(e);
		var chooseFrom = document.getElementById('chooseFrom');
		var where = 'choose'+e.typeOf;
		var choose = document.getElementById(where);
		var div = document.createElement('div');
		div.setAttribute('class','item');
		var inputCheckbox = document.createElement('INPUT');
		inputCheckbox.setAttribute('class',e.typeOf);
		inputCheckbox.setAttribute('type','CHECKBOX');
		inputCheckbox.setAttribute('value',e.url);
		inputCheckbox.setAttribute('name',e.title);
		//inputCheckbox.setAttribute('class','');		
		div.appendChild(inputCheckbox);
		var a = document.createElement('A');
		a.setAttribute('href',e.url);
		a.innerHTML = e.title;
		//var title = document.createTextNode(e.title);
		div.appendChild(a);		
		choose.appendChild(div);
	}
	var form = document.getElementById('theForm');
	form.addEventListener('submit',function(event){
		var elements = event.target.elements;
		//var checkboxList = [];
		var emailsList = new Array();
		var chosenElements = new Array();
		for (var i=0;i<elements.length;i++){
			if (elements[i].type == 'checkbox'){
				if (elements[i].checked){
					console.log(elements[i].innerHTML + " was checked!!!");
					var aux = new Object();
					aux.url = elements[i].value;
					aux.title = elements[i].name;
					aux.typeOf = elements[i].className;
					chosenElements.push(aux);
					console.log("Chosen elements = " + JSON.stringify(chosenElements));
				}
			}
			else if (elements[i].type == 'email'){
				var aux = new Object();
				aux.email = elements[i].value
				emailsList.push(aux);
				console.log("Emails = " + JSON.stringify(emailsList));
			}
		}
		var toSend = new Object();
		toSend['share_with'] = emailsList;
		toSend['share_data'] = chosenElements; 
		console.log("Chosen elements = " + JSON.stringify(toSend));
		//console.log("Emails = " + JSON.stringify(emailsList));
	});
});



