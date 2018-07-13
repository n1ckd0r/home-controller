var utils = require('./utils');
var util = require('util');
var events = require('events');
var debug = require('debug')('home-controller:insteon:microonoffclose');

function MicroOnOff(id, insteon) {
  this.id = id;
  this.insteon = insteon;
}

util.inherits(MicroOnOff, events.EventEmitter);

MicroOnOff.prototype.turnOn = function () {
  return this.insteon.directCommand(this.id, '11', 'FF');
};

MicroOnOff.prototype.turnOff = function () {
  return this.insteon.directCommand(this.id, '14', 'FF');
};

MicroOnOff.prototype.toggle = function () {
	return this.insteon.directCommand(this.id, '21', 'FF');
}

module.exports = MicroOnOff;