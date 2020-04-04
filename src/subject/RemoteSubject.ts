import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction, Subject, Observer, SubscriptionLike } from "rxjs";
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

  public next(value: any): void {
    this.workerSubject.next(value);
  }

  public subscribe(callback: any): Subscription {
    return this.createSubscribeProxyObservable().subscribe(callback);
  }

  public pipe(...operations: Array<OperatorFunction<any, any>>): any {
    return (this.createSubscribeProxyObservable().pipe as any)(...operations);
  }

  private createSubscribeProxyObservable() {
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
        const subscribeResult: Observable<any> = from(this.workerSubject.subscribe(proxy(proxySubscriber)) as Promise<any>);

        // Cleanup
        return (): void => {
          subscribeResult.toPromise().then((subscription: any) => {
            subscription.unsubscribe();
          });
        };
      }
    );
  }
}
