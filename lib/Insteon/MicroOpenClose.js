var utils = require('./utils');
var util = require('util');
var events = require('events');
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

MicroOpenClose.prototype.handleAllLinkBroadcast = function(group, cmd1, cmd2)
{
	debug('Emitting BC command for device (%s) - group: %s, cmd1: %s, cmd2: %s', this.id, group, cmd1, cmd2);
  	this.emit('command', group, cmd1, cmd2);

  	switch(cmd1) {
  		case '04':
		    var level = Math.round((parseInt(cmd2, 16) / 0xff) * 100);
		    this.emit('heartbeat', level);
		    break;
	  	case '11':
	    	this.emit('open', group);
	    	break;
	  	case '12':
	    	this.emit('open', group);
	    	break;
	  	case '13':
	    	this.emit('close', group);
	    	break;
	  	case '14':
	    	this.emit('close', group);
	    	break;
    	default:
    		debug('No event for command - %s', cmd1);
  	}
}

MicroOpenClose.prototype.handleAck = function (cmd1, cmd2) {
	if(!!this.insteon && !!this.insteon.status && !!this.insteon.status.command) {
		var command = this.insteon.status.command;
		if (command.cmd1 === '19') {
			// ack for light status/level
			return;
		}
		if(command.extended &&
			command.cmd1 === '2E' &&
			command.id.toUpperCase() === this.id) {
			// ack for light.info
			return;
		}
		if(command.extended &&
			command.cmd1 === '2F' &&
			command.id.toUpperCase() === this.id) {
			// ack for insteon.linkAt
			return;
		}
	}


	if(!this.emitOnAck) {
		return;
	}

	debug('Emitting ACK command for device (%s) - cmd1: %s, cmd2: %s', this.id, cmd1, cmd2);
	var group = null; // act doesn't have group
	this.emit('command', group, cmd1, cmd2);

	switch (cmd1) {
		case '11': // turnOn
			this.emit('open', group);
			break;
		case '12': // turnOnFast
			this.emit('openFast', group);
			break;
		case '13': // turnOff
		case '14': // turnOffFast
			this.emit('close', group);
			break;
		default:
			debug('No event for command - %s', cmd1);
  	}
}

module.exports = MicroOpenClose;
