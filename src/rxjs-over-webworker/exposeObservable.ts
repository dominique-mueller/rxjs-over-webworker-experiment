import { Observable, Subscription } from "rxjs";
import { proxy } from "comlink";

/**
 * Expose observable (e.g. subject, observable)
 *
 * @param   observable Observable source
 * @returns            Observable source, exposed
 */
export function exposeObservable<T>(observable: Observable<T>): Observable<T> {
  return new Proxy(observable, {
    get(target: any, propKey: any) {
      if (propKey === "subscribe") {
        return (...subscribeArgs: Parameters<Observable<T>["subscribe"]>): Subscription => {
          // Manually wrap any function parameters in custom functions so to not confuse RxJS
          const subscribeArgsWrapped = subscribeArgs.map((subscribeArg) => {
            return subscribeArg instanceof Function
              ? (...subscribeFunctionArg: Array<any>) => {
                  return (subscribeArg as any)(...subscribeFunctionArg);
                }
              : subscribeArg;
          });

          // Subscribe
          const subscription: ReturnType<Observable<T>["subscribe"]> = observable.subscribe(...subscribeArgsWrapped);

          // Return subscription
          return proxy(subscription);
        };
      }

      return target[propKey];
    },
  });
}
