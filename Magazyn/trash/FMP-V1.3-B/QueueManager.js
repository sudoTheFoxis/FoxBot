const QueueList = new Map()
const Queue = require("./Queue.js")

module.exports = class QueueManager {
    constructor(FMP) {
        this.FMP = FMP
    }
    getQueueList() {
        return QueueList;
    }
    create(ID) {
        /**
         * @param {String} ID the id of new Queue
         */
        let queue = new Queue(this.FMP)
        QueueList.set(ID, queue)
        return;
    }
    delete(ID) {
        /**
         * @param {String} ID the id of Queue to delete
         */
        let queue = QueueList.get(ID)
        if (!queue) return undefined;
        QueueList.delete(ID)
        return;
    }
    get(ID) {
        /**
         * @param {String} ID the id of queue to return
         */
        let queue = QueueList.get(ID)
        if (!queue) return undefined;
        return queue;
    }
}