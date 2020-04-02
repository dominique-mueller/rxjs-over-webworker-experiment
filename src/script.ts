import ScriptWebWorker from "./script.worker";

console.log("Script is running.");

const main = async () => {
  // Instantiate worker
  const worker: Worker = new ScriptWebWorker();

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

  console.log("Worker is ready.", worker);
};

main();
