import { Subscription } from "rxjs";
import { wrap } from "comlink";

import ScriptWebWorker from "./script.worker";
import { asRemoteSubject } from "./subject/RemoteSubject";

console.log("Script is running.");

const main = async () => {
  // Instantiate worker
  const worker: Worker = new ScriptWebWorker();
  const workerWrapper: any = wrap(worker);

  // // Wait for worker to be ready
  // await new Promise((resolve) => {
  //   worker.addEventListener(
  //     "message",
  //     (event: MessageEvent) => {
  //       if (event.data === "READY") {
  //         resolve();
  //       }
  //     },
  //     { once: true }
  //   );
  // });

  console.log("Worker is ready.", worker, workerWrapper);

  const subject = asRemoteSubject(workerWrapper.testSubject);

  // const subject = new RemoteSubject(workerWrapper.testSubject);
  // const remoteSubject = await workerWrapper.createTestSubject();
  // const subject = new RemoteSubject(remoteSubject);

  // DIRECT SUBSCRIPTION

  const subscription: Subscription = subject.subscribe((value: number) => {
    console.log("Counter:", value);
  });

  setTimeout(() => {
    subscription.unsubscribe();
  }, 5000);

  // let i = 0;
  // setInterval(() => {
  //   subject.next(i);
  //   i++;
  // }, 1000);

  // PIPES

  // subject.next("TEST VALUE");

  // const subscription: Subscription = subject
  //   .pipe(
  //     tap((count: number) => {
  //       console.log("Counter 1:", count);
  //     }),
  //     tap((count: number) => {
  //       console.log("Counter 2:", count);
  //     }),
  //     take(7)
  //   )
  //   .subscribe(() => {
  //     // Activate
  //   });
  // subscription.unsubscribe();

  // setTimeout(() => {
  //   subscription.unsubscribe();
  // }, 5000);

  // const subscriber = (count: number) => {
  //   console.log("Counter:", count);
  // };
  // const unsubscribe = await workerWrapper.subscribe(proxy(subscriber));

  // setTimeout(async () => {
  //   const subscriber2 = (count: number) => {
  //     console.log("Counter:", count);
  //   };
  //   const unsubscribe2 = await workerWrapper.subscribe(proxy(subscriber2));

  //   setTimeout(() => {
  //     unsubscribe2();
  //   }, 5000);
  // }, 2000);

  // setTimeout(() => {
  //   unsubscribe();
  // }, 5000);
};

main();
