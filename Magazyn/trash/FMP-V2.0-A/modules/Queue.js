const Discord = require("discord.js")
const voice = require("@discordjs/voice")

const FilterManager = require("./FilterManager.js")
const Player = require("./Player.js")
const Search = require("../Search.js")

module.exports = class Queue {
    #FMP
    constructor(FMP) {
        this.#FMP = FMP
        // quild settings
        this.TC = undefined;
        this.VC = undefined;
        this.player = undefined;
        this.buffor = undefined
        // queue
        this.songs = [];
        this.nowPlaying = {};
        this.cache = {};
        // player settings
        this.volume = 100;
        this.startTime = 10;
        this.paused = false;
        this.loop = 0;
        this.filters = [];

        this.FilterManager = new FilterManager(this);
    }
    async init() {
        this.#FMP.Debug("QUEUE#INIT")
        //this.player?.status != undefined
        if(this.player?.status && this.player?.status != "destroyed") {
            await this.player.stop()
        }
        this.player = new Player(this);
    }
    async play(query, opt) {
        query = "https://www.youtube.com/watch?v=U_72tQoTNrE&list=PLWJniho8kcLeMUz4gWe6MUiC7fw2qfLKf&index=1";
        /**
         * @description 
         * @input opt.VC          - {Discord.VoiceChannel} voice channnel
         * @input opt.TC          - {Discord.TextChannel}  text channel
         * @input opt.interaction - {Discord.Interaction}  interaction
         */
        this.#FMP.Debug("QUEUE#PLAY")
        if(!this.VC) {
            if (!opt?.VC) {
                //if(opt?.interaction instanceof Discord.ChatInputCommandInteraction) 
                opt.VC = opt?.interaction?.member?.voice?.channel;
            }
            if (!opt.VC instanceof Discord.VoiceChannel || opt.VC == null) return this.#FMP.Info("QUEUE#PLAY@BVC");
            this.VC = opt.VC
        }
        if(!this.TC) {
            if (!opt?.TC) {
                //if(opt?.interaction instanceof Discord.ChatInputCommandInteraction) 
                opt.TC = opt?.interaction?.channel;
            }
            if (!opt.TC instanceof Discord.TextChannel || opt.VC == null) return this.#FMP.Info("QUEUE#PLAY@BTC");
            this.TC = opt.TC
        }
        let search = await Search(query)
        //if(!this.nowPlaying?.type) {
            this.nowPlaying = search;
            this.init()
        //}
        return 0;
    }
    stop() {
        /**
         * @description 
         */
        this.#FMP.Debug("QUEUE#STOP")
        this.player.stop()
        return 0;
    }
    pause() {
        /**
         * @description 
         */
        this.#FMP.Debug("QUEUE#PAUSE")
        this.player.pause()
        return 0;
    }
    resume() {
        /**
         * @description 
         */
        this.#FMP.Debug("QUEUE#RESUME")
        this.player.unpause()
        return 0;
    }
    volume(lvl) {
        this.#FMP.Debug("QUEUE#VOLUME")
        this.player.volume(lvl)
        return 0;
    }
    seek(time) {
        this.#FMP.Debug("QUEUE#SEEK")
        if (!isNaN(+time)) {
            console.log(this.player.duration)
            this.startTime =+ time;
            console.log("seek: ",this.startTime)

        } else {
            time = this.#FMP.utilities.toSeconds(time)
            if(isNaN(+time)) return this.#FMP.Info("QUEUE#SEEK@ITF")
            this.startTime = time;
            console.log("jump: ",this.startTime)
        }
        this.init()
        return 0;
    }
    connect(VC) {
        this.#FMP.Debug("QUEUE#CONNECT")
        if(VC instanceof Discord.ChatInputCommandInteraction) {
            VC = VC.member?.voice?.channel;
        }
        if(!VC || !VC instanceof Discord.VoiceChannel) return this.#FMP.Info("QUEUE#CONNECT@BCV")
        this.VC = VC;

        if((!this.player || this.player?.destroyed == true)) {
            this.player = new Connection(this.#FMP, this);
        }
        return 0;
    }
    disconnect() {
        this.#FMP.Debug("QUEUE#DISCONNECT")
        if(this.player?.status && this.player?.status != "destroyed") {
            this.player.stop()
        }
        let connection = voice.getVoiceConnection(this.VC.guild.id)
        connection.destroy()
        return 0;
    }
}