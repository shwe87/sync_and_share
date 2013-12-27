/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module opens the tabs to share and the tab to view the shared items												|																					
 ************************************************************************************************************************/
/*This module opens the tabs to share and the tab to view the shared items.*/
/**********************************************SDK Modules*************************************************************/
var tabs = require("sdk/tabs");
/**********************************************My Modules*************************************************************/
var constants = require('./constants');
const SHARE_URL = constants.SHARE_URL;
const VIEW_SHARE = constants.VIEW_SHARE;
/*********************************************************************************************************************/

/************************************************************************************************************************
@function openShare: Opens a tab with the share options
*************************************************************************************************************************/
function openShare(){
	tabs.open(SHARE_URL);
}

exports.openShare = openShare;
/************************************************************************************************************************
@function openShare: Opens a tab to view the shared items.
*************************************************************************************************************************/
function viewShare(){
	tabs.open(VIEW_SHARE);
}
exports.viewShare = viewShare;


