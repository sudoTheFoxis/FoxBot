const Discord = require("discord.js")
const voice = require("@discordjs/voice")
const ytdl = require("@distube/ytdl-core")
const stream = require("stream")
const child = require("child_process")
const ffmpeg = require("fluent-ffmpeg")

module.exports = class Player {
    #Queue
    constructor(Queue) {
        this.#Queue = Queue;
        console.log("PLAYER#CREATE")
        // some variables
        this.status = "off"
        // song cache
        this.readableStream = undefined; // buffor >> readableStream
        this.AudioResource = undefined; // readableStream >> audioResource || FFmpegBuffer >> audioResource
        // ffmpeg
        this.FFmegInUse = false; // is ffmpeg in use?
        this.FFmpegArgs = undefined // the settings of ffmepg
        this.FFmegProcess = undefined; // readableStream >> FFmpegProcess
        // integration with discord
        this.AudioPlayer = undefined; // discord audio player
        this.Connection = undefined; // connection with vc
        // ================================================================================ TWORZENIE NOWEGO POŁĄCZENIA Z KANAŁEM GŁOSOWYM
        this.Connection = voice.joinVoiceChannel({
            channelId: this.#Queue.VC.id,
            guildId: this.#Queue.VC.guild.id,
            adapterCreator: this.#Queue.VC.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        })
        this.play()
    }
    async play(url) {
        if(!url || typeof url != "string") url = this.#Queue?.nowPlaying?.url;
        this.status = "bufforing";
        // ================================================================================ POBIERANIE STREAMU jeśli nie został pobrany
        if (!this.#Queue.buffor || this.#Queue.buffor == undefined) {
            console.log("PLAYER: bufforing")
            this.#Queue.buffor = await new Promise((resolve, reject) => {
                let cache = [];
                ytdl(url, {quality: "highestaudio",filter: "audioonly",format: "opus"})
                    .on("data", (data) => {cache.push(data)})
                    .on("error", (error) => {reject(error)})
                    .on("end", () => { resolve(Buffer.concat(cache)) });
            });
        }
        // ================================================================================ TWORZENIE CZYTALNEGO ZASOBU AUDIO
        console.log("PLAYER: creating readable audio resource")
        this.readableStream = new stream.Readable();
        this.readableStream._read = () => {}; // Implementacja pustej metody _read jest wymagana
        this.readableStream.push(this.#Queue.buffor);
        this.readableStream.push(null);
        this.readableStream.on("error", (e) => { console.log(e) })
        // ================================================================================ TWORZENIE PROCESU FFMPEG
        if (this.#Queue.startTime > 0 || this.#Queue.filters.length > 0) {
            console.log("PLAYER: setting up ffmpeg")
            this.FFmpegArgs = [
                //"-i", "pipe:0", // Wejście z stdin (pipe 0)
                //"-analyzeduration","0",
                //"-probesize", "32",
                //"-loglevel","0",
                "-vn",
                "-ar","48000",
                "-ac","2",
                "-ab", "128k",
                "-f", "mp3",//"s16le",
                //"opus","-acodec","libopus",
                //"pipe:1" // Wyjście do stdout (pipe 1)
            ]
            this.FFmegProcess = ffmpeg({ source: this.readableStream, priority: 5 })
                .addOption(this.FFmpegArgs)
                .on('error', () => console.log(`[FFmpeg] ERROR: Encoding Error`))
                .on('exit', () => console.log('[FFmpeg] EXIT: Video recorder exited'))
                .on('close',  () => console.log('[FFmpeg] CLOSE: Video recorder closed'))
                .on('end', () => console.log('[FFmpeg] END: Video Transcoding succeeded !'))
        // ================================================================================ TWORZENIE AUDIO RESOURCE
            console.log("PLAYER: setting up audio resource")
            this.AudioResource = voice.createAudioResource(this.FFmegProcess, {
                //inputType: voice.StreamType.Raw,
                inlineVolume: true,
            })
        } else {
            console.log("PLAYER: setting up audio resource")
            this.AudioResource = voice.createAudioResource(this.readableStream, {
                //inputType: voice.StreamType.OggOpus,
                inlineVolume: true,
            })
        }
        // ================================================================================ TWORZENIE PLAYERA AUDIO
        console.log("PLAYER: creating audio player")
        this.AudioResource?.volume?.setVolume(Math.pow(this.#Queue.volume / 100, 0.5 / Math.log10(2)))
        this.AudioPlayer = voice.createAudioPlayer()
            .once("error", error => {
                console.log("CONNECTION#PLAYER@ERR\n" + error)
                return;
            })
            .once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                if (newState.status == "idle") {
                    console.log("CONNECTION#PLAYER@END")
                    if(this.status != "destroyed") this.stop();
                    return;
                }
            })
        if (this.#Queue.paused == true) {
            this.AudioPlayer.pause()
        } else if (this.#Queue.paused == false) {
            this.AudioPlayer.unpause()
        }
        this.Connection.subscribe(this.AudioPlayer)
        this.AudioPlayer.play(this.AudioResource)
        this.status = "playing";
    }
    get duration() { // ================================================================================ OBECZNY CZAS ODTWARZACZA
        if (this.status == "bufforing") return "bufforing";
        return (this.AudioResource?.playbackDuration ?? 0) / 1000;
    }
    async stop() { // ================================================================================ WYŁĄCZENIE I USUNIĘCIE ODTWARZACZA
        //this.#Queue.startTime = ((this.AudioResource?.playbackDuration ?? 0) / 1000) - 1;
        console.log("PLAYER: destroying audio player")
        this.status = "destroyed";

        this.AudioPlayer.stop() // zatrzymaj playera
        this.AudioPlayer = undefined // usuń playera

        //if (this.FFmegInUse == true) { // zatrzymaj ffmpeg jeśli w urzytku
        //    await this.FFmpegProcess.kill('SIGTERM');
        //}

        this.AudioResource = undefined; // usuń zasób muzyki

        this.readableStream.destroy()
        this.readableStream = undefined; // usuń źrudło muzyki

        this.#Queue.buffor = undefined; // usuń buffor
        return;
    }
    pause() { // ================================================================================ ODPAUZOWANIE
        this.AudioPlayer.pause()
    }
    unpause() { // ================================================================================ ZAPAUZOWANIE
        this.AudioPlayer.unpause()
    }
    volume(lvl) { //================================================================================ ZMIANA GŁOŚNOŚCI
        this.AudioResource?.volume?.setVolume(Math.pow(lvl / 100, 0.5 / Math.log10(2)))
    }
}



            /*
            this.FFmegProcess = child.spawn('ffmpeg', this.FFmpegArgs)
            // input
            this.readableStream.pipe(this.FFmegProcess.stdin); // pipe:0 (audioInput >> ffmpeg.stdin) 
            // output
            //this.FFmegProcess.stdout.pipe(this.FFmpegBuffer); // pipe:1 (ffmpeg.stdout >> audioOutput)
            // error
            this.FFmegProcess.on("error", (e) => { console.log("ffmpeg error:",e) })
            */