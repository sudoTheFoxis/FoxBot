const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const voice = require('@discordjs/voice')

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
        this.PlayerCache = {}
        this._FilterManager = new FilterManager(this.FMP, this)
        this._paused = false            // is paused? Boolean (true/false)
        this._loop = 0                  // loop mode 0-disabled, 1-queue, 3-song
        this._volume = 100              // volume
        this._startTime = 0             // the start sime of the song
    }
    async createPlayer() {
        if(!this.connection) { 
            this.connection = voice.joinVoiceChannel({
                channelId: this.VC.id,
                guildId: this.VC.guild.id,
                adapterCreator: this.VC.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
        })}
        let player = this.connection._state.subscription?.player
        if(player) await player.stop(); 
        this.PlayerCache = {}
        // źródło audio =================================================================
        this.PlayerCache.stream = ytdl(this.nowPlaying.url, { 
            quality: 'highestaudio', 
            filter: 'audioonly'
        })
            .on('error', (err) => {
                console.log(`[YTDL-CORE] Video stream error:\n ${err}\n[ytdl-core] restarting stream...`)
                this._startTime = (this.PlayerCache.audioResource?.playbackDuration ?? 0) / 1000 + this._startTime;
                this.createPlayer()
            })
            .on('end', () => console.log('[YTDL-CORE] Video stream ended !'));

        
        // "asetrate=48000*1.25,aresample=48000,bass=g=5","bass=g=40,dynaudnorm=f=300,asubboost,volume=2"
        
        this.PlayerCache.ffmpegStream = ffmpeg({ source: this.PlayerCache.stream, priority: 5 })
            .noVideo()  
            .audioChannels(2)
            .audioBitrate(this.VC.bitrate)
            .setStartTime(this._startTime) //.seek(60)
            .audioFilters(filters)
            .format("s16le") // Raw
            //.format('opus') // Arbitrary
            //.audioCodec('opus')
            //.audioFrequency(48000)
            .on('error', error => console.log(`[FFmpeg] Encoding Error: ${error.message}`))
            .on('exit', () => console.log('[FFmpeg] Video recorder exited'))
            .on('close',  () => console.log('[FFmpeg] Video recorder closed'))
            .on('end', () => console.log('[FFmpeg] Video Transcoding succeeded !'))

        // konwersja streamu na czytalny przez discord strumień audio 
        this.PlayerCache.audioResource = voice.createAudioResource(this.PlayerCache.ffmpegStream, { 
            inputType: voice.StreamType.Raw,
            inlineVolume: true,
        })
        this.PlayerCache.audioResource?.volume?.setVolume(Math.pow(this._volume / 100, 0.5 / Math.log10(2)))
        //tworzenie playera audio
        this.PlayerCache.audioPlayer = voice.createAudioPlayer() 
            .on("error", error => {console.log("[audioPlayer] error has been retrived")});
        this.connection.subscribe(this.PlayerCache.audioPlayer)
        this.PlayerCache.audioPlayer.play(this.PlayerCache.audioResource)

    }
    async play() {
        if (!this.nowPlaying) {
            if (this.songs.length <= 0) return console.log("nie ma żadnej muzyki do odtworzenia");
            this.nowPlaying = this.songs.shift()
        }
        this.createPlayer()
    }
    async stop() {
        // destroy queue
        //this.nowPlaying = {}
        //if(this.PlayerCache.ffmpegStream) await this.PlayerCache.ffmpegStream.kill(); //'SIGKILL'
        //this.PlayerCache.ffmpegStream = undefined;
        //if(this.PlayerCache.audioResource) await this.PlayerCache.audioResource.destroy()
        //this.PlayerCache.audioResource = undefined;
        if(this.PlayerCache.audioPlayer) await this.PlayerCache.audioPlayer.stop()
        this.PlayerCache = {}
    }
    async pause() {
        this._paused = true
        this.PlayerCache.audioPlayer.pause()
    }
    async resume() {
        this._paused = false;
        this.PlayerCache.audioPlayer.unpause()
    }
    async volume(lvl) {
        this._volume = lvl
        let newlvl = Math.pow(this._volume / 100, 0.5 / Math.log10(2))
        this.PlayerCache.audioResource?.volume?.setVolume(newlvl)
    }
    async seek(time) {
        // if number ( 10 ) seek (move the time forward or backward 10sek/-10sek ) 
        // if string (12:54) conwert to seconds and jump (play the song from 12:54)
        // if song has been seeked out of ther duration, player will emit hte song end event
        // if song has been seeket before ther duration, player will play the song from start (00:00)
        let currentTime = (this.PlayerCache.audioResource?.playbackDuration ?? 0) / 1000 + this._startTime;
        this._startTime = currentTime + time
        this.createPlayer()
    }


}
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