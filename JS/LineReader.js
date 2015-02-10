var LineReader = function (options) {
  if ( !(this instanceof LineReader) ) {
    return new LineReader(options);
  }

  var internals = this._internals = {};
  var self = this;

  internals.reader = new FileReader();

  internals.chunkSize = ( options && options.chunkSize )
    ? options.chunkSize
    : 1024;

  internals.events = {};
  internals.canRead = true;

  internals.reader.onload = function () {

    internals.chunk += this.result;
    if ( /\r|\n/.test( internals.chunk ) ) {
      internals.lines = internals.chunk.match(/[^\r\n]+/g);

      if ( self._hasMoreData() ) {
        internals.chunk = internals.lines.pop();
      }
      self._step();

    } else {

      if ( self._hasMoreData() ) {
        return self.read();
      }

      if ( internals.chunk.length ) {
        return self._emit('line', [
          internals.chunk,
          self._emit.bind(self, 'end')
        ]);
      }

      self._emit('end');
    }
  };

  internals.reader.onerror = function () {
    self._emit('error', [ this.error ]);
  };
};


LineReader.prototype.on = function (eventName, cb) {
  this._internals.events[ eventName ] = cb;
};


LineReader.prototype.read = function (file) {
  var internals = this._internals;

    if (typeof file !== 'undefined') {
    internals.file = file;
    internals.fileLength = file.size;
    internals.readPos = 0;
    internals.chunk = '';
    internals.lines = [];
  }

  var blob = internals.file.slice( internals.readPos, internals.readPos + internals.chunkSize );
  internals.readPos += internals.chunkSize;
  internals.reader.readAsText(blob);
};


LineReader.prototype.abort = function () {
  this._internals.canRead = false;
};


LineReader.prototype._step = function () {
  var internals = this._internals;

  if (internals.lines.length === 0) {
    if ( this._hasMoreData() ) {
      return this.read();
    }
    return this._emit('end');
  }

  if (internals.canRead) {
    this._emit('line', [
      internals.lines.shift(),
      this._step.bind(this)
    ]);
  } else {
    this._emit('end');
  }
};

LineReader.prototype._hasMoreData = function () {
  var internals = this._internals;
  return internals.readPos <= internals.fileLength;
};

LineReader.prototype._emit = function (event, args) {
  var boundEvents = this._internals.events;

  if ( typeof boundEvents[event] === 'function' ) {
    boundEvents[event].apply(self, args);
  }
};
