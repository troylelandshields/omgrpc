![BufferView - A DataView for node Buffers](https://raw.github.com/dcodeIO/BufferView/master/BufferView.png)
==========

This one is simple: It's doing exactly what [DataView](https://developer.mozilla.org/en-US/docs/Web/API/DataView) does
but takes a node.js Buffer for it. The sole difference is that it additionally provides some convenience methods to work
with interchangeable BufferView and DataView instances, depending on the backing buffer:

* `BufferView.create(Buffer|ArrayBuffer):BufferView|DataView` creates a BufferView if wrapping a Buffer and a DataView
  otherwise
* `BufferView.isBufferView(*):boolean` tests if a view is a BufferView wrapping a Buffer
* `BufferView.isDataView(*):boolean` tests if a view is a DataView wrapping an ArrayBuffer

This basically lets you write code that is independent of what kind of buffer your backing buffer is, so that your
library does not need to copy back and forth between Buffers and ArrayBuffers - that would be sad.

* Extends DataView for `instanceof` compatibility
* [Well tested](https://github.com/dcodeIO/BufferView/blob/master/tests/suite.js)
* Lean (BufferView.min.js is ~3KB)

**License:** [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0.html)
