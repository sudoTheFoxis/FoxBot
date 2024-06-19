const Discord = require("discord.js")
const voice = require("@discordjs/voice")
const ytdl = require("@distube/ytdl-core")
const ffmpeg = require("fluent-ffmpeg")

const stream = require("stream")
const fs = require("fs")

module.exports = class Player {
    #Queue
    constructor(Queue) {
        this.#Queue = Queue;
        console.log("PLAYER#CREATE")
        // some variables
        this.destroyed = false;
        this.Ended = false;
        this.Error = false;
        this.ErrorCount = 0;
        // player cache
        this.Source = undefined;
        this.FFmegInUse = false;
        this.FFmegProcess = undefined;
        this.AudioSource = undefined;

        this.AudioPlayer = undefined;
        this.Connection = undefined;
        // ================================================================================ TWORZENIE NOWEGO POŁĄCZENIA Z KANAŁEM GŁOSOWYM
        this.Connection = voice.joinVoiceChannel({
            channelId: this.#Queue.VC.id,
            guildId: this.#Queue.VC.guild.id,
            adapterCreator: this.#Queue.VC.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        })
        // ================================================================================ USTAWIANIE PARAMETRÓW STREAMU
        this.YTDL_settings
        this.FFMPEG_settings = [
            "-analyzeduration","0",
            "-probesize", "32",
            "-loglevel","0",
            "-ar","48000", // audio frequency
            "-ac","2", // audio channels
            "-vn", // video null
            "-ab", this.#Queue.VC.bitrate, // audio bitrate
            "-f", // format
        ]

        console.log(this.#Queue.nowPlaying)
        if(this.#Queue.nowPlaying.isLive == true) { // ============== LIVE CONTENT
            this.YTDL_settings = {
                //quality: 'highestaudio', 
                quality: [91, 92, 93, 94, 95],
    
                format: "mp3",
                highWaterMark: 1024*4,//1 << 62,
                liveBuffer: 4900,//1 << 62,
                dlChunkSize: 0, //4096
                bitrate: this.#Queue.VC.bitrate,
            }
            this.FFMPEG_settings.push("mp3"); //"mp3"
        } else { // ================================================= Fixed
            this.YTDL_settings = {
                quality: 'highestaudio', 
                filter: 'audioonly',
                //format: "opus",
                //opusEncoded: true,
                format: "mp3",
                highWaterMark: 1024*4,//1 << 62,
                dlChunkSize: 0, //4096
                bitrate: this.#Queue.VC.bitrate,
            }
            this.FFMPEG_settings.push("mp3"); //"mp3"
            //this.FFMPEG_settings.push("opus","-acodec","libopus");
        }
        if(typeof this.#Queue.startTime === "number" && this.#Queue.startTime > 0) this.FFMPEG_settings.push("-ss", String(this.#Queue.startTime))
        if(this.#Queue.filters.length > 0) this.FFMPEG_settings.unshift("-af", ...this.#Queue.filters)
        console.log(this.YTDL_settings)
        console.log(this.FFMPEG_settings)
        // ================================================================================ TWORZENIE ZASOBU MUZYCZNEGO
        this.Source = ytdl(this.#Queue.nowPlaying.url, this.YTDL_settings)
            .on('error', (error) => {console.log(`[YTDL-CORE] ERROR: Video stream error:\n${error}`)})
            .on('end', () => {console.log('[YTDL-CORE] END: Video stream ended !')});

        if ( this.#Queue.startTime > 0 || this.#Queue.filters.length > 0 ) {
            // ================================================================================ YTDL-CORE + FFMPEG
            console.log("[Player] started streaming with ffmpeg")
            //let pipe = new stream.PassThrough()
            //this.Source.pipe(pipe)
            //pipe.pipe(this.Source)
            this.FFmegInUse = true;
            this.FFmegProcess = ffmpeg({ source: this.Source, priority: 5 })
                //.noVideo()
                //.audioBitrate(this.#Queue.VC.bitrate)
                //.setStartTime(this.#Queue.startTime) //.seek(60)
                //.seekInput(this.#Queue.startTime)
                //.audioFilters(this.#Queue.filters)
                //.format("mp3")
                //.format("s16le") // Raw
                //.format('opus') // Arbitrary
                //.audioCodec('opus')
                //.audioFrequency(48000)
                //.audioChannels(2)
                .addOption(this.FFMPEG_settings)
                .on('error', () => console.log(`[FFmpeg] ERROR: Encoding Error`))
                .on('exit', () => console.log('[FFmpeg] EXIT: Video recorder exited'))
                .on('close',  () => console.log('[FFmpeg] CLOSE: Video recorder closed'))
                .on('end', () => console.log('[FFmpeg] END: Video Transcoding succeeded !'))

            this.AudioSource = voice.createAudioResource( this.FFmegProcess, {
                //inputType: voice.StreamType.OggOpus,
                inlineVolume: true,
            })
        } else {
            // ================================================================================ YTDL-CORE 
            console.log("[Player] started streaming without ffmpeg")
            this.AudioSource = voice.createAudioResource(this.Source, {
                //inputType: voice.StreamType.OggOpus,
                inlineVolume: true,
            })
        }
        // ================================================================================ TWORZENIE PLAYERA AUDIO
        this.AudioResource?.volume?.setVolume(Math.pow(this.#Queue.volume / 100, 0.5 / Math.log10(2)))
        this.AudioPlayer = voice.createAudioPlayer()
            .once("error", error => {
                console.log("CONNECTION#PLAYER@ERR\n" + error)
                return;
            })
            .once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                if (newState.status == "idle") {
                    console.log("CONNECTION#PLAYER@END")
                    this.stop()
                    return;
                }
            })
        if (this.#Queue.paused == true) {
            this.AudioPlayer.pause()
        } else if (this.#Queue.paused == false) {
            this.AudioPlayer.unpause()
        }
        this.Connection.subscribe(this.AudioPlayer)
        this.AudioPlayer.play(this.AudioSource)
    }
    get duration() { // ================================================================================ OBECZNY CZAS ODTWARZACZA
        return (this.AudioSource?.playbackDuration ?? 0) / 1000;
    }
    async stop(force = false) { // ================================================================================ WYŁĄCZENIE I USUNIĘCIE ODTWARZACZA
        //this.#Queue.startTime = ((this.AudioSource?.playbackDuration ?? 0) / 1000) - 1;
        await this.AudioPlayer.stop(true)
        if(this.FFmegInUse == true) {
            this.FFmegProcess.kill()
        }
        this.Source.destroy()
        this.destroyed = true;
    }
    pause() { // ================================================================================ ODPAUZOWANIE
        this.AudioPlayer.pause()
    }
    unpause() { // ================================================================================ ZAPAUZOWANIE
        this.AudioPlayer.unpause()
    }
    volume(lvl) { //================================================================================ ZMIANA GŁOŚNOŚCI
        this.AudioSource?.volume?.setVolume(Math.pow(lvl / 100, 0.5 / Math.log10(2)))
    }
}