import ScriptWebWorker from "./script.worker";
import { Observable, Observer, fromEvent, Subject, Subscription } from "rxjs";
import { wrap, Remote, proxy } from "comlink";

console.log("Script is running.");

const main = async () => {
  // Instantiate worker
  const worker: Worker = new ScriptWebWorker();
  const workerWrapper: any = wrap(worker);

  // Wait for worker to be ready
  await new Promise(resolve => {
    worker.addEventListener(
      "message",
      (event: MessageEvent) => {
        if (event.data === "READY") {
          resolve();
        }
      },
      { once: true }
    );
  });

  console.log("Worker is ready.", worker, workerWrapper);

  const subscriber = (count: number) => {
    console.log("Counter:", count);
  };
  const unsubscribe = await workerWrapper.subscribe(proxy(subscriber));

  setTimeout(async () => {
    const subscriber2 = (count: number) => {
      console.log("Counter:", count);
    };
    const unsubscribe2 = await workerWrapper.subscribe(proxy(subscriber2));

    setTimeout(() => {
      unsubscribe2();
    }, 5000);
  }, 2000);

  setTimeout(() => {
    unsubscribe();
  }, 5000);
};

main();
