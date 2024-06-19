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
    #stream
    #ffmpeg
    #audioResource
    #audioPlayer
    #FinishAction 
    #Error
    #Lock
    constructor(Queue) {
        this.#Queue = Queue                   // link to queue where the player are in
        this.#stream = undefined              // ytdl stream
        this.#ffmpeg = undefined              // FFmpeg conversion
        this.#audioResource = undefined       // audoResource
        this.#audioPlayer = undefined         // discord audio player
        this.#FinishAction = undefined        // the function that will be executed after finish playing the song
        this.#Lock = false                    // boolean, if true no one event function will be executed to avoid overlapping
    }
    get playbackDuration() {
        return (this.#audioResource?.playbackDuration ?? 0) / 1000;
    }
    async create() {
        if(Object.keys(this.#Queue.nowPlaying).length == 0 ) this.#Queue.nowPlaying = this.#Queue.songs.shift();
        /*if (this.#Queue.nowPlaying instanceof Promise) {
            this.#Queue.nowPlaying = await this.#Queue.nowPlaying;
        }*/
        if (this.#Queue?.nowPlaying?.url == undefined) return console.log("[StreamManager] nowPlaying.url == undefined, aborting");
        
        if(!this.#Queue.connection) { 
            this.#Queue.connection = voice.joinVoiceChannel({
                channelId: this.#Queue.VC.id,
                guildId: this.#Queue.VC.guild.id,
                adapterCreator: this.#Queue.VC.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
        })}
        let oldPlayer = this.#Queue.connection._state.subscription?.player
        if(oldPlayer) await oldPlayer.stop(); 

        let currentTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
        if(currentTime >= (this.#Queue.nowPlaying.duration - 1)) {
            
        }
        this.#Lock = false;
        if (            
            this.#Queue._startTime > 0 ||
            (this.#Queue.FilterManager.get()).size > 0 
        ) {
            console.log("[StreamManager] started streaming with the help of the ffmpeg module")
            // źródło audio =================================================================
            this.#stream = ytdl(this.#Queue.nowPlaying.url, { 
                quality: 'highestaudio', 
                filter: 'audioonly'
            })
                .on('error', async (err) => {
                    if(this.#Lock != false) return console.log("[YTDL-CORE] #Lock != false, aborting error event execution");
                    this.#Lock = true;
                    console.log(`[YTDL-CORE] ERROR: Video stream error:\n ${err}\n[ytdl-core] restarting stream...`)
                    this.#Queue._startTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
                    if(this.#audioPlayer) await this.#audioPlayer.stop();
                    this.create()
                })
                .on('end', () => console.log('[YTDL-CORE] END: Video stream ended !'));
            // ffmpeg =================================================================
            this.#ffmpeg = ffmpeg({ source: this.#stream, priority: 5 })
                .noVideo()  
                .audioChannels(2)
                .audioBitrate(this.#Queue.VC.bitrate)
                .setStartTime(this.#Queue._startTime) //.seek(60)
                .audioFilters(this.#Queue.FilterManager.getFormatted())
                .format("s16le") // Raw
                //.format('opus') // Arbitrary
                //.audioCodec('opus')
                //.audioFrequency(48000)
                .on('error', error => {
                    if(this.#Lock != false) return console.log("[ffmpeg] #Lock != false, aborting error event execution");
                    this.#Lock = true;
                    console.log(`[FFmpeg] ERROR: Encoding Error: ${error.message}`)
                })
                .on('exit', () => console.log('[FFmpeg] EXIT: Video recorder exited'))
                .on('close',  () => console.log('[FFmpeg] CLOSE: Video recorder closed'))
                .on('end', () => {
                    //if(this.#Lock != false) return console.log("[ffmpeg] #Lock != false, aborting end function execution");
                    console.log('[FFmpeg] END: Video Transcoding succeeded !')
                })

            // streamowanie audio na vc =================================================================
            this.#audioResource = voice.createAudioResource(this.#ffmpeg, { 
                inputType: voice.StreamType.Raw,
                inlineVolume: true,
            })
        } else {
            console.log("[StreamManager] started streaming without using the ffmpeg module")
            // źródło audio =================================================================
            this.#stream = ytdl(this.#Queue.nowPlaying.url, { 
                quality: 'highestaudio', 
                filter: 'audioonly'
                //highWaterMark: 1 << 25,
            })
                .on('error', async (err) => {
                    if(this.#Lock != false) return console.log("[YTDL-CORE] #Lock != false, aborting error event execution");
                    this.#Lock = true;
                    console.log(`[YTDL-CORE] ERROR: Video stream error:\n ${err}\n[ytdl-core] restarting stream...`)
                    this.#Queue._startTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
                    if(this.#audioPlayer) await this.#audioPlayer.stop();
                    this.create()
                })
                .on('end', () => {
                    if(this.#Lock != false) return console.log("[YTDL-CORE] #Error != false, aborting end function execution");
                    console.log('[YTDL-CORE] END: Video stream ended !')
                });
            this.#audioResource = voice.createAudioResource(this.#stream, { 
                inputType: voice.StreamType.Arbitrary,
                inlineVolume: true,
            })
        }

        this.#audioResource?.volume?.setVolume((this.#Queue._volume / 100))
        //tworzenie playera audio
        this.#audioPlayer = voice.createAudioPlayer({
            behaviors: {
                noSubscriber: voice.NoSubscriberBehavior.Pause,
            },
        }) 
            .on("error", async error => {
                if(this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting error event execution");
                this.#Lock = true;
                console.log("[audioPlayer] ERROR: error has been retrived:\n", error)
                this.#Queue._startTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
                if(this.#audioPlayer) await this.#audioPlayer.stop();
                this.create() 
            })
            .on(voice.AudioPlayerStatus.Idle, async (oldOne, newOne) => {
                if (newOne.status == "idle") {
                    if(this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting end function execution");
                    this.#Lock = true;
                    let currentTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
                    if(currentTime >= (this.#Queue.nowPlaying.duration - 1)) {
                        console.log("[audioPlayer] STATECHANGE: false call of song end, (Queue.currentTime >= song.duration) is false..., restarting stream");
                        this.#Queue._startTime = currentTime
                        if(this.#audioPlayer) await this.#audioPlayer.stop();
                        this.create() 
                        return;
                    }
                    console.log("[audioPlayer] STATECHANGE: The song finished succesfully, initializing next song");
                    this.#Queue._startTime = 0;
                    if (this.#Queue.songs.length <= 0) return console.log("[audioPlayer] there is no more songs to play")
                    if(this.#Queue._loop == 0) {
                        this.#Queue.cache = this.#Queue.nowPlaying
                        this.#Queue.nowPlaying = this.#Queue.songs.shift()
                        if(this.#Queue._paused != false) return;
                        this.create() 
                        return;
                    }
                    
                }
            })
        if (this.#Queue._paused == true) {
            this.#audioPlayer.pause()
        } else if (this.#Queue._paused == false) {
            this.#audioPlayer.unpause()
        }
        this.#Queue.connection.subscribe(this.#audioPlayer)
        this.#audioPlayer.play(this.#audioResource)
        return 0;
    }
    async destroy() {
        //if(this.#audioResource) await this.#audioResource.destroy()
        this.#Error = true;
        if(this.#audioPlayer) await this.#audioPlayer.stop();
        if(this.#ffmpeg) await this.#ffmpeg.kill('SIGKILL'); //'SIGKILL'

        this.#stream = undefined;
        this.#ffmpeg = undefined;
        this.#audioResource = undefined;
        this.#audioPlayer = undefined;
        this.#Error = false;
        return 0;
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
    addFinishAction(action, override = false) {
        if (typeof action != 'function') return 1;
        if (this.#FinishAction != undefined && override != true) return 1;
        this.#FinishAction = action
    }
    remFinishAction() {
        this.#FinishAction = undefined;
    }
}
            //console.log(this.#Queue.nowPlaying)
            //console.log(this.#Queue.nowPlaying?.isFulfilled())
            //if (this.#Queue.nowPlaying.isFulfilled()) {
            //    this.#Queue.nowPlaying = this.#Queue.nowPlaying.value(); 
            //} else {
            //    console.log("[StreamManager] wainting for data Promise resolve...")
            //}
/*
    try {
        this.#Queue.nowPlaying = await this.#Queue.nowPlaying;
    } catch (error) {
        console.log("[StreamManager] Error when wainting for data Promise resolve:", error);
        return 1;
    }
*/
/*
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
*/