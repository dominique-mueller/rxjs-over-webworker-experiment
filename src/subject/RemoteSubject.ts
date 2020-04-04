import { Subscription, Observable, Subscriber, TeardownLogic, from, OperatorFunction, Subject, Observer, SubscriptionLike } from "rxjs";
import { Remote, proxy } from "comlink";
import { WorkerSubject } from "./WorkerSubject";

/**
 * Remote Subject
 *
 * TODO: What does the 'lift' function do??
 */
// export class RemoteSubject<T> extends Subject<T> {
export class RemoteSubject<T> {
  /**
   * Observers
   */
  public readonly observers: Remote<WorkerSubject<T>["observers"]>;

  /**
   * Closed flag
   */
  public readonly closed: Remote<WorkerSubject<T>["closed"]>;

  /**
   * Is stopped flag
   */
  public readonly isStopped: Remote<WorkerSubject<T>["isStopped"]>;

  /**
   * Has error flag
   */
  public readonly hasError: Remote<WorkerSubject<T>["hasError"]>;

  /**
   * Thrown error
   */
  public readonly thrownError: Remote<WorkerSubject<T>["thrownError"]>;

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
    this.observers = this.workerSubject.observers;
    this.closed = this.workerSubject.closed;
    this.isStopped = this.workerSubject.isStopped;
    this.hasError = this.workerSubject.hasError;
    this.thrownError = this.workerSubject.thrownError;
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
        const subscribeResult: Observable<any> = from(this.workerSubject.subscribe(proxy(proxySubscriber)));

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
