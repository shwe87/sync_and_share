/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to show messages in a panel.	Learnt to do this from:											|
 * https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/event-targets.html					|
 ************************************************************************************************************************/
var { Class } = require("sdk/core/heritage");
var panel = require("sdk/panel");
var data = require("sdk/self").data;
const timer = require('sdk/timers');
var { emit, on, once, off } = require("sdk/event/core");
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};




var Panel = Class({
	
  initialize: function initialize() {
  	this.panelWithMessage = panel.Panel({
  		width: 400,
  		height: 60,
  		focus: true,
    		contentURL: data.url('panel.html'),
    		contentScriptFile: data.url('panelScript.js')
    	});

    	
  },
  type: 'Panel',
  write: function write(message) {
  	this.panelWithMessage.port.emit('write',message);

  },
  hide: function hide(){
  	if (this.panelWithMessage.isShowing){
  		this.panelWithMessage.port.emit('hidden',true);
  		this.panelWithMessage.hide();
  	}
  },
  show: function show(){
	var showOptions = {'position':{'top':150}};
	this.panelWithMessage.show(showOptions);
	this.panelWithMessage.port.emit('showing',true)

  }
  
});

exports.Panel = Panel;




