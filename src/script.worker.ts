declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

console.log("WebWorker script is running.");

self.postMessage("READY");
