import { Subject, BehaviorSubject, Observable } from "rxjs";
import { proxy } from "comlink";

export function exposeSubscribable<T>(source: Observable<T> | Subject<T> | BehaviorSubject<T>): any {
  return new Proxy(source, {
    get(target: any, propKey: any) {
      if (propKey === "subscribe") {
        return (...remoteSubscribeArgs: Array<any>): any => {
          // "Proxy" any functions to not confuse RxJS
          const remoteSubscribeArgsProxy = remoteSubscribeArgs.map((remoteSubscribeArg: any): any | ((...args: Array<any>) => any) => {
            return remoteSubscribeArg instanceof Function
              ? (...args: Array<any>): any => {
                  return remoteSubscribeArg(...args);
                }
              : remoteSubscribeArg;
          });

          // Subscribe
          const subscription: ReturnType<typeof source["subscribe"]> = source.subscribe(...remoteSubscribeArgsProxy);

          // Return subscription
          return proxy(subscription);
        };
      }

      return target[propKey];
    },
  });
}
