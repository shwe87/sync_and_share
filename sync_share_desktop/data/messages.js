/*<div style="border:1px dotted black;padding:2em;">TEXT_HERE</div>*/

self.port.on('alreadySaved',function(message){
	
	/*var div = document.createElement('div');
	div.setAttribute('style','border:1px solid green;padding:2em;');
	var text = document.createTextNode(message);
	div.appendChild(text);
	if (body.childNodes.length == 0){
		console.log("There is none!!");
	}
	else{
		console.log("ChildNodes = " + body.childNodes.length);
	}
	document.insertBefore(div, body.childNodes[0]);*/
	/*
	<body>
    	<div id="wrapper">
        Piece of text inside a 500px width div centered on the page
    </div>
</body>*/
	var msg = 'These tabs are already saved : \n';
	for each (var title in message){
		msg = msg + title + "\n";	
	}
	alert(msg);


	/*
	var body = document.body || document.getElementsByTagName('body')[0];
	var firstDiv = document.createElement('div');
	firstDiv.setAttribute('id','message-wrapper');
	//firstDiv.style.zIndex = "100";
	firstDiv.style.position = "fixed";
    	firstDiv.style.top = "0px";
    	firstDiv.style.width = "100%";
    	firstDiv.style.padding = "6px"
    	//firstDiv.style.boxShadow = "0px -1px 2px rgba(0, 0, 0, 0.2)";
    	firstDiv.style.backgroundColor = "#D2EBD7";

	var div = document.createElement('div');
	div.setAttribute('id','wrapper');
	div.style.backgroundColor= "#D2EBD7";
	//div.style.background = "none repeat scroll 0% 0% #D2EBD7";
	div.style.margin = "0px auto";
	div.style.textAlign =  "center";
	div.style.width =  "980px";
	div.style.position = "fixed";
	
		
	var p = document.createElement('p');
	var text = document.createTextNode(message);
	p.style.fontFamily = "Open Sans, sans-serif";
	p.style.color = "#333333";
	p.style.fontWeight = "600";
	p.appendChild(text);
	div.appendChild(p);
	firstDiv.appendChild(div);
	
	
	//body.appendChild(firstDiv);
	body.insertBefore(firstDiv,body.childNodes[1]);*/

});


self.port.on('savedCompletely',function(message){

	alert(message);


});




self.port.on('authenticated',function(message){
	console.log("Authenticated!!\r\n\r\n");

	alert(message);
});
