// Controllable stand-ins for the browser APIs our code touches.

export class MockEventSource {
  static instances: MockEventSource[] = [];
  url: string;
  listeners: Record<string, Array<(e: MessageEvent) => void>> = {};
  closed = false;

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }
  addEventListener(type: string, cb: (e: MessageEvent) => void) {
    (this.listeners[type] ??= []).push(cb);
  }
  removeEventListener() {}
  close() {
    this.closed = true;
  }
  emit(type: string, data: unknown) {
    (this.listeners[type] ?? []).forEach((cb) => cb({ data: JSON.stringify(data) } as MessageEvent));
  }
  static last() {
    return MockEventSource.instances[MockEventSource.instances.length - 1];
  }
  static reset() {
    MockEventSource.instances = [];
  }
}

export class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  cb: IntersectionObserverCallback;

  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
    MockIntersectionObserver.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
  trigger(isIntersecting: boolean) {
    this.cb(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
  static last() {
    return MockIntersectionObserver.instances[MockIntersectionObserver.instances.length - 1];
  }
  static reset() {
    MockIntersectionObserver.instances = [];
  }
}
