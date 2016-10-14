/*
 Copyright 2013 Daniel Wirtz <dcode@dcode.io>

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

/**
 * @license BufferView (c) 2013 Daniel Wirtz <dcode@dcode.io>
 * Released under the Apache License, Version 2.0
 * see: https://github.com/dcodeIO/BufferView for details
 */ //
module.exports = (function() {
    "use strict";

    /**
     * Node Buffer.
     * @type {?buffer.Buffer}
     * @inner
     */
    var Buffer = require("buffer")["Buffer"];

    /**
     * Constructs a new BufferView.
     * @exports BufferView
     * @class An optimized DataView-compatible BufferView for node Buffers.
     * @param {!Buffer} buffer An existing Buffer to use as the storage for the new BufferView object.
     * @param {number=} byteOffset The offset, in bytes, to the first byte in the specified buffer for the new view to
     *  reference. If not specified, the view of the buffer will start with the first byte.
     * @param {number=} byteLength The number of elements in the byte array. If unspecified, length of the view will match
     *  the buffer's length.
     * @param {boolean=} noAssert Whether to disable offset assertions. Defaults to `false`, as with DataViews. Values
     *  are never asserted.
     * @constructor
     * @extends DataView
     */
    var BufferView = function(buffer, byteOffset, byteLength, noAssert) {

        byteOffset = byteOffset || 0;
        byteLength = byteLength || buffer.length;

        /**
         * Underlying Buffer.
         * @type {!Buffer}
         * @expose
         */
        this.buffer = byteOffset === 0 && byteLength === buffer.length
            ? buffer
            : buffer.slice(byteOffset || 0, byteLength || buffer.length); // Creates a view and does not copy, so it's fine.

        /**
         * Whether assertions of offsets and values are disabled.
         * @type {boolean}
         */
        this.noAssert = !!noAssert;
    };

    /**
     * Creates a BufferView if the argument is a Buffer and a DataView otherwise.
     * @param {!(Buffer|ArrayBuffer)} buffer An existing Buffer or ArrayBuffer to use as the storage for the new BufferView
     *  respectively DataView object.
     * @param {number=} byteOffset The offset, in bytes, to the first byte in the specified buffer for the new view to
     *  reference. If not specified, the view of the buffer will start with the first byte.
     * @param {number=} byteLength The number of elements in the byte array. If unspecified, length of the view will match
     *  the buffer's length.
     * @returns {!(BufferView|DataView)}} A BufferView for a Buffer or a DataView otherwise
     * @expose
     */
    BufferView.create = function(buffer, byteOffset, byteLength) {
        if (Buffer && Buffer.isBuffer(buffer)) return new BufferView(buffer, byteOffset, byteLength);
        return new DataView(buffer, byteOffset, byteLength);
    };

    /**
     * Tests if the specified view is a BufferView wrapping a Buffer.
     * @param {*} view View to test
     * @returns {boolean} `true` if it is a BufferView, otherwise `false`
     * @expose
     */
    BufferView.isBufferView = function(view) {
        return view && view instanceof BufferView;
    };

    /**
     * Tests if the specified view is a DataView wrapping an ArrayBuffer.
     * @param {*} view View to test
     * @returns {boolean} `true` if it is a DataView and not a BufferView, otherwise `false`
     * @expose
     */
    BufferView.isDataView = function(view) {
        return view && view instanceof DataView && !(view instanceof BufferView);
    };

    // Extend DataView and clear all instance methods to be sure
    BufferView.prototype = Object.create(DataView.prototype);
    (function() { for (var i in BufferView.prototype) delete BufferView.prototype[i]; })();

    /**
     * Gets an unsigned 8-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getUint8 = function(offset) {
        return this.buffer.readUInt8(offset, this.noAssert);
    };

    /**
     * Sets an unsigned 8-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to write the data.
     * @param {number} value The value to write
     * @expose
     */
    BufferView.prototype.setUint8 = function(offset, value) {
        if (!this.noAssert && (offset < 0 || offset >= this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        this.buffer.writeUInt8(value, offset, true);
    };

    /**
     * Gets a signed 8-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getInt8 = function(offset) {
        return this.buffer.readInt8(offset, this.noAssert);
    };

    /**
     * Sets a signed 8-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to write the data.
     * @param {value} value The value to write
     * @expose
     */
    BufferView.prototype.setInt8 = function(offset, value) {
        if (!this.noAssert && (offset < 0 || offset >= this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        this.buffer.writeInt8(value, offset, true);
    };

    /**
     * Gets an unsigned 16-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {boolean=} le Indicates whether the 16-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is read.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getUint16 = function(offset, le) {
        return le ? this.buffer.readUInt16LE(offset, this.noAssert) : this.buffer.readUInt16BE(offset, this.noAssert);
    };

    /**
     * Sets an unsigned 16-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to write the data.
     * @param {number} value The value to write
     * @param {boolean=} le Indicates whether the 16-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is written.
     * @expose
     */
    BufferView.prototype.setUint16 = function(offset, value, le) {
        if (!this.noAssert && (offset < 0 || offset+2 > this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        le ? this.buffer.writeUInt16LE(value, offset, true) : this.buffer.writeUInt16BE(value, offset, true);
    };

    /**
     * Gets a signed 16-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {boolean=} le Indicates whether the 16-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is read.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getInt16 = function(offset, le) {
        return le ? this.buffer.readInt16LE(offset, this.noAssert) : this.buffer.readInt16BE(offset, this.noAssert);
    };

    /**
     * Sets a signed 16-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to write the data.
     * @param {number} value The value to write
     * @param {boolean=} le Indicates whether the 16-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is written.
     * @expose
     */
    BufferView.prototype.setInt16 = function(offset, value, le) {
        if (!this.noAssert && (offset < 0 || offset+2 > this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        le ? this.buffer.writeInt16LE(value, offset, true) : this.buffer.writeInt16BE(value, offset, true);
    };

    /**
     * Gets an unsigned 32-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {boolean=} le Indicates whether the 32-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is read.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getUint32 = function(offset, le) {
        return le ? this.buffer.readUInt32LE(offset, this.noAssert) : this.buffer.readUInt32BE(offset, this.noAssert);
    };

    /**
     * Sets an unsigned 32-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to write the data.
     * @param {number} value The value to write
     * @param {boolean=} le Indicates whether the 32-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is written.
     * @expose
     */
    BufferView.prototype.setUint32 = function(offset, value, le) {
        if (!this.noAssert && (offset < 0 || offset+4 > this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        le ? this.buffer.writeUInt32LE(value, offset, true) : this.buffer.writeUInt32BE(value, offset, true);
    };

    /**
     * Gets a signed 32-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {boolean=} le Indicates whether the 32-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is read.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getInt32 = function(offset, le) {
        return le ? this.buffer.readInt32LE(offset, this.noAssert) : this.buffer.readInt32BE(offset, this.noAssert);
    };

    /**
     * Sets a signed 32-bit integer at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to write the data.
     * @param {number} value The value to write
     * @param {boolean=} le Indicates whether the 32-bit int is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is written.
     * @expose
     */
    BufferView.prototype.setInt32 = function(offset, value, le) {
        if (!this.noAssert && (offset < 0 || offset+4 > this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        le ? this.buffer.writeInt32LE(value, offset, true) : this.buffer.writeInt32BE(value, offset, true);
    };

    /**
     * Gets a 32-bit float at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {boolean=} le Indicates whether the 32-bit float is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is read.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getFloat32 = function(offset, le) {
        return le ? this.buffer.readFloatLE(offset, this.noAssert) : this.buffer.readFloatBE(offset, this.noAssert);
    };

    /**
     * Sets a 32-bit float at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {number} value The value to write
     * @param {boolean=} le Indicates whether the 32-bit float is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is written.
     * @expose
     */
    BufferView.prototype.setFloat32 = function(offset, value, le) {
        if (!this.noAssert && (offset < 0 || offset+4 > this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        le ? this.buffer.writeFloatLE(value, offset, true) : this.buffer.writeFloatBE(value, offset, true);
    };

    /**
     * Gets a 64-bit float at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {boolean=} le Indicates whether the 64-bit float is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is read.
     * @returns {number}
     * @expose
     */
    BufferView.prototype.getFloat64 = function(offset, le) {
        return le ? this.buffer.readDoubleLE(offset, this.noAssert) : this.buffer.readDoubleBE(offset, this.noAssert);
    };

    /**
     * Sets a 64-bit float at the specified byte offset from the start of the view.
     * @param {number} offset The offset, in byte, from the start of the view where to read the data.
     * @param {number} value The value to write
     * @param {boolean=} le Indicates whether the 64-bit float is stored in little- or big-endian format. If false or
     *  undefined, a big-endian value is written.
     * @expose
     */
    BufferView.prototype.setFloat64 = function(offset, value, le) {
        if (!this.noAssert && (offset < 0 || offset+8 > this.buffer.length)) throw(new Error("Offset out of bounds: "+offset));
        le ? this.buffer.writeDoubleLE(value, offset, true) : this.buffer.writeDoubleBE(value, offset, true);
    };

    return BufferView;
})();

