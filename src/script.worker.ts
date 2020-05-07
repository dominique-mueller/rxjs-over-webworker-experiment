declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

import { expose } from "comlink";
import { interval } from "rxjs";

import { exposeSubscribable } from "./subject/WorkerSubject";

console.log("[WORKER] Script is running.");

const source = interval(1000);
const workerSubject = exposeSubscribable(source);

const api = {
  streams: {
    testSubject: workerSubject,
  },
  testA: {
    testB: "TEST TEST",
  },
  experiment: null,
};

expose(api, self);
