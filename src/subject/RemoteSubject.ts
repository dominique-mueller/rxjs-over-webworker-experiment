import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction, Subject } from "rxjs";
import { Remote, proxy } from "comlink";
import { WorkerSubject } from "./WorkerSubject";

/**
 * Remote Subject
 */
export class RemoteSubject<T> extends Subject<T> {
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
    super();
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
