import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction, Subject } from "rxjs";
import { Remote, proxy } from "comlink";

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

    const unsubscribeProxy = () => {
      return subscription.unsubscribe();
    };
    return proxy({
      unsubscribe: unsubscribeProxy
    });
  }
}
