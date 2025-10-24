class EventEmitter {
    static instance: EventEmitter;
    events = {};

    constructor() {
        if (EventEmitter.instance) {
            return EventEmitter.instance;
        }
        EventEmitter.instance = this;
        console.log("EventEmitter instance created", this.events);
    }

    // 订阅事件
    on(eventName, callback) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(callback);

        // 返回取消订阅的函数
        return () => {
            this.off(eventName, callback);
        };
    }

    // 发布事件
    emit(eventName, ...args) {
        const callbacks = this.events[eventName];
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback.apply(null, args);
                } catch (error) {
                    console.error(`Error executing callback for event "${eventName}":`, error);
                }
            });
        }
    }

    // 取消订阅
    off(eventName, callback) {
        const callbacks = this.events[eventName];
        if (callbacks) {
            if (callback) {
                const index = callbacks.indexOf(callback);
                if (index > -1) {
                    callbacks.splice(index, 1);
                }
            } else {
                // 如果没有传入具体的回调函数，则清空该事件的所有订阅
                delete this.events[eventName];
            }
        }
    }

    // 一次性订阅
    once(eventName, callback) {
        const onceWrapper = (...args) => {
            callback.apply(null, args);
            this.off(eventName, onceWrapper);
        };
        this.on(eventName, onceWrapper);
    }

    // 获取所有事件名称
    eventNames() {
        return Object.keys(this.events);
    }

    // 清空所有订阅
    removeAllListeners(eventName) {
        if (eventName) {
            delete this.events[eventName];
        } else {
            this.events = {};
        }
    }
}

export default EventEmitter;