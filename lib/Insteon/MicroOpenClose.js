var utils = require('./utils');
var debug = require('debug')('home-controller:insteon:microopenclose');

function MicroOpenClose(id, insteon) {
  this.id = id;
  this.insteon = insteon;
}

util.inherits(MicroOpenClose, events.EventEmitter);

MicroOpenClose.prototype.open = function () {
  return this.insteon.directCommand(this.id, '11', 'FF');
};

MicroOpenClose.prototype.close = function () {
  return this.insteon.directCommand(this.id, '14', 'FF');
};

MicroOpenClose.prototype.toggle = function () {
	var insteon = this.insteon;
	var deviceId = this.id;
	this.insteon.directCommand(this.id, '19', '00').then(function(status) {
		debug("MicroOpenClose response " + status);
		if(!status || !status.response || !status.response.standard)
		{
			debug("No response for status command");
		}

		if(status.response.standard.command2 == "00")
		{
			debug("Window is closed, opening");
			return insteon.directCommand(deviceId, '11', 'FF');
		}
		else(status.response.standard.command2 == "ff")
		{
			debug("Window is opened, closing");
			return insteon.directCommand(deviceId, '14', 'FF');
		}
		});
}

module.exports = MicroOpenClose;
