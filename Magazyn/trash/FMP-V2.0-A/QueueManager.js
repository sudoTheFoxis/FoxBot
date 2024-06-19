const Queue = require("./modules/Queue.js")
const Dsicord = require("discord.js")

module.exports = class GuildManager {
    constructor(FMP) {
        this.FMP = FMP
        this.cache = new Map()
    }
    getQueueList() {
        this.FMP.Debug("QM#GETQUEUELIST")
        return this.cache
    }
    create(id) {
        this.FMP.Debug("QM#CREATE")
        let queue = new Queue(this.FMP)
        this.cache.set(id, queue)
        return this.cache.get(id)
    }
    delete(id) {
        this.FMP.Debug("QM#DELETE")
        this.cache.delete(id)
        return;
    }
    get(id) {
        this.FMP.Debug("QM#GET")
        return this.cache.get(id)
    }
}