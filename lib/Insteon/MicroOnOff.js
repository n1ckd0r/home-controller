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

MicroOnOff.prototype.handleAllLinkBroadcast = function(group, cmd1, cmd2)
{
	debug('Emitting BC command for device (%s) - group: %s, cmd1: %s, cmd2: %s', this.id, group, cmd1, cmd2);
  	this.emit('command', group, cmd1, cmd2);

  	switch(cmd1) {
  		case '04':
		    var level = Math.round((parseInt(cmd2, 16) / 0xff) * 100);
		    this.emit('heartbeat', level);
		    break;
	  	case '11':
	    	this.emit('turnOn', group);
	    	break;
	  	case '12':
	    	this.emit('turnOnFast', group);
	    	break;
	  	case '13':
	    	this.emit('turnOff', group);
	    	break;
	  	case '14':
	    	this.emit('turnOffFast', group);
	    	break;
    	default:
    		debug('No event for command - %s', cmd1);
  	}
}

MicroOnOff.prototype.handleAck = function (cmd1, cmd2) {
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
  
			this.emit('turnOn', group);
			break;
		case '12': // turnOnFast
			this.emit('turnOnFast', group);
			break;
		case '13': // turnOff
		case '14': // turnOffFast
			this.emit('turnOff', group);
			break;
		default:
			debug('No event for command - %s', cmd1);
  	}
}

module.exports = MicroOnOff;