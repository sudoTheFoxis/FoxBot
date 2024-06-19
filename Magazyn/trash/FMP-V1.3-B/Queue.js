const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const voice = require('@discordjs/voice')

const StreamManager = require("./StreamManager.js")
const FilterManager = require("./FilterManager.js")

module.exports = class Queue {
    #FMP
    constructor(FMP) {
        this.#FMP = FMP
        // basic parameters
        this.connection = undefined     // connection with the discord voice channel
        this.VC = undefined             // voicechannel
        this.TC = undefined             // textchannel
        // songs
        this.songs = []                 // all queued songs
        this.nowPlaying = undefined     // current song that is playing right now
        this.cache = undefined          // previously played song
        // stream
        this.StreamManager = new StreamManager(this.#FMP, this)
        this.FilterManager = new FilterManager(this.#FMP, this)
        // Stream Settings
        this._paused = false            // is paused? Boolean (true/false)
        this._loop = 0                  // loop mode 0-disabled, 1-queue, 3-song
        this._volume = 100              // volume
        this._startTime = 0             // the start sime of the song
    }
    get currentTime() {
        return (this.StreamManager.playbackDuration + this._startTime)
    }
    get paused() { return this._paused }
    set paused(mode) { 
        if(typeof mode != 'boolean' || typeof mode != 'string' ) return 1;
        if(mode == "true" || mode == true) return this.pause();
        if(mode == "false" || mode == false) return this.resume();
        return 1;
    }
    get loop() {return this._loop}
    set loop(mode) {
        this.loop(mode)
    }
    get volume() {return this._volume}   
    set volume(lvl) {
        this.volume(lvl)
    }
    playSong() {
        if (!this.nowPlaying) {
            if (this.songs.length <= 0) return console.log("nie ma żadnej muzyki do odtworzenia");
            this.nowPlaying = this.songs.shift()
            this._paused = false
        }
        this.StreamManager.Start()
        return 0;
    }
    stop() {
        this.songs = []
        this.nowPlaying = undefined
        this.cache = undefined
        this._paused = true
        this.StreamManager.Stop()
        return 0;
    }
    pause() {
        this._paused = true
        this.StreamManager.pause()
        return 0;
    }
    resume() {
        this._paused = false;
        this.StreamManager.resume()
        return 0;
    }
    volume(lvl) {
        this._volume = lvl
        let newlvl = Math.pow(this._volume / 100, 0.5 / Math.log10(2))
        this.StreamManager.volume(newlvl)
        return 0;
    }
    skip() {

    }
    move() {

    }
    seek() {
        
    }
    loop(mode) {
        if(typeof mode == "string") {
            mode = mode.toLowerCase()
            if(mode == "none") mode = 0
            if(mode == "song") mode = 1
            if(mode == "queue") mode = 2
        }
        if(mode != 0 || mode != 2 || mode != 3) return 1;

        if(mode == 1 && this.cache) { 
            this.songs.push(this.cache)
            this.cache = undefined
        }
        this._loop = mode
        return 0;
    }
    async np() {
        return await this.nowPlaying.getDetails();
    }
}
