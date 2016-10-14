var BufferView = require("../BufferView.js");
module.exports = {

    "inheritance": function(test) {
        test.ok(new BufferView(new Buffer(1)) instanceof DataView);
        test.done();
    },

    "create": function(test) {
        var b = new Buffer(1),
            ab = new ArrayBuffer(1),
            t;
        test.ok((t = BufferView.create(b)) instanceof BufferView);
        test.ok(t instanceof DataView);
        test.notOk((t = BufferView.create(ab)) instanceof BufferView);
        test.ok(t instanceof DataView);
        test.done();
    },

    "Uint/Int8": function(test) {
        var b = new Buffer(1),
            bv = new BufferView(b);
        bv.setUint8(0, 0xFE);
        test.strictEqual(bv.getUint8(0), 0xFE);
        test.strictEqual(bv.getInt8(0), -2);
        bv.setInt8(0, 0xFE);
        test.strictEqual(bv.getUint8(0), 0xFE);
        test.strictEqual(bv.getInt8(0), -2);
        bv.setInt8(0, -2);
        test.strictEqual(bv.getInt8(0), -2);
        test.strictEqual(bv.getUint8(0), 0xFE);
        bv.setUint8(0, -2);
        test.strictEqual(bv.getInt8(0), -2);
        test.strictEqual(bv.getUint8(0), 0xFE);
        test.done();
    },

    "Uint/Int16": function(test) {
        var b = new Buffer(2),
            bv = new BufferView(b);
        [false, true].forEach(function(le) {
            bv.setUint16(0, 0xFFFE, le);
            test.strictEqual(bv.getUint16(0, le), 0xFFFE);
            test.strictEqual(bv.getInt16(0, le), -2);
            bv.setInt16(0, 0xFFFE, le);
            test.strictEqual(bv.getUint16(0, le), 0xFFFE);
            test.strictEqual(bv.getInt16(0, le), -2);
            bv.setInt16(0, -2, le);
            test.strictEqual(bv.getInt16(0, le), -2);
            test.strictEqual(bv.getUint16(0, le), 0xFFFE);
            bv.setUint16(0, -2, le);
            test.strictEqual(bv.getInt16(0, le), -2);
            test.strictEqual(bv.getUint16(0, le), 0xFFFE);
            le ? test.strictEqual(b.toString("hex"), "feff") : test.strictEqual(b.toString("hex"), "fffe");
        });
        test.done();
    },

    "Uint/Int32": function(test) {
        var b = new Buffer(4),
            bv = new BufferView(b);
        [false, true].forEach(function(le) {
            bv.setUint32(0, 0xFFFFFFFE, le);
            test.strictEqual(bv.getUint32(0, le), 0xFFFFFFFE);
            test.strictEqual(bv.getInt32(0, le), -2);
            bv.setInt32(0, 0xFFFFFFFE, le);
            test.strictEqual(bv.getUint32(0, le), 0xFFFFFFFE);
            test.strictEqual(bv.getInt32(0, le), -2);
            bv.setInt32(0, -2, le);
            test.strictEqual(bv.getInt32(0, le), -2);
            test.strictEqual(bv.getUint32(0, le), 0xFFFFFFFE);
            bv.setUint32(0, -2, le);
            test.strictEqual(bv.getInt32(0, le), -2);
            test.strictEqual(bv.getUint32(0, le), 0xFFFFFFFE);
            le ? test.strictEqual(b.toString("hex"), "feffffff") : test.strictEqual(b.toString("hex"), "fffffffe");
        });
        test.done();
    },

    "Float32": function(test) {
        var b = new Buffer(4),
            bv = new BufferView(b);
        bv.setFloat32(0, 0.125);
        test.strictEqual(bv.getFloat32(0), 0.125);
        var b2 = new Buffer(4);
        bv = new BufferView(b2);
        bv.setFloat32(0, 0.125, true);
        test.strictEqual(bv.getFloat32(0, true), 0.125);
        test.notEqual(b.toString("hex"), b2.toString("hex"));
        test.done();
    },

    "Float64": function(test) {
        var b = new Buffer(8),
            bv = new BufferView(b);
        bv.setFloat64(0, 0.123);
        test.strictEqual(bv.getFloat64(0), 0.123);
        var b2 = new Buffer(8);
        bv = new BufferView(b2);
        bv.setFloat64(0, 0.123, true);
        test.strictEqual(bv.getFloat64(0, true), 0.123);
        test.notEqual(b.toString("hex"), b2.toString("hex"));
        test.done();
    }
};
