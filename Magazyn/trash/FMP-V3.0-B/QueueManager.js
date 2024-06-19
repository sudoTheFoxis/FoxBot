const Queue = require("./Queue.js")
const Dsicord = require("discord.js")

module.exports = class GuildManager {
    constructor(FMP) {
        this.FMP = FMP
        this.cache = new Map()
    }
    getQueueList() {
        return this.cache
    }
    create(id) {
        let queue = new Queue(this.FMP)
        this.cache.set(id, queue)
        return this.cache.get(id)
    }
    delete(id) {
        this.cache.delete(id)
        return;
    }
    get(id) {
        return this.cache.get(id)
    }
}