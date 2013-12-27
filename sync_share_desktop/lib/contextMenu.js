/*Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.
 * Still in development. This add-on is my career's final project work.
 * 
 * This module was created to add context menus to the "My Synced Items" page (myPage.html).
 * */

/**********************************************SDK Modules*************************************************************/
var cm = require("sdk/context-menu");
var data = require("sdk/self").data;
var { emit, on, once, off } = require("sdk/event/core");
/***********************************************************************************************************************/
exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};

/************************************************************************************************************************
@function addContextMenu: Add a context menu:
* @param {String} toLabel: How to label the context menu?.
* @return {context-menu} myContextMenu: Return the created context menu.
* MORE INFO: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/context-menu.html
*************************************************************************************************************************/
function addContextMenu(toLabel){
	//Create the context menu
	var myContextMenu = cm.Item({
		label: toLabel,
		//Add the context menu only if the following are true:
		context: [cm.SelectorContext("div.tab,div.history,div.bookmark"), cm.URLContext(data.url('myPage.html'))],
		//Attach a javascript file to it: javascript will tell us when the user clicked this item.
		contentScriptFile: data.url('contextMenuScript.js'),
		onMessage: function(clickedNode){
			//When the context menu is clicked, tell main about it,so it can handle it
			emit(exports, 'contextClicked', clickedNode);
		}
	});
	return myContextMenu;
}

/************************************************************************************************************************
@function addDeleteMenu: Add a context menu:
* @param {String} toLabel: How to label the context menu?.
* @return {context-menu} myContextMenu: Return the created context menu.
* MORE INFO: https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/context-menu.html
*************************************************************************************************************************/
function addDeleteMenu(toLabel){
	//Create the context menu
	var myContextMenu = cm.Item({
		label: toLabel,
		//Add the context menu only if the following are true:
		context: [cm.SelectorContext("div.savedItem"), cm.URLContext(data.url('myPage.html'))],
		//Attach a javascript file to it: javascript will tell us when the user clicked this item.
		contentScriptFile: data.url('contextMenuDeleteScript.js'),
		onMessage: function(nodeToDelete){
			//When the context menu is clicked, tell main about it,so it can handle it
			emit(exports, 'deleteContextClicked', nodeToDelete);
		}
	});
	return myContextMenu;

}
exports.addDeleteMenu = addDeleteMenu;
exports.addContextMenu = addContextMenu;
