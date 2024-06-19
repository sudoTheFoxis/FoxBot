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
        this.nowPlaying = {}            // current song that is playing right now
        this.cache = {}                 // previously played song
        // stream
        this.StreamManager = new StreamManager(this)
        this.FilterManager = new FilterManager(this.FMP, this)
        // Stream Settings
        this._paused = false            // is paused? Boolean (true/false)
        this._loop = 0                  // loop mode 0-disabled, 1-queue, 3-song
        this._volume = 100              // volume
        this._startTime = 0             // the start sime of the song
    }
    async fix() {
        this._startTime = this.currentTime;
        await this.StreamManager.destroy()
        if(typeof this._paused != "boolean") this._paused = false;
        if(this._loop != 0 && this._loop != 1 && this._loop != 2) this._loop = 0;
        if(typeof this._volume != "number"  || this._volume <= 0 ) this._volume = 100;
        if(typeof this._startTime != "number" || this._startTime < 0 ) this._startTime = 0;

        if(this._startTime >= Number(this.nowPlaying.duration)) return this.skip();
        /*if(!this.nowPlaying) {
            if(this.songs[0]) {
                this.nowPlaying = this.songs.shift();
            } else {
                this.nowPlaying = this.cache;
                this.cache = {};
            }
        }*/
        this.StreamManager.create()
    }
    //get filters() {return this.FilterManager.get()}
    /*set filters(filters) {
        this.FilterManager.clear()
        this.FilterManager.add(filters)
        return 0;
    }*/
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
    play() {
        if (!this.nowPlaying) {
            if (this.songs.length <= 0) return console.log("nie ma żadnej muzyki do odtworzenia");
            this.nowPlaying = this.songs.shift()
            this._paused = false
        }
        this.StreamManager.create()
        return 0;
    }
    stop() {
        this.songs = []
        this.nowPlaying = {}
        this.cache = {}
        this._paused = true
        this.StreamManager.destroy()
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
        let newlvl = (this._volume / 100)
        this.StreamManager.volume(newlvl)
        return 0;
    }
    loop(mode) {
        if(typeof mode == "string") {
            mode = mode.toLowerCase()
            if(mode == "none") mode = 0
            if(mode == "song") mode = 1
            if(mode == "queue") mode = 2
        }
        if(mode != 0 || mode != 2 || mode != 3) return 1;
        this._loop = mode
        return 0;
    }
    skip() {

    }
    move() {

    }
    seek() {
        
    }
    async np() {
        let nowPlayingDetails = await this.nowPlaying.getDetails()
        return nowPlayingDetails;
    }
}


/*
jump
skip

move
seek 
*/
/* 
    seek(time) {
        // if number ( 10 ) seek (move the time forward or backward 10sek/-10sek ) 
        // if string (12:54) conwert to seconds and jump (play the song from 12:54)
        // if song has been seeked out of ther duration, player will emit hte song end event
        // if song has been seeket before ther duration, player will play the song from start (00:00)
        //(this.PlayerCache.audioResource?.playbackDuration ?? 0) / 1000 + this._startTime;
        this._startTime = this.currentTime + time
        this.StreamManager.create()
        return 0;
    }
    skip(number) {
        if(typeof number != "number" && number <= 0) number = 1;

        if(this._loop == 2) {
            this.songs.push(this.nowPlaying)
            this.nowPlaying = this.songs.shift()
            if(this._paused != false) return; 
        } else {
            this.cache = this.nowPlaying
            this.nowPlaying = this.songs.shift()
            if(this._paused != false) return; 
        }
        this._startTime = 0;
        this.StreamManager.create()
    }
*/
/* 
        // proces ffmpeg (prism-media) =================================================================
        let args = [
            "-analyzeduration","0",
            "-loglevel","0",
            "-ar","48000",
            "-ac","2",
            "-f","s16le",//"opus", "-acodec", "libopus"
            "-ss", "60"
        ]
        if (typeof this._startTime === "number") { // seek function not work
            if (this._startTime > 0) {args.unshift("-ss", this._startTime.toString());} 
            else {this._startTime = 0}
        } 
        this._filters.size ? ["-af", this._filters.values.map(f => f.value).join(",")] : [];
        this.PlayerCache.ffmpegStream = new prism.FFmpeg({ args, shell: false })
        // dodawanie eventów oraz z jakiegoś powodu aktywowanie samej konwersji
        this.PlayerCache.ffmpegStream 
            .on("data", (data) => console.log(`[FFmpeg] data package has been retrieved`))
            .on('error', (error) => console.log(`[FFmpeg] Encoding Error:\n ${error.message}`))
            .on('exit', () => console.log('[FFmpeg] Video recorder exited'))
            .on('close',  () => console.log('[FFmpeg] Video recorder closed'))
            .on('end', () => console.log('[FFmpeg] Video Transcoding succeeded'));
        this.PlayerCache.stream.pipe(this.PlayerCache.ffmpegStream) 
*/


/*
    get loop() {return this._loop}
    set loop(mode) {this._loop = mode}
    get paused() { return this._paused }
    set paused(mode) { this._paused = mode }
    get volume() {return this._volume}   
    set volume(lvl) {this._volume = lvl}
    get filters() {return this._filters}
    set filters(filters) {this._filters = filters}
*/