import { Subscription, Observable } from "rxjs";
import { wrap } from "comlink";

import ScriptWebWorker from "./script.worker";
import { wrapObservable } from "./rxjs-over-webworker/wrapObservable";

import deepmerge from "deepmerge";

console.log("Script is running.");

const main = async () => {
  // Instantiate worker
  const worker: Worker = new ScriptWebWorker();
  const workerApi = wrap<{
    message: string;
    intervalStream: Observable<number>;
  }>(worker);

  // Special handling for RxJS streams
  const workerApiWithStreams = deepmerge(workerApi, {
    intervalStream: wrapObservable<number>(workerApi.intervalStream as any),
  });

  // Example: Subscribe
  const subscription: Subscription = workerApiWithStreams.intervalStream.subscribe((value: number): void => {
    console.log("Counter:", value);
  });

  // Example: Unsubscribe after some time
  setTimeout(() => {
    subscription.unsubscribe();
  }, 5500);
};

main();
