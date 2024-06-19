const Discord = require("discord.js");
const voice = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");

const Search = require("./Search.js");
const Player = require("./Player.js");

module.exports = class Queue {
    #FMP;
    constructor(FMP) {
        this.#FMP = FMP;
        // quild settings
        this.TC = undefined;
        this.VC = undefined;
        // queue
        this.songs = [];
        this.nowPlaying = {};
        this.cache = {};
        // player settings
        this.player = undefined;
        this.loop = 0;
    }
    // internal vunctions
    async _init() {
        if(!this.player) {
            this.player = new Player(this);
            this.player.play(this.songs[0])
        } else {
            return;
        }
    }
    async _next() {

    }
    async _dev() {
        console.log(this.songs)
        console.log(this.nowPlaying)
    }
    // public functions
    async play(query, opt) {
        if(!this.VC) {
            if (!opt?.VC) {
                //if(opt?.interaction instanceof Discord.ChatInputCommandInteraction) 
                opt.VC = opt?.interaction?.member?.voice?.channel;
            }
            if (!opt.VC instanceof Discord.VoiceChannel || opt.VC == null) return console.log("/Queue.js@play: user is not in a voice channel");
            this.VC = opt.VC;
        }
        if(!this.TC) {
            if (!opt?.TC) {
                //if(opt?.interaction instanceof Discord.ChatInputCommandInteraction) 
                opt.TC = opt?.interaction?.channel;
            }
            if (!opt.TC instanceof Discord.TextChannel || opt.VC == null) return;
            this.TC = opt.TC;
        }

        let song = await Search(query);
        this.songs.push(song);
        this._init()
        return;
    }
    async stop() {
        await this.player.destroy();
        this.Player = undefined;
        return;
    }
    pause() {
        this.player.pause();
        return;
    }
    resume() {
        this.player.unpause();
        return;
    }
    volume(lvl) {
        this.player.volume(lvl);
        return;
    }
    seek(time) {
        return;
    }
    connect(VC) {
        let connection = voice.getVoiceConnection(VC.guild.id);
        if(!connection) {
            connection = voice.joinVoiceChannel({
                channelId: VC.id,
                guildId: VC.guild.id,
                adapterCreator: VC.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            })
            this.VC = VC
        }
        return;
    }
    disconnect() {
        let connection = voice.getVoiceConnection(id);
        if(connection) connection.destroy();
        this.VC = undefined;
        return;
    }
}