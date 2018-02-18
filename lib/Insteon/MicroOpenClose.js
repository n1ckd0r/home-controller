var utils = require('./utils');

function MicroOpenClose(id, insteon) {
  this.id = id;
  this.insteon = insteon;
}

MicroOpenClose.prototype.open = function () {
  return this.insteon.directCommand(this.id, '11', 'FF');
};

MicroOpenClose.prototype.close = function () {
  return this.insteon.directCommand(this.id, '14', 'FF');
};

MicroOpenClose.prototype.toggle = function () {
	return this.insteon.directCommand(this.id, '21', 'FF');
}

module.exports = MicroOpenClose;