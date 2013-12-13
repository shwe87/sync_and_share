var { Class } = require("sdk/core/heritage");

var panel = require("sdk/panel");
var data = require("sdk/self").data;
var widget = require("sdk/widget");
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
 
  	//this.panelWithMessage.show();
  },
  hide: function hide(){
  	if (this.panelWithMessage.isShowing){
  		//console.log("FRom hiding = " + this.showing);
  		this.panelWithMessage.port.emit('hidden',true);
  		this.panelWithMessage.hide();
  		//
  		/*this.showing = false;
  		this.hidden = true;*/
  	}
  },
  show: function show(){
  	console.log(this.showing);
	/*
        this.showing = true;
        this.hidden = false;*/
        ;
	var showOptions = {'position':{'top':150}};
	this.panelWithMessage.show(showOptions);
	this.panelWithMessage.port.emit('showing',true)

  }
  
});

exports.Panel = Panel;




