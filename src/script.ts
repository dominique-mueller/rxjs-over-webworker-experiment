import myWorker from "./script.worker";

console.log("Script is running");

const worker = new myWorker();
console.log(worker);
