/**
 * example:
 * // 创建实例
 * const eventBus = new EventBus();
 * 
 * // 订阅事件
 * const id = eventBus.subscribe('event1', (...args) => {
 *  console.log(args); // hello world
 * })
 * // 发布事件
 * eventBus.publish('event1', 'hello', ' world');
 * // 取消订阅
 * eventBus.unsubscribe(id);
 * // 清空 event1 事件的所有订阅
 * eventBus.clearSubscribers('event1');
 * // 清空所有订阅
 * eventBus.clearSubscribers();
 * 
 */

interface IEventCallback {
  (...args: any[]): void;
}

interface EventListener {
  // 监听器id
  id: string;
  // 监听器回调函数
  callback: IEventCallback;
}

interface IEvent {
  // key 订阅事件key值, value 该事件对应的监听器数组
  [key: string]: EventListener[];
}

interface IEventMap {
  // key 监听器id, value 事件名（用于取消订阅时查找）
  [randomUUID: string]: string;
}

class EventBus {
  // 单例模式
  private static instance: EventBus | null = null;
  // key: 事件名, value: 该事件对应的监听器数组
  #events: IEvent = {};
  // key: 监听器id, value: 事件名（用于取消订阅时查找）
  #eventIdMap: IEventMap = {};

  constructor() {
    if (EventBus.instance) {
      console.log('EventBus is a singleton',);
      return EventBus.instance;
    }
    EventBus.instance = this;
    this.#events = {};
  }

  /**
   * 订阅事件
   * @param key 订阅事件key值
   * @param callback 订阅事件回调
   * @returns id 订阅事件唯一值ID
   */
  subscribe(key: string, callback: IEventCallback) {
    if (typeof key !== 'string') {
      return '';
    }
    const id: string = crypto.randomUUID();
    if (!Array.isArray(this.#events[key])) {
      this.#events[key] = [];
    }
    this.#eventIdMap[id] = key;
    this.#events[key].push({
      id,
      callback,
    });
    return id;
  }

  /**
   * 发布事件
   * @param key 订阅事件key值
   * @param args 订阅事件回调参数
   */
  publish(key: string, ...args: any[]) {
    if (typeof key !== 'string') {
      return;
    }
    console.log(`this.#events[key]`, this.#events[key]);
    (this.#events[key] || []).forEach((event) => {
      const { callback } = event || {};
      if (typeof callback === 'function') {
        callback(...args);
      }
    });
  }

  /**
   * 取消订阅
   * @param id 订阅事件唯一值ID
   */
  unsubscribe(id: string) {
    const key = this.#eventIdMap[id];
    if (!key) {
      return;
    }
    this.#events[key] = this.#events[key].filter((event) => event.id !== id);

    // 如果没有监听器了，也可以选择删除 key（可选优化）
    if (this.#events[key].length === 0) {
      delete this.#events[key];
    }

    // 可选：删除 eventIdMap 中的记录
    delete this.#eventIdMap[id];
  }

  /**
   * 清空传入key值的所有订阅，否则清空所有订阅
   * @param key 
   */
  clearSubscribers(key?: string) {
    if (key) {
      this.#events[key] = [];
      // 额外遍历 eventIdMap，删除所有属于该 key 的记录
      for (const id in this.#eventIdMap) {
        if (this.#eventIdMap[id] === key) {
          delete this.#eventIdMap[id];
        }
      }
    } else {
      // 清空所有监听器和映射
      this.#events = {};
      this.#eventIdMap = {};
    }
  }
}

export default new EventBus();