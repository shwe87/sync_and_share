var panel = require("sdk/panel");
var data = require("sdk/self").data;
var widget = require("sdk/widget");
const timer = require('sdk/timers');
const { myId } = require("sdk/self");
var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};

const images = require('./imagesHandler.js');



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
