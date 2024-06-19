const Discord = require("discord.js");
const voice = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
const fs = require("fs");

const Search = require("./Search.js");
const Stream = require("./Stream.js");
const { typeOf } = require("mathjs");

module.exports = class Queue {
    #FMP;
    constructor(FMP) {
        this.#FMP = FMP;
        // Discord API Variables
        this.TC = undefined;
        this.VC = undefined;
        this.connection = undefined;
        this.AudioResource = undefined;
        this.AudioPlayer = undefined;
        // Queue Variables
        this.songs = [];
        this.nowPlaying = undefined;
        this.oldPlaying = undefined;
        // Player Variables
        this._stream = undefined; // stream of audio
        this._paused = false;
        this._playing = false;
        this._loop = 0;
        this._startTime = 0;
        this._filters = [];
        this._volume = 100;
        // optymalization settings
        this.Buffor = {};
        this.cache = true; // save song in cache folder
        this.cacheDir = "./FMP-V3.1/cache";
    }
    // ================================================================================ interface functions
    get playing() {return this._playing;}
    set playing(mode) {
        if(mode == false && this._playing == true) return this.stop();
        return;
    }
    get paused() {return this._paused;}
    set paused(mode) {
        if(mode == true) {
            this.AudioPlayer.pause();
        } else {
            this.AudioPlayer.unpause();
        }
        return;
    }
    get volume() {return this._volume;}
    set volume(lvl) {
        this._volume = lvl;
        this.AudioResource?.volume?.setVolume(Math.pow(this._volume / 100, 0.5 / Math.log10(2)));
        return;
    }
    get loop() {return this._loop;}
    set loop(mode) {
        if([0,1,2].includes(Number(mode))) return;
        this._loop = mode;
        return;
    }
    get time() {return this._startTime + (this.AudioResource?.playbackDuration ?? 0) / 1000;}
    set time(time) {
        //this._startTime = this._startTime + (this.AudioResource?.playbackDuration ?? 0) / 1000;
        this._startTime = time;
        this._init();
        return;
    }
    // ================================================================================ public functions
    async play(query, opt) {
        if(!this.VC) {
            if (!opt?.VC) {
                //if(opt?.interaction instanceof Discord.ChatInputCommandInteraction) 
                opt.VC = opt?.interaction?.member?.voice?.channel;
            }
            if (!opt.VC instanceof Discord.VoiceChannel || opt.VC == null) return console.log("/Queue.js@play: user is not in a voice channel");
            this.VC = opt.VC;
        };
        if(!this.TC) {
            if (!opt?.TC) {
                //if(opt?.interaction instanceof Discord.ChatInputCommandInteraction) 
                opt.TC = opt?.interaction?.channel;
            }
            if (!opt.TC instanceof Discord.TextChannel || opt.VC == null) return;
            this.TC = opt.TC;
        };

        let song = await Search(query);
        this.songs.push(song);
        this._init();
        return;
    }
    async stop() {
        this.AudioPlayer.stop();
        if(this._stream?.status < 3) await this._stream.stop();
        this._stream = undefined;
        this.AudioResource = undefined;
        this.AudioPlayer = undefined;
        this.Buffor = {};
        this._playing = false;
        return;
    }
    pause() {
        this.AudioPlayer.pause();
        this._paused = true;
        return;
    }
    resume() {
        this.AudioPlayer.unpause();
        this._paused = false;
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
            });
            this.VC = VC;
        }
        return;
    }
    disconnect() {
        let connection = voice.getVoiceConnection(id);
        if(connection) connection.destroy();
        this.VC = undefined;
        return;
    }
    // ================================================================================ internal vunctions
    async _init(force = false) {
        // some queue validation
        if(!this.nowPlaying) {
            if(!this.songs.length > 0) return console.log("FMP#Queue@_init there are no songs to play");
            this.nowPlaying = this.songs.shift();
        }
        if(this.nowPlaying.isLive == true) return console.log("[FMP#Queue@play]: live content is currently unsupported");
        if(this._playing == true && force == false) return;
        this._playing = true;
        // connect to discord
        this.connection = voice.joinVoiceChannel({
            channelId: this.VC.id,
            guildId: this.VC.guild.id,
            adapterCreator: this.VC.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        })

        // create audio Stream
        let newStream = new (require("./Stream.js"))(this);
        await newStream.init(this.nowPlaying.url);
        newStream.play();
        if(this._stream?.status < 3) await this._stream.destroy();
        this._stream = newStream;
        
        // connect to discord api
        let { stream, type } = await voice.demuxProbe(this._stream.out);
        this.AudioResource = voice.createAudioResource(stream, { inputType: type, inlineVolume: true });
        this.AudioResource?.volume?.setVolume(Math.pow(this._volume / 100, 0.5 / Math.log10(2)));
        this.AudioPlayer = voice.createAudioPlayer()
            .once("error", error => {
                console.log("[FMP#Player@play]: Audio Player Error:\n" + error)
            })
            .once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                if (newState.status == "idle") {
                    this._playing = false;
                    console.log("[FMP#Player@play]: Audio Player End");
                    this._next();
                    return;
                }
            });
        this.connection.subscribe(this.AudioPlayer);
        this.AudioPlayer.play(this.AudioResource);
    }
    async _next() {
        this._stream.stop();
        this.AudioPlayer.stop();
        this._stream = undefined;
        this.AudioPlayer = undefined;
        this.AudioResource = undefined;

        switch(this._loop) {
            case 0: // no loop
                this.oldPlaying = this.nowPlaying;
                if(!this.songs.length > 0) { 
                    this.nowPlaying = undefined;
                    this._playing = false;
                    return;
                }
                this.nowPlaying = this.songs.shift();
                this._init();
                break;
            case 1: // queue loop
                /*
                if(this.oldPlaying) {
                    this.songs.push(this.oldPlaying);
                    this.oldPlaying = undefined;
                }//*/
                this.songs.push(this.nowPlaying);
                this.nowPlaying = this.songs.shift();
                this._init();
                break;
            case 2: // song loop
                this._init();
                break;
        }
    }
}