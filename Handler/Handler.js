const Discord = require('discord.js')

const EventEmitter = require('events')
const Commandloader = require('./loaders/Command_loader.js')
const Eventloader = require('./loaders/Event_loader.js')

module.exports = class Handler {
    constructor(client, Options = {}) {
        if (typeof Options !== "object" || Array.isArray(Options)) {
            console.log('[Handler Error] The Handler options must be a object where the options are in')
            process.exit(1)
        }
        this.Options = Options
        this.stats = {}
        this.client = client

        this.Commandloader = new Commandloader(this.client, this);
        this.Eventloader = new Eventloader(this.client, this);
    }
    async loadall() {
        console.log('\x1b[34m[Handler]\x1b[0m wczytywanie funkcji')
        await this.Commandloader.load()
        await this.Eventloader.load()
        console.log('\x1b[34m[Handler]\x1b[0m funkcjie wczytane\n')
    }
}