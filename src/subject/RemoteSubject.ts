import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction } from "rxjs";
import { Remote, proxy } from "comlink";

import { WorkerSubject } from "./WorkerSubject";

/**
 * Remote Subject
 */
// export class RemoteSubject<T> extends Subject<T> {
export class RemoteSubject<T> {
  /**
   * Worker subject
   */
  private readonly workerSubject: Remote<WorkerSubject<T>>;

  /**
   * Constructor
   *
   * @param workerSubject Worker subject
   */
  constructor(workerSubject: Remote<WorkerSubject<T>>) {
    this.workerSubject = workerSubject;
  }

  /**
   * Next
   *
   * @param value Value
   */
  public next(value?: T): ReturnType<Remote<WorkerSubject<T>["next"]>> {
    return this.workerSubject.next(value);
  }

  /**
   * Error
   *
   * @param error Error
   */
  public error(error: any): ReturnType<Remote<WorkerSubject<T>["error"]>> {
    return this.workerSubject.error(error);
  }

  /**
   * Complete
   */
  public complete(): ReturnType<Remote<WorkerSubject<T>["complete"]>> {
    return this.workerSubject.complete();
  }

  /**
   * Unsubscribe
   */
  public unsubscribe(): ReturnType<Remote<WorkerSubject<T>["unsubscribe"]>> {
    return this.workerSubject.unsubscribe();
  }

  public pipe(...operations: Array<OperatorFunction<any, any>>): any {
    // TODO: Find a solution to type the pipe (huh, that rhymes!)
    return (this.createSubscribeProxyObservable().pipe as any)(...operations);
  }

  public subscribe(callback: any): Subscription {
    return this.createSubscribeProxyObservable().subscribe(callback);
  }

  /**
   * As observable
   */
  public asObservable(): ReturnType<WorkerSubject<T>["asObservable"]> {
    return this.createSubscribeProxyObservable();
  }

  private createSubscribeProxyObservable(): Observable<T> {
    // Create new observable
    // Note: To hide the asynchronousity of the remote subject, we need a "wrapping" / "bridging" observable here so that we can return a
    // subscription instantly (synchronously).
    return new Observable<T>(
      (subscriber: Subscriber<T>): TeardownLogic => {
        // Emit values coming from the web worker into this observable
        const proxySubscriber = (...args: Array<any>): void => {
          subscriber.next(...args);
        };

        // Subscribe to remote observable
        const subscribeResult: Observable<any> = from((this.workerSubject as any).remoteSubscribe(proxy(proxySubscriber)));

        // Cleanup
        return (): void => {
          subscribeResult.toPromise().then((subscription: Subscription): void => {
            subscription.unsubscribe();
          });
        };
      }
    );
  }
}

export function asRemoteSubject(workerSubject: any) {
  return {
    subscribe: (callback: any) => {
      return createWorkerSubjectProxy(workerSubject).subscribe(callback);
    },
  };
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
      const subscribeResult: Observable<any> = from(workerSubject.remoteSubscribe(proxy(proxySubscriber)));

      // Cleanup
      return (): void => {
        subscribeResult.toPromise().then((subscription: Subscription): void => {
          subscription.unsubscribe();
        });
      };
    }
  );
}
