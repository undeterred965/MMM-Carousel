Module.register("MMM-Carousel", {
	defaults: {
		moduleInterval: 20,		// In seconds.
		transitionTime: 400,		// In milliseconds.
		sleepTransitionTime: 5000,	// In milliseconds.
		wakeTransitionTime: 1000,	// In milliseconds.
		modulesBeforeSleep: 60,		//  Number of modules to be displayed before sleeping.
	},

	getHeader: function() {},

	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = "";
		return wrapper;
	},

	start: function() {
		var self = this;
		self.wakeRotations = 0;
		self.sleeping = false;
		self.currentModule = "clock";
		self.timerId = setTimeout(function() {self.rotateLoop();},self.config.moduleInterval*1000);
	},

	rotateLoop: function() {
		var self = this;
		let oldModule = self.currentModule;
		let newModule = "";
		if (self.sleeping === true) return;
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
		if (newModule === "clock") self.sendNotification("CHANGE_BACKGROUND_IMAGE");
		self.wakeRotations += 1;
		if (self.wakeRotations === self.config.modulesBeforeSleep) {
			self.sleepCarousel();
		} else {
			self.timerId = setTimeout(function() {self.rotateLoop();},self.config.moduleInterval*1000);
		}
	},
	
	sleepCarousel: function() {
		var self = this;
		self.sleeping = true;
		MM.getModules().exceptModule(self).enumerate(function(module) {
			if (module.name !== "MMM-Touch") {
				module.hide(self.config.sleepTransitionTime, {lockString: "Carousel"});
			}
		});
		Log.info("Going to Sleep says Carousel.");
		setTimeout(function() {self.sendSocketNotification("TURN_DISPLAY_OFF");},self.config.sleepTransitionTime+2000);
	},

	hideShowModules: function(moduleToHide, moduleToShow) {
		var self = this;
		let modules = MM.getModules().exceptModule(self);
		modules.enumerate(function(module) {
			if (module.name === moduleToHide)
				module.hide(self.config.transitionTime,function() {self.showModule(moduleToShow);}, {lockString: "Carousel"});
		});
	},

	showModule: function(moduleToShow) {
		var self = this;
		let modules = MM.getModules().exceptModule(self);
		modules.enumerate(function(module) {
			if (module.name === moduleToShow)
				module.show(self.config.transitionTime, {lockString: "Carousel"});
		});
	},

	notificationReceived: function(notification, payload, sender) {
		var self = this;
		let name = "";
		if (notification === 'DOM_OBJECTS_CREATED') {
			MM.getModules().exceptModule(self).enumerate(function(module) {
				name = module.name;
				if ((name!=="clock")&&(name!=="alert")&&(name!=="MMM-RandomPhoto")) {
					module.hide(0, {lockString: "Carousel"});
				}
			});
		}
		if (notification === "WAKE_UP") {
			if (self.sleeping === true) {
				MM.getModules().exceptModule(self).enumerate(function(module) {
					name = module.name;
					if ((name==="clock")||(name==="alert")||(name==="MMM-RandomPhoto")) {
						module.show(self.config.wakeTransitionTime, {lockString: "Carousel"});
					}
				});
				self.sleeping = false;
				self.sendSocketNotification("TURN_DISPLAY_ON");
				Log.info("Waking up says Carousel.");
				self.start();
			} else {
				let oldModule = self.currentModule;
				let newModule = "clock";
				clearTimeout(self.timerId);
				Log.info("Return to clock received.");
				self.hideShowModules(oldModule, newModule);
				self.currentModule = "clock";
				self.wakeRotations = 0;
				self.sendNotification("CHANGE_BACKGROUND_IMAGE");
				self.timerId = setTimeout(function() {self.rotateLoop();},self.config.moduleInterval*1000);
			}
		}

	},

});
