declare const self: Worker;
export default {} as typeof Worker & { new (): Worker };

console.log("Web Worker script is running");
