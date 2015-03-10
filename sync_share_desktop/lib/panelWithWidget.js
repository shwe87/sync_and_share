/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to show a panel with the quickStart.html content. When a usr clicks the widget located		|
 * in the add-on bar, this panel opens. Learnt from:																	|
 * https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/panel.html									|																					
 ************************************************************************************************************************/
var panel = require("sdk/panel");
var data = require("sdk/self").data;
var {ToggleButton} = require("sdk/ui/button/toggle");
const timer = require('sdk/timers');
const { myId } = require("sdk/self");


const images = require('./imagesHandler');

function startUp(){
		var helpPanel = panel.Panel({
		  width: 600,
		  height: 550,
		  contentURL : data.url('quickStart.html'),
		  contentScriptFile: [data.url("jquery-1.4.4.min.js"),data.url('quickStartScript.js')],
		  onHide: handleHide
		});

		var button = ToggleButton({
		  id: myId+"help",
		  label: "Quick Start",
		  icon: data.url('images/myLogo64.png'),
		  onChange: handleChange
		  //panel: helpPanel
		});
		
		//When the button changes:
		function handleChange(state){
			if(state.checked){
				helpPanel.show({
					position:button
				});
			}
		}

		//Tell the panel to hide:
		function handleHide(){
			button.state("window",{checked: false});
		}
		helpPanel.port.on("click", function(url) {
			console.log("Show tab!");
			require("sdk/tabs").open(url);
		});

	
	
}

exports.startUp = startUp;
