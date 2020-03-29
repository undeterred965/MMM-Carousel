var exec = require('child_process').exec

var NodeHelper = require("node_helper");
module.exports = NodeHelper.create({
	socketNotificationReceived: function(notification, payload) {
		if (notification === "TURN_DISPLAY_OFF") {
			exec("echo 1 | sudo tee /sys/class/backlight/rpi_backlight/bl_power",(error,stdout,stderr)=>{});
		} else if (notification === "TURN_DISPLAY_ON") {
			exec("echo 0 | sudo tee /sys/class/backlight/rpi_backlight/bl_power",(error,stdout,stderr)=>{});
		}
	},
});
