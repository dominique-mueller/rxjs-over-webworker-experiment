declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

import { expose, proxy } from "comlink";
import { interval } from "rxjs";
import { tap, share } from "rxjs/operators";

console.log("[WORKER] Script is running.");

// Announce readiness
self.postMessage("READY");

const stream = interval(1000).pipe(
  tap(() => {
    console.log("[WORKER] Interval emitted.");
  })
  share(),
);

// stream.subscribe(number => {
//   console.log(number);
// });

const api = {
  subscribe: (callback: any) => {
    const callbackProxy = (...args: any) => {
      callback(args);
    };
    const subscription = stream.subscribe(callbackProxy);
    const unsubscribeProxy = () => {
      return subscription.unsubscribe();
    };
    return proxy(unsubscribeProxy);
  }
};

expose(api, self);
