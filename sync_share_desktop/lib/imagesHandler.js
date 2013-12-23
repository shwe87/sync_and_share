const data = require('sdk/self').data;


function createOne(id,url,width,height){
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
