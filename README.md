<div align="center">

# rxjs-over-webworker-experiment

Using RxJS over Web Workers.

</div>

<br><br><br>

Very much a prototype. Makes it possible to use RxJS across Web Worker boundaries, e.g. having a source observable in the worker and
subscribing to it from the main thread. Very limited right now, typings are not correct, and async issues might exist. But hey, it works!
