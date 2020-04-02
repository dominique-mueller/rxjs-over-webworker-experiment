declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

import { expose, proxy } from "comlink";
import { interval, Subscription } from "rxjs";
import { tap, share } from "rxjs/operators";

console.log("[WORKER] Script is running.");

// Announce readiness
self.postMessage("READY");

const stream = interval(1000).pipe(
  tap((count: number) => {
    console.log("[WORKER] Interval emitted.", count);
  })
  share(),
);

// stream.subscribe(number => {
//   console.log(number);
// });

const api = {
  next: (value: any) => {
    console.log('NEXT VALUE', value);
  },
  subscribe: (callback: any) => {
    const callbackProxy = (...args: any) => {
      callback(...args);
    };
    const subscription: Subscription = stream.subscribe(callbackProxy);
    const unsubscribeProxy = () => {
      return subscription.unsubscribe();
    };
    return proxy(unsubscribeProxy);
  }
};

expose(api, self);
