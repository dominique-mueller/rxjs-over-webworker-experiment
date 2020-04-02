import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction } from "rxjs";
import { Remote, proxy } from "comlink";

export interface RemoteAPI {
  subscribe: (callback: any) => any;
}

/**
 * Remote Subject
 */
export class RemoteSubject<T> {
  // export class RemoteSubject<T> extends Subject<T> {
  private readonly worker: Remote<RemoteAPI>;

  constructor(worker: Remote<RemoteAPI>) {
    // super();
    this.worker = worker;
  }

  // public next(): void {
  //   // TODO: ...
  // }

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
        const subscribeResult: Observable<any> = from(this.worker.subscribe(proxy(proxySubscriber)) as Promise<any>);

        // Cleanup
        return (): void => {
          subscribeResult.toPromise().then(unsubscribe => {
            unsubscribe();
          });
        };
      }
    );
  }
}
