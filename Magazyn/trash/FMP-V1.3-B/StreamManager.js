const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const voice = require('@discordjs/voice')

module.exports = class StreamManager {
    /**
     * @description klasa przeznaczona do przechowywania wszystkich informacji o aktualnie odtwarzanej muzyce, 
     * oraz umorzliwiająca jego edycje (nałożenie filtrów, zapauzowanie, przewijanie, zmiane głośności)
     * @param {String} url link do muzyki
     */
    #Queue
    #FMP
    #Lock
    #ErrCount

    #Stream
    #audioResource
    #audioPlayer

    constructor(FMP, Queue) {
        this.#Queue = Queue                   // link to queue where the player are in
        this.#FMP = FMP                       // link to FMP main class

        this.#audioPlayer = undefined         // discord audio player
        this.#Lock = false                    // boolean, if != false, no one event function will be executed to avoid overlapping   
        this.#ErrCount = 0
    }
    get playbackDuration() {
        return (this.#audioResource?.playbackDuration ?? 0) / 1000;
    }
    Stop() {
        this.#Lock = true;

        this.#Stream = undefined;
        if(this.#audioPlayer) { 
            this.#audioPlayer.removeAllListeners();
            this.#audioPlayer.stop(); 
        }
        this.#audioPlayer = undefined

        this.#Lock = false;
    }
    Start() { // execute create() (on Start)
        //if(this.#Lock != false) return console.log("[StreamManager] Start: Aborting #Start call, #Lock != false") 
        this.#Lock = true;
        //==============
        this.#Stream = undefined;
        if(this.#audioPlayer) { 
            this.#audioPlayer.removeAllListeners();
            this.#audioPlayer.once("error", err => {});
            this.#audioPlayer.stop(); 
        }
        this.#audioPlayer = undefined;
        //==============
        if(!this.#Queue.nowPlaying ) this.#Queue.nowPlaying = this.#Queue.songs.shift();
        if (this.#Queue?.nowPlaying?.url == undefined) return console.log("[StreamManager] Start: nowPlaying.url == undefined, aborting");
        if(!this.#Queue.connection) { this.#Queue.connection = voice.joinVoiceChannel({
                channelId: this.#Queue.VC.id,
                guildId: this.#Queue.VC.guild.id,
                adapterCreator: this.#Queue.VC.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
        })}

        let currentTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
        if(this.#Queue.nowPlaying.duration <= (currentTime+1)) {
            console.log("[StreamManager] Start: (#Queue.nowPlaying.duration <= currentTime) is true, skipping song");
            return this.End();
        }

        // ========================================================================================
        let ytdlStream = ytdl(this.#Queue.nowPlaying.url, this.#FMP.Options.ytdlOptions)
            .on('error', () => console.log(`[YTDL-CORE] ERROR: Video stream error`))
            .on('end', () => {console.log('[YTDL-CORE] END: Video stream ended !')});

        if ( this.#Queue._startTime > 0 || this.#Queue.FilterManager.getFormatted().length > 0 ) {
            this.#Stream = ffmpeg({ source: ytdlStream, priority: 5 })
                .noVideo()  
                .audioChannels(2)
                .audioBitrate(this.#Queue.VC.bitrate)
                .setStartTime(this.#Queue._startTime) //.seek(60)
                .audioFilters(this.#Queue.FilterManager.getFormatted())
                .format("s16le") // Raw
                //.format('opus') // Arbitrary
                //.audioCodec('opus')
                //.audioFrequency(48000)
                .on('error', () => console.log(`[FFmpeg] ERROR: Encoding Error`))
                .on('exit', () => console.log('[FFmpeg] EXIT: Video recorder exited'))
                .on('close',  () => console.log('[FFmpeg] CLOSE: Video recorder closed'))
                .on('end', () => console.log('[FFmpeg] END: Video Transcoding succeeded !'))
            console.log("[StreamManager] started streaming with the help of the ffmpeg module")
        } else {
            console.log("[StreamManager] started streaming without using the ffmpeg module")
            this.#Stream = ytdlStream
        }
        // ========================================================================================
        this.#Lock = false;

        this.#audioResource = voice.createAudioResource(this.#Stream, { 
            //inputType: voice.StreamType.Raw,
            inlineVolume: true,
        })
        this.#audioResource?.volume?.setVolume(Math.pow(this.#Queue._volume / 100, 0.5 / Math.log10(2)))

        this.#audioPlayer = voice.createAudioPlayer() 
            .once("error", error => {
                //if(this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting error event execution");
                this.Error();
                return;
            })
            .once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                if (newState.status == "idle") {
                    //if(this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting error event execution");
                    this.End();
                    return;
                }
            })
        if (this.#Queue._paused == true) {
            this.#audioPlayer.pause()
        } else if (this.#Queue._paused == false) {
            this.#audioPlayer.unpause()
        }
        this.#Queue.connection.subscribe(this.#audioPlayer)
        this.#audioPlayer.play(this.#audioResource)
    }
    End(end = false) {
        /**
         * @description cleaning, validating song end, pushing queue and playing next song
         */
        if(this.#Lock != false) return console.log("[StreamManager] End: Aborting #End call, #Lock != false") 
        this.#Lock = true;

        let currentTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
        console.log(this.#Queue.nowPlaying.duration, " <= ", (currentTime+1))
        //==============
        this.#Stream = undefined;
        if(this.#audioPlayer) { 
            this.#audioPlayer.removeAllListeners();
            this.#audioPlayer.once("error", err => {});
            this.#audioPlayer.stop(); 
        }
        this.#audioPlayer = undefined;
        //==============
        if(end != false) return console.log("[StreamManager] End: stream ended");

        if(this.#Queue.nowPlaying.duration >= (currentTime+1)) {
            console.log("[StreamManager] End: false call of song end, (#Queue.nowPlaying.duration >= currentTime) is true, restarting stream");
            this.#Queue._startTime = currentTime
            return this.Start();
        }

        console.log("[StreamManager] End: The song finished");
        this.#ErrCount = 0;
        this.#Queue._startTime = 0;
        if (this.#Queue._loop == 2) { // Queue loop
            this.#Queue.songs.push(this.#Queue.nowPlaying)
            this.#Queue.nowPlaying = this.#Queue.songs.shift()
            if (this.#Queue._paused != false) return;
        } else if (this.#Queue._loop == 1) { // Song loop
            if (this.#Queue._paused != false) return;
        } else { // no loop
            this.#Queue.cache = this.#Queue.nowPlaying;
            this.#Queue.nowPlaying = this.#Queue.songs.shift()
            if (this.#Queue._paused != false) return;
        }
        console.log("[StreamManager] End: initializing next song");
        this.#Lock = false;
        return this.Start();
    }
    Error() { // Recovery the current playing song (on Error)
        /**
         * @description cleaning and Recovering song
         */
        if(this.#Lock != false) return console.log("[StreamManager] Error: Aborting #Error call, #Lock != false") 
        this.#Lock = true;

        let currentTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
        //==============        
        this.#Stream = undefined;
        if(this.#audioPlayer) { 
            this.#audioPlayer.removeAllListeners();
            this.#audioPlayer.once("error", err => {});
            this.#audioPlayer.stop(); 
        }
        this.#audioPlayer = undefined
        //==============
        if (this.#FMP.Options.maxSelfRecovery > 0 && this.#ErrCount >= this.#FMP.Options.maxSelfRecovery) {
            console.log("[StreamManager] Error: #ErrCount reached the maximum number of Recovery attempts: " + this.#FMP.Options.maxSelfRecovery + ", skipping song...") 
            this.#Lock = false;
            return this.End();
        }
        this.#ErrCount++
        this.#Queue._startTime = currentTime
        this.#Lock = false;
        return this.Start();
    }  
    pause() {
        this.#audioPlayer.pause()
        return 0;
    }
    resume() {
        this.#audioPlayer.unpause()
        return 0;
    }
    volume(lvl) {
        this.#audioResource?.volume?.setVolume(lvl)
        return 0;
    }
}
