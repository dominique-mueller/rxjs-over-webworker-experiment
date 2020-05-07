import { Subscription, Subject, BehaviorSubject, Observable } from "rxjs";
import { proxy } from "comlink";

// type WorkerSubscription = Pick<Subscription, "unsubscribe">;

// type WorkerProxySubscription = ReturnType<typeof proxy>;

/**
 * Worker Subject
 */
export class WorkerSubject<T> extends Subject<T> {
  /**
   * Constructor
   */
  // constructor() {
  //   super();
  // }

  public subscribe(callback: any): any {
    // "Copy" the fallback function to not confuse RxJS about our proxies callback function
    const callbackProxy = (...args: any): void => {
      callback(...args);
    };

    // Subscribe
    const subscription: Subscription = super.subscribe(callbackProxy);

    // Create unsubscribe proxy
    const unsubscribeProxy = (): void => {
      return subscription.unsubscribe();
    };

    // Return subscription
    return proxy({
      unsubscribe: unsubscribeProxy,
    });
  }
}

export function exposeSubscribable<T>(source: Observable<T> | Subject<T> | BehaviorSubject<T>): any {
  (source as any).remoteSubscribe = (...remoteSubscribeArgs: Array<any>): any => {
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

    // Create unsubscribe proxy
    const unsubscribeProxy = (): ReturnType<Subscription["unsubscribe"]> => {
      return subscription.unsubscribe();
    };

    // Return subscription
    return proxy({
      unsubscribe: unsubscribeProxy,
    });
  };

  return source;
}
