var cm = require("sdk/context-menu");
var data = require("sdk/self").data;
var { emit, on, once, off } = require("sdk/event/core");

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


function addContextMenu(toLabel, aContextMenu){
	//if (aContextMenu == undefined || aContextMenu == null){
		var myContextMenu = cm.Item({
			label: toLabel,
			context: [cm.SelectorContext("div.tab,div.history,div.bookmark"), cm.URLContext(data.url('myPage.html'))],
			contentScriptFile: data.url('contextMenuScript.js'),
			onMessage: function(clickedNode){
				emit(exports, 'contextClicked', [clickedNode, toLabel]);
			}
		});
		return myContextMenu;
	//}
	/*	else{
		aContextMenu.remove(aContextMenu.context);
		aContextMenu.add(toLabel);
		return aContextMenu;	
	}*/
}

exports.addContextMenu = addContextMenu;
