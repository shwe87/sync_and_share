var tabs = require("sdk/tabs");
var constants = require('./constants.js');
var { emit, on, once, off } = require("sdk/event/core");

exports.on = on.bind(null, exports);
exports.once = once.bind(null, exports);
exports.removeListener = function removeListener(type, listener) {
  off(exports, type, listener);
};


const SHARE_URL = constants.SHARE_URL;
const VIEW_SHARE = constants.VIEW_SHARE;


function openShare(){
	tabs.open(SHARE_URL);
}

exports.openShare = openShare;

function viewShare(){
	tabs.open(VIEW_SHARE);
}
exports.viewShare = viewShare;


