declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

import { expose } from "comlink";
import { interval } from "rxjs";

import { asRemoteSource } from "./subject/WorkerSubject";

console.log("[WORKER] Script is running.");

// Announce readiness
// self.postMessage("READY");

// const subject = new WorkerSubject<number>();
// const subject = new Subject<number>();
const source = interval(1000);
const workerSubject = asRemoteSource(source);
// source.subscribe((value: number): void => {
//   console.log(`[WORKER] ${value}`);
// });

// let i = 0;
// setInterval(() => {
//   subject.next(i);
//   i++;
// }, 1000);

// const stream = interval(1000).pipe(
//   tap((count: number) => {
//     console.log("[WORKER] Interval emitted.", count);
//   })
//   share(),
// );

// stream.subscribe(number => {
//   console.log(number);
// });

// setInterval(() => {
//   console.log(api.experiment);
// }, 1000);

const api = {
  testSubject: workerSubject,
  // createTestSubject() {
  //   const subject = new WorkerSubject<number>();
  //   let i = 0;
  //   setInterval(() => {
  //     subject.next(i);
  //     i++;
  //   }, 1000);
  //   return proxy(subject);
  // },
  experiment: null,
  // next: (value: any) => {
  //   console.log('NEXT VALUE', value);
  // },
  // subscribe: (callback: any) => {
  //   const callbackProxy = (...args: any) => {
  //     callback(...args);
  //   };
  //   const subscription: Subscription = stream.subscribe(callbackProxy);
  //   const unsubscribeProxy = () => {
  //     return subscription.unsubscribe();
  //   };
  //   return proxy(unsubscribeProxy);
  // }
};

expose(api, self);
