Module.register("MMM-Carousel", {
	defaults: {
		moduleInterval: 15,		// In seconds.
		transitionTime: 200,		// In milliseconds.
		sleepTransitionTime: 5000,	// In milliseconds.
		wakeTransitionTime: 750,	// In milliseconds.
	},

	getHeader: function() {},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = "";
		return wrapper;
	},

	start: function() {
		var self = this;
		self.sleep = false;
		self.cancelOneTimer = false;
		self.currentModule = "clock";
		setTimeout(function() {self.rotateLoop();},self.config.moduleInterval*1000);
	},

	rotateLoop: function() {
		var self = this;
		if (self.sleep === true) return;
		if (self.cancelOneTimer === true) {
			self.cancelOneTimer = false;
			return;
		}
		var oldModule = self.currentModule;
		var newModule = "";
		switch (oldModule) {
			case "clock":
				newModule = "currentweather";
				break;
			case "currentweather":
				newModule = "weatherforecast";
				break;
			case "weatherforecast":
				newModule = "MMM-DailyBibleVerse";
				break;
			case "MMM-DailyBibleVerse":
				newModule = "clock";
				break;
			default:
				newModule = "clock";
				break;
		}
		self.hideShowModules(oldModule,newModule);
		self.currentModule = newModule;
		if (self.sleep === true) {
			return;
		} else {
			setTimeout(function() {self.rotateLoop();},self.config.moduleInterval*1000);
		}
	},

	hideShowModules: function(moduleToHide, moduleToShow) {
		var self = this;
		var modules = MM.getModules().exceptModule(self);
		modules.enumerate(function(module) {
			if (module.name === moduleToHide)
				module.hide(self.config.transitionTime,function() {self.showModule(moduleToShow);}, {lockString: "Carousel"});
		});
	},

	showModule: function(moduleToShow) {
		var self = this;
		var modules = MM.getModules().exceptModule(self);
		modules.enumerate(function(module) {
			if (module.name === moduleToShow)
				module.show(self.config.transitionTime, {lockString: "Carousel"});
		});
	},

	notificationReceived: function(notification, payload, sender) {
		var self = this;
		var name = "";
		if (notification === 'DOM_OBJECTS_CREATED') {
			MM.getModules().exceptModule(self).enumerate(function(module) {
				name = module.name;
				if ((name!=="clock")&&(name!=="alert")&&(name!=="updatenotification")&&(name!=="MMM-RandomPhoto")) {
					module.hide(0, {lockString: "Carousel"});
				}
			});
		} else if (notification === "GO_TO_SLEEP") {
			self.sleep = true;
			MM.getModules().exceptModule(self).enumerate(function(module) {
				if ((module.name !== "MMM-CarouselSleep")&&(module.name!=="MMM-Touch")) {
					module.hide(self.config.sleepTransitionTime, {lockString: "Carousel"});
				}
			});
			Log.info("Going to Sleep says Carousel.");
			setTimeout(function() {self.sendSocketNotification("TURN_DISPLAY_OFF");},self.config.sleepTransitionTime+2000);
		} else if ((notification === "WAKE_UP")&&(self.sleep === true)) {
			MM.getModules().exceptModule(self).enumerate(function(module) {
				name = module.name;
				if ((name==="clock")||(name==="alert")||(name==="updatenotification")||(name==="MMM-RandomPhoto")) {
					module.show(self.config.wakeTransitionTime, {lockString: "Carousel"});
				}
			});
			self.sleep = false;
			self.sendSocketNotification("TURN_DISPLAY_ON");
			Log.info("Waking up says Carousel.");
			self.start();
		} else if ((notification === "WAKE_UP")&&(self.sleep === false)) {
			Log.info("Return to clock received.");
			var oldModule = self.currentModule;
			var newModule = "clock";
			self.hideShowModules(oldModule, newModule);
			self.currentModule = "clock";
			self.cancelOneTimer = true;
			setTimeout(function() {self.rotateLoop();},self.config.moduleInterval*1000);
		}

	},

});
