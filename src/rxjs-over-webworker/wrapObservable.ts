import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction } from "rxjs";
import { proxy } from "comlink";

/**
 * Create shadow observable
 *
 * @param  observable Observable
 * @eturns            Observable, shadow
 */
function createShadowObservable<T>(observable: Observable<T>): Observable<T> {
  // Create new observable
  // Note: To hide the asynchronousity of the remote subject, we need a "wrapping" / "bridging" observable here so that we can return a
  // subscription instantly (synchronously).
  return new Observable<T>(
    (subscriber: Subscriber<T>): TeardownLogic => {
      // Emit values coming from the web worker into this observable
      const shadowSubscriber = (...subscribeArgs: Array<any>): void => {
        subscriber.next(...subscribeArgs);
      };

      // Subscribe to remote observable
      const subscriptionAsync: Observable<Subscription> = from<Promise<Subscription>>(observable.subscribe(proxy(shadowSubscriber)) as any);

      // Cleanup
      return (): void => {
        subscriptionAsync.toPromise().then((subscription: Subscription): void => {
          subscription.unsubscribe();
        });
      };
    }
  );
}

/**
 * Wrap observable
 *
 * @param   observable Observable
 * @returns            Observable, wrapped
 */
export function wrapObservable<T>(observable: Observable<T>): Observable<T> {
  return new Proxy(observable, {
    get(target: any, propKey: any) {
      if (propKey === "subscribe") {
        return (...subscribeArgs: Parameters<Observable<T>["subscribe"]>) => {
          return createShadowObservable(observable).subscribe(...subscribeArgs);
        };
      }

      if (propKey === "pipe") {
        return (...pipeArgs: Parameters<Observable<T>["pipe"]>) => {
          return createShadowObservable(observable).pipe(...pipeArgs);
        };
      }

      return target[propKey];
    },
  });
}
