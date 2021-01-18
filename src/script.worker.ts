declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

import { expose } from "comlink";
import { interval, Observable } from "rxjs";
import { tap } from "rxjs/operators";

import { exposeObservable } from "./rxjs-over-webworker/exposeObservable";

console.log("[WORKER] Script is running.");

// RxJS streams
const intervalSource: Observable<number> = interval(1000).pipe(
  tap((value: number) => {
    console.log(`[WORKER] Sending counter "${value}" to main thread ...`);
  })
);

// Worker API
const api = {
  message: "Hello World!",
  intervalStream: intervalSource,
};

// Expose worker API, with custom expose for RxJS stuff
api.intervalStream = exposeObservable(api.intervalStream);
expose(api, self);
