const Discord = require("discord.js")
const voice = require("@discordjs/voice")

const EventEmitter = require("events")

module.exports = class FMP extends EventEmitter {
    #client    
    constructor(client, options) {
        super()
        this.#client = client;
        // ==================== utilities
        this.OptionsValidate = require("./utilities/OptionsValidate.js");
        this.utilities = require("./utilities/utilities.js");
        this.color = require("./utilities/color.js");
        // ==================== options validation
        this.options;
        if (options?.disableValidation == true) {
            this.options = options;
        } else {
            this.options = this.OptionsValidate(options);
        }
        // ==================== setting up Debug/Error code handlers
        this.Error = (code, ...args) => require("./interface/ErrorHandler.js")(this.options.hideErrors, code, args);
        this.Debug = (code, ...args) => require("./interface/DebugHandler.js")(this.options.showDebug, code, args);
        this.Info = (code, ...args) => require("./interface/InfoHandler.js")(this.options.showInfo, code, args);
        // ==================== setting up other clases/functions
        if(this.options.showDebug = true) {
            this.#client.once('ready', () => {
                this.Error("FMP#DEBUG")
                this.Debug("FMP#DEBUG")
                this.Info("FMP#DEBUG")
            })
        }
        this.QueueManager = new (require("./QueueManager.js"))(this);
        this.Search = require("./Search.js");
    }
    get client() {
        return this.#client;
    }
    play(query, opt) {
        /**
         * @description 
         * @input opt.id          - {Discord.Guild.id}     id of queue/guild
         * @input opt.VC          - {Discord.VoiceChannel} voice channnel
         * @input opt.TC          - {Discord.TextChannel}  text channel
         * @input opt.interaction - {Discord.Interaction}  interaction
         */
        this.Debug("FMP#PLAY");
        if (!opt?.id) {
            opt.id = opt?.interaction?.guild?.id;
        }
        if(typeof opt.id != "string") return this.Info("FMP#PLAY@BID");
        let queue = this.QueueManager.get(opt.id);
        if (!queue) queue = this.QueueManager.create(opt.id);
        queue.play(query, { 
            interaction: opt.interaction, 
            VC: opt.VC, 
            TC: opt.VC 
        })
        return 0;
    }
    stop(id) {
        /**
         * @description 
         * @input id - {Discord.Guild.id} id of queue/guild
         */
        this.Debug("FMP#STOP");
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return this.Info("FMP#STOP@BID");
        let queue = this.QueueManager.get(id);
        if (!queue) return this.Info("FMP#STOP@QDE");
        return queue.stop();
    }
    pause(id) {
        /**
         * @description 
         * @input id - {Discord.Guild.id} id of queue/guild
         */
        this.Debug("FMP#PAUSE");
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return this.Info("FMP#PAUSE@BID");
        let queue = this.QueueManager.get(id);
        if (!queue) return this.Info("FMP#PAUSE@QDE");
        return queue.pause();
    }
    resume(id) {
        /**
         * @description 
         * @input id - {Discord.Guild.id} id of queue/guild
         */
        this.Debug("FMP#RESUME");
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return this.Info("FMP#RESUME@BID");
        let queue = this.QueueManager.get(id);
        if (!queue) return this.Info("FMP#RESUME@QDE");
        return queue.resume();
    }
    volume(id, lvl) {
        /**
         * @description 
         * @input id - {Discord.Guild.id} id of queue/guild
         */
        this.Debug("FMP#VOLUME");
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return this.Info("FMP#VOLUME@BID");
        let queue = this.QueueManager.get(id);
        if (!queue) return this.Info("FMP#VOLUME@QDE");
        return queue.volume(lvl);
    }
    seek(id, time) {
        this.Debug("FMP#SEEK")
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return this.Info("FMP#SEEK@BID");
        let queue = this.QueueManager.get(id);
        if (!queue) return this.Info("FMP#SEEK@QDE");
        return queue.seek(time)
    }
    nowPlaying(id) {
        /**
         * @description 
         * @input id - {Discord.Guild.id} id of queue/guild
         */
        this.Debug("FMP#NOWPLAYING");
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return this.Info("FMP#NOWPLAYING@BID");
        let queue = this.QueueManager.get(id);
        if (!queue) return this.Info("FMP#NOWPLAYING@QDE");
        return queue?.nowPlaying;
    }
    connect(VC) {
        /**
         * @description 
         * @input VC - {Discord.VoiceChannel} voice channel
         */
        this.Debug("FMP#CONNECT");
        if(VC instanceof Discord.ChatInputCommandInteraction) {
            VC = VC.member?.voice?.channel;
        }
        if (!VC instanceof Discord.VoiceChannel || VC == null) return this.Info("FMP#CONNECT@BVC");
        let queue = this.QueueManager.get(VC.guild.id);
        if (!queue) {
            let connection = voice.getVoiceConnection(VC.guild.id);
            if(!connection) {
                connection = voice.joinVoiceChannel({
                    channelId: VC.id,
                    guildId: VC.guild.id,
                    adapterCreator: VC.guild.voiceAdapterCreator,
                    selfDeaf: false,
                    selfMute: false
                })
            }
            return connection;
        }
        return queue.connect(VC);
    }
    disconnect(id) {
        /**
         * @description 
         * @input id - {Discord.Guild.id} id of queue/guild
         */
        this.Debug("FMP#DISCONNECT");
        if(id instanceof Discord.ChatInputCommandInteraction) {
            id = id.guild.id;
        }
        if (typeof id != "string") return this.Info("FMP#DISCONNECT@BID");
        let queue = this.QueueManager.get(id);
        if(!queue) {
            let connection = voice.getVoiceConnection(id);
            if(!connection) return this.Info("FMP#DISCONNECT@CDE");
            connection.destroy();
            return 0;
        }
        return queue.disconnect();
    }
    getQueue(id) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        return this.QueueManager.get(id);
    }
}
/**
 * @name FoxMusicPlayer
 * @author Discord: matix2023
 * @description small but powerful custom music player
 * @note it's not very "idiot" proof, but dev friendly :)
 */