const Discord = require("discord.js");
const voice = require("@discordjs/voice");

const EventEmitter = require("events");

module.exports = class FMP extends EventEmitter {
    #client;
    constructor(client) {
        super();
        this.#client = client;
        this.options = {
            // comon options
            selfRecovery: true,         // after stream crash, renewing the same song in exact time (can take some time to recovery)
            maxSelfRecovery: 3,         // the number of maximum self-retrieval attempts, beyond which the music will be skipped
            hideErrors: false,          // hide all errors on console
            showDebug: false,         // display debug info, show all FMP actions
            showInfo: false,         // display debug info, show all FMP actions
            joinAsDeaf: false,
            // queue
            pauseWhenEmpty: true,           // pause music when there is noone in vc except the bot
            leaveWhenEmpty: true,           // leave when there is noone in vc except the bot
            leaveWhenEmptyDelay: 30,        // time in seconds
            clearQueueWhenEmpty: false,     // delete queue when there is no one in vc except the bot
            clearQueueWhenEmptyDelay: 60,   // time in seconds
            leaveOnEnd: false,              // leave from vc if queue is end
            leaveOnEndDelay: 30,            // time in seconds
            leaveWhenPaused: false,         // leave from vc if music is paused
            leaveWhenPausedDelay: 60,       // time in seconds    
            // default filter tabble
            FilterList: {
                "vaporwave": "asetrate=48000*0.8,aresample=48000,atempo=1.1",   // slow down the music
                "nightcore": "asetrate=48000*1.25,aresample=48000,bass=g=5",   // very fast song
                "purebass": "bass=g=40,dynaudnorm=f=300,asubboost,volume=2",  // almost bass only
                "bassboost": "bass=g=10,dynaudnorm=f=200",          // small boost to the bass
                "HyperBass": "bass=g=20,dynaudnorm=f=250",         // medium boost to the bass
                "karaoke": "stereotools=mlev=0.1",        // like deff music with echo
                "echo": "aecho=0.8:0.9:1000:0.3",        // trash
                "8d": "apulsator=hz=0.10",        // sound around us
                "mcompand": "mcompand",        // something like bad speaker with little echo
                "reverse": "areverse",        // first downloading entire song then reversing it (funny XD)
                "flanger": "flanger",        // like 8d
                "tremolo": "tremolo",      // volume up and down very fast
                "phaser": "aphaser",      // like lineal
                "earwax": "earwax",      // deff sound
                "haas": "haas",      // inverse
            },
            // player settings
            useBuffor: true,
            ytdlOptions: { // settings used for playing from buffor
                quality:"highestaudio",
                filter:"audioonly",
                format:"opus"
            },
            ytdlOptions_live: { // settings used for live playing
                quality: "highestaudio",
                filter: "audioonly",
                highWaterMark: 1 << 25
            },
        }
        this.QueueManager = new (require("./QueueManager.js"))(this);
    }
    get client() {
        return this.#client;
    }
    play(query, interaction) {
        if(!interaction instanceof Discord.ChatInputCommandInteraction) return;
        //
        let queue = this.QueueManager.get(interaction.guild.id);
        if (!queue) queue = this.QueueManager.create(interaction.guild.id);
        //
        return queue.play(query, { interaction });
    }
    stop(id) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return;
        //
        let queue = this.QueueManager.get(id);
        //
        if (!queue) return;
        return queue.stop();
    }
    pause(id) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return ;
        //
        let queue = this.QueueManager.get(id);
        //
        if (!queue) return;
        return queue.pause();
    }
    resume(id) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return;
        //
        let queue = this.QueueManager.get(id);
        //
        if (!queue) return;
        return queue.resume();
    }
    volume(id, lvl) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return;
        //
        let queue = this.QueueManager.get(id);
        //
        if (!queue) return;
        return queue.volume(lvl);
    }
    seek(id, time) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return;
        //
        let queue = this.QueueManager.get(id);
        //
        if (!queue) return;
        return queue.seek(time);
    }
    nowPlaying(id) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        if(typeof id != "string") return;
        //
        let queue = this.QueueManager.get(id);
        //
        if (!queue) return;
        return queue?.nowPlaying;
    }
    connect(VC) {
        if(VC instanceof Discord.ChatInputCommandInteraction) {
            VC = VC.member?.voice?.channel;
        }
        if (!VC instanceof Discord.VoiceChannel || VC == null) { 
            return;
        }
        //
        let queue = this.QueueManager.get(VC.guild.id);
        //
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
        if(id instanceof Discord.ChatInputCommandInteraction) {
            id = id.guild.id;
        }
        if (typeof id != "string") return;
        //
        let queue = this.QueueManager.get(id);
        //
        if(!queue) {
            let connection = voice.getVoiceConnection(id);
            if(!connection) return;
            connection.destroy();
            return;
        }
        return queue.disconnect();
    }
    getQueue(id) {
        if(id instanceof Discord.ChatInputCommandInteraction) id = id.guild.id;
        return this.QueueManager.get(id);
    }
}