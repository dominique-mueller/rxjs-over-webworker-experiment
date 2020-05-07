import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction } from "rxjs";
import { proxy } from "comlink";

export function wrapSubscribable(workerSubject: any): any {
  const proxy = new Proxy(workerSubject, {
    get(target, propKey) {
      if (propKey === "subscribe") {
        return (callback: any) => {
          return createWorkerSubjectProxy(workerSubject).subscribe(callback);
        };
      }

      if (propKey === "pipe") {
        return (...operations: Array<OperatorFunction<any, any>>) => {
          return (createWorkerSubjectProxy(workerSubject).pipe as any)(...operations);
        };
      }

      if (propKey === "unsubscribe") {
        return (): void => {
          return workerSubject.unsubscribe();
        };
      }

      return target[propKey];
    },
  });

  return proxy;
}

export function createWorkerSubjectProxy(workerSubject: any) {
  // Create new observable
  // Note: To hide the asynchronousity of the remote subject, we need a "wrapping" / "bridging" observable here so that we can return a
  // subscription instantly (synchronously).
  return new Observable<any>(
    (subscriber: Subscriber<any>): TeardownLogic => {
      // Emit values coming from the web worker into this observable
      const proxySubscriber = (...args: Array<any>): void => {
        subscriber.next(...args);
      };

      // Subscribe to remote observable
      // const subscribeResult: Observable<any> = from(workerSubject.remoteSubscribe(proxy(proxySubscriber)));
      const subscribeResult: Observable<any> = from(workerSubject.subscribe(proxy(proxySubscriber)));

      // Cleanup
      return (): void => {
        subscribeResult.toPromise().then((subscription: Subscription): void => {
          subscription.unsubscribe();
        });
      };
    }
  );
}
