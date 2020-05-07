import { Subscription, Observable } from "rxjs";
import { wrap } from "comlink";

import ScriptWebWorker from "./script.worker";
import { wrapSubscribable } from "./subject/RemoteSubject";

import deepmerge from "deepmerge";

console.log("Script is running.");

const main = async () => {
  // Instantiate worker
  const worker: Worker = new ScriptWebWorker();
  const workerWrapper = wrap<{
    testA: {
      testB: string;
    };
    streams: {
      testSubject: Observable<any>;
    };
  }>(worker);

  const workerApi = deepmerge(workerWrapper, {
    streams: {
      testSubject: wrapSubscribable(workerWrapper.streams.testSubject),
    },
  });

  // DIRECT SUBSCRIPTION

  // const subscription: Subscription = api.testSubject.subscribe((value: number) => {
  const subscription: Subscription = workerApi.streams.testSubject.subscribe((value: number) => {
    console.log("Counter:", value);
  });

  setTimeout(() => {
    subscription.unsubscribe();
  }, 5000);
};

main();
