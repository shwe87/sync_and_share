/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to show a panel with the quickStart.html content. When a usr clicks the widget located		|
 * in the add-on bar, this panel opens. Learnt from:																	|
 * https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/panel.html									|																					
 ************************************************************************************************************************/
var panel = require("sdk/panel");
var data = require("sdk/self").data;
var widget = require("sdk/widget");
const timer = require('sdk/timers');
const { myId } = require("sdk/self");


const images = require('./imagesHandler');

function startUp(){
		var helpPanel = panel.Panel({
		  width: 600,
		  height: 550,
		  contentURL : data.url('quickStart.html'),
		  contentScriptFile: [data.url("jquery-1.4.4.min.js"),data.url('quickStartScript.js')]
		});

		var helpWidget = widget.Widget({
		  id: myId+"help",
		  label: "Quick Start",
		  contentURL: data.url('images/myLogo64.png'),
		  panel: helpPanel
		});
		helpPanel.port.on("click", function(url) {
			require("sdk/tabs").open(url);
		});

	
	
}

exports.startUp = startUp;
