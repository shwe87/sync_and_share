/***********************************************************************************************************************
 * Author: Shweta, Telecommunication Engineering student of UNIVERSIDAD REY JUAN CARLOS, Madrid, Spain.					|
 * Still in development. This add-on is my career's final project work.													|
 * This module was created to test and show that the method mentioned in :												|
 * https://addons.mozilla.org/en-US/developers/docs/sdk/latest/modules/sdk/page-mod.html#PageMod%28options%29			|
 * also works, to display images.																						|
 ************************************************************************************************************************/

/**********************************************SDK Modules*************************************************************/
const data = require('sdk/self').data;
/**********************************************************************************************************************/

function createOne(id,url,width,height){
	//Create a background of a div with the image to show in the help page
	var one = "div#"+id+"{ background:url("+url+") no-repeat;"+
				"background-size: contain;"+
				"height:"+height+"px;"+
				"width:"+width+"px;}";
	return one;

}
const settingsFoto = createOne('settingsFoto',data.url('images/settings.png'),'480','280');
const addonFoto = createOne('addonFoto',data.url('images/add-on.png'),'700','250');
const preferencesFoto = createOne('preferencesFoto',data.url('images/preferences.png'),'600','300');
const all = settingsFoto + addonFoto + preferencesFoto;
exports.all = all;

const logo = createOne('logo',data.url('images/myLogo.png','158','94'));
exports.logo = logo;
