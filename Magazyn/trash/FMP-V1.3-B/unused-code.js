// ====================================================================================================================
// ===================================================================================================== Stream Manager
// ====================================================================================================================

if(this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting end function execution");
this.#Lock = true;

let currentTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
if (currentTime >= (this.#Queue.nowPlaying.duration - 1)) {
    console.log("[audioPlayer] STATECHANGE: false call of song end, (Queue.currentTime >= song.duration) is false..., restarting stream");
    this.#Queue._startTime = currentTime
    if (this.#audioPlayer) await this.#audioPlayer.stop();
    this.#audioPlayer = undefined;
    return this.Start()
}

let currentTimev2 = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
if (this.#Queue.nowPlaying.duration < (currentTime + 1)) {
    console.log("[StreamManager] currentTime >= nowPlaying.duration, skipping song")
    await this.cleanup()
    if (typeof this.#FinishAction == "function") {
        this.#FinishAction()
    }
    return;
}

// =========================================================== on error
audioPlayer
    .on("error", async error => {
        if (this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting error event execution");
        this.#Lock = true;
        if (this.#ErrCount >= this.#FMP.Options.maxSelfRecovery) {
            console.log("[audioPlayer] Error: The song finished due to the Error limit, initializing FinishAction execution");
            if (this.#audioPlayer) await this.#audioPlayer.stop()
            this.#ErrCount = 0;
            this.#Queue._startTime = 0;

            if (this.#Queue.songs.length <= 0) return console.log("[audioPlayer] there is no more songs to play")
            if (this.#Queue._loop == 0) {
                this.#Queue.cache = this.#Queue.nowPlaying
                this.#Queue.nowPlaying = this.#Queue.songs.shift()
                if (this.#Queue._paused != false) return;
                this.create()
            }

            return;
        }
        this.#ErrCount++
        console.log("[audioPlayer] ERROR: error has been retrived:\n", error)
        this.#Queue._startTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
        if (this.#audioPlayer) await this.#audioPlayer.stop()
        this.create()
    })
    .on(voice.AudioPlayerStatus.Idle, async (oldState, newState) => {
        // ======================================================= on music end
        if (newState.status == "idle") {
            if (this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting end function execution");
            this.#Lock = true;
            // =================================================== confirmation that the music is finished
            let currentTime = (this.#audioResource?.playbackDuration ?? 0) / 1000 + this.#Queue._startTime;
            console.log(`${this.#Queue.nowPlaying.duration} > ${currentTime}, (${(currentTime + 1)})`)
            if (this.#Queue.nowPlaying.duration > (currentTime + 1)) {
                if (this.#ErrCount >= this.#FMP.Options.maxSelfRecovery) {
                    console.log("[audioPlayer] Error: The song finished due to the Error limit, initializing FinishAction execution");
                    if (this.#audioPlayer) await this.#audioPlayer.stop()
                    this.#ErrCount = 0;

                    this.#Queue._startTime = 0;
                    if (this.#Queue.songs.length <= 0) return console.log("[audioPlayer] there is no more songs to play")
                    if (this.#Queue._loop == 0) {
                        this.#Queue.cache = this.#Queue.nowPlaying
                        this.#Queue.nowPlaying = this.#Queue.songs.shift()
                        if (this.#Queue._paused != false) return;
                        this.create()
                    }

                    return;
                }
                this.#ErrCount++
                console.log("[audioPlayer] STATECHANGE: false call of song end, (Queue.currentTime >= song.duration) is false..., restarting stream");
                this.#Queue._startTime = currentTime
                if (this.#audioPlayer) await this.#audioPlayer.stop()
                //await this.cleanup()
                this.create()
                return;
            }
            console.log("[audioPlayer] STATECHANGE: The song finished succesfully, initializing FinishAction execution");
            // =================================================== cleanup and execution of finish function
            if (this.#audioPlayer) await this.#audioPlayer.stop()
            this.#ErrCount = 0;

            this.#Queue._startTime = 0;
            if (this.#Queue.songs.length <= 0) return console.log("[audioPlayer] there is no more songs to play")
            if (this.#Queue._loop == 0) {
                this.#Queue.cache = this.#Queue.nowPlaying
                this.#Queue.nowPlaying = this.#Queue.songs.shift()
                if (this.#Queue._paused != false) return;
                this.create()
            }

            return;
        }
    })

        this.StreamManager.setFinishAction(async () => {
            this._startTime = 0;
            if (this.songs.length <= 0) return console.log("[audioPlayer] there is no more songs to play")
            if (this._loop == 0) {
                this.cache = this.nowPlaying
                this.nowPlaying = this.songs.shift()
                if (this._paused != false) return;
                //this.StreamManager.create()
                return;
            }
        })

        console.log(this.#Queue.nowPlaying)
        console.log(this.#Queue.nowPlaying?.isFulfilled())
        if (this.#Queue.nowPlaying.isFulfilled()) {
            this.#Queue.nowPlaying = this.#Queue.nowPlaying.value();
        } else {
            console.log("[StreamManager] wainting for data Promise resolve...")
        }

        try {
            this.#Queue.nowPlaying = await this.#Queue.nowPlaying;
        } catch (error) {
            console.log("[StreamManager] Error when wainting for data Promise resolve:", error);
            return 1;
        }

async function createPlayer() {
    if (!this.connection) {
        this.connection = voice.joinVoiceChannel({
            channelId: this.VC.id,
            guildId: this.VC.guild.id,
            adapterCreator: this.VC.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        })
    }
    let player = this.connection._state.subscription?.player
    if (player) await player.stop();
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
        .on('close', () => console.log('[FFmpeg] Video recorder closed'))
        .on('end', () => console.log('[FFmpeg] Video Transcoding succeeded !'))

    // konwersja streamu na czytalny przez discord strumień audio 
    this.PlayerCache.audioResource = voice.createAudioResource(this.PlayerCache.ffmpegStream, {
        inputType: voice.StreamType.Raw,
        inlineVolume: true,
    })
    this.PlayerCache.audioResource?.volume?.setVolume(Math.pow(this._volume / 100, 0.5 / Math.log10(2)))
    //tworzenie playera audio
    this.PlayerCache.audioPlayer = voice.createAudioPlayer()
        .on("error", error => { console.log("[audioPlayer] error has been retrived") });
    this.connection.subscribe(this.PlayerCache.audioPlayer)
    this.PlayerCache.audioPlayer.play(this.PlayerCache.audioResource)

}


    // ====================================================================================================================
    // ============================================================================================================== Queue
    // ==================================================================================================================== 
    // proces ffmpeg (prism-media) =================================================================
let args = [
    "-analyzeduration", "0",
    "-loglevel", "0",
    "-ar", "48000",
    "-ac", "2",
    "-f", "s16le",//"opus", "-acodec", "libopus"
    "-ss", "60"
]
if (typeof this._startTime === "number") { // seek function not work
    if (this._startTime > 0) { args.unshift("-ss", this._startTime.toString()); }
    else { this._startTime = 0 }
}
this._filters.size ? ["-af", this._filters.values.map(f => f.value).join(",")] : [];
this.PlayerCache.ffmpegStream = new prism.FFmpeg({ args, shell: false })
// dodawanie eventów oraz z jakiegoś powodu aktywowanie samej konwersji
this.PlayerCache.ffmpegStream
    .on("data", (data) => console.log(`[FFmpeg] data package has been retrieved`))
    .on('error', (error) => console.log(`[FFmpeg] Encoding Error:\n ${error.message}`))
    .on('exit', () => console.log('[FFmpeg] Video recorder exited'))
    .on('close', () => console.log('[FFmpeg] Video recorder closed'))
    .on('end', () => console.log('[FFmpeg] Video Transcoding succeeded'));
this.PlayerCache.stream.pipe(this.PlayerCache.ffmpegStream) 

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

// ====================================================================================================================
// ===================================================================================================== Filter Manager
// ====================================================================================================================

let formatted = []; 
this.filters.forEach(f => formatted.push(f))

// ====================================================================================================================
// ===================================================================================================== FoxMusicPlayer
// ====================================================================================================================

//const voice = require('@discordjs/voice');let VC=interaction.member.voice.channel;voice.joinVoiceChannel({channelId:VC.id,guildId:VC.guild.id,adapterCreator:VC.guild.voiceAdapterCreator,selfDeaf:false,selfMute:false})
async function getBasicInfo(ID) { // returns data required to play song
    if (ID.includes("youtube.com")) {
        ID = ID.split("youtube.com/watch?v=")[1]
    }
    let YTDLinfo = (await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${ID}`)).videoDetails //get video info
    if (!YTDLinfo) return 1;
    let result = {
        type: "video",
        id: YTDLinfo.videoId,
        url: YTDLinfo.video_url,
        title: YTDLinfo.title,

        duration: YTDLinfo.lengthSeconds,
        isLiveContent: YTDLinfo.isLiveContent,

        get Details() {
            this.getFullInfo(this.id)
        }
    }
    return result;
}
let batchedUrls = result.items.map((item) => item.url);
let batchSize = 25;

console.log(result.items)
console.log(batchedUrls.length)
for (let i = 0; i < batchedUrls.length; i += batchSize) {
    console.log("[batch] rozwiązywanie pakietu: ", i)
    let batch = batchedUrls.slice(i, i + batchSize);

    for (let url of batch) {
        let videoInfo = await this.getBasicInfo(url);
        queue.songs.push(videoInfo);
    }
}

for (let item of result.items) {
    resultQueue.push(this.getBasicInfo(item.url))
}
let final = await Promise.allSettled(resultQueue)
console.log(final)

for (let item of result.items) {
    let resultFormatted = {
        type: "video",
        id: item.videoId,
        url: item.video_url,
        title: item.title,

        duration: item.lengthSeconds,
        isLiveContent: item.isLiveContent,

        get Details() {
            this.getFullInfo(this.id)
        }
    }
    queue.songs.push(resultFormatted)
}

async function filter(queue) {

    if (typeof (queue) == "string") queue = await this.QueueManager.get(queue);
    if (queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
    if (typeof (queue) != "object") return undefined;
    this.get = function () {

    }
    this.add = function () {

    }
    this.remove = function () {

    }
    this.set = function () {

    }
}

