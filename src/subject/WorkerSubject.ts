import { Subscription, Subject } from "rxjs";
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

export function asWorkerSubject<T>(subject: any): any {
  subject.remoteSubscribe = (callback: any): any => {
    // "Copy" the fallback function to not confuse RxJS about our proxies callback function
    const callbackProxy = (...args: any): void => {
      callback(...args);
    };

    // Subscribe
    const subscription: Subscription = subject.subscribe(callbackProxy);

    // Create unsubscribe proxy
    const unsubscribeProxy = (): void => {
      return subscription.unsubscribe();
    };

    // Return subscription
    return proxy({
      unsubscribe: unsubscribeProxy,
    });
  };

  return subject;
}
