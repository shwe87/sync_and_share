/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * 																														|
 * This module was created to add my own cookies to save that the user is signed in and if not then there will be		|
 * no cookie																											|
 ********************************************************************************************************************** |*/																													

/**********************************************SDK Modules*************************************************************/
var {Cc, Ci} = require("chrome");
var ios = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
var cookieSvc = Cc["@mozilla.org/cookieService;1"].getService(Ci.nsICookieService);
var cookieMgr2 = Cc["@mozilla.org/cookiemanager;1"].getService(Ci.nsICookieManager2);
/***********************************************************************************************************************/
              
/**********************************************************************
@function setCookie- set cookie string for the given url.
@param {string} url - the url for which the cookies is going to be set.
@param {string} cookieString- the string value for the cookie to be set.
***********************************************************************/                 
exports.setCookie = function(url, cookieString){
	var cookieUri = ios.newURI(url, null, null);	//A valid URI
	cookieSvc.setCookieString(cookieUri, null, cookieString, null);
}


/**********************************************************************
@function getCookie - get the cookie string for the provided url
@param {string} url - the cookie string will be searched for thie url.
@return cookie {Array} - returns the array containing the string of
cookie for the given url.
***********************************************************************/
exports.getCookies = function(url){
	var listOfCookies = [];	//The list of all the read cookies.
	var cookies = cookieMgr2.getCookiesFromHost(url);
	for (var e = cookies; e.hasMoreElements();) {
		var cookie = e.getNext().QueryInterface(Ci.nsICookie); 
		listOfCookies.push(cookie); 
	}
	return listOfCookies;
}
