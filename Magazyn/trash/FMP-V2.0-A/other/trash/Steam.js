const voice = require("@discordjs/voice")
const ytdl = require("@distube/ytdl-core")
const ffmpeg = require("fluent-ffmpeg")  

const EventEmitter = require("events")

module.exports = class Stream extends EventEmitter {
    constructor(url, opt = {}) {
        super();
        /**
         * @description only manages the audio stream source
         * @input opt.bitrate   {Number}       bitrate of the stream
         * @input opt.startTime {Number}       set the stream start time
         * @input opt.filters   {Array/String} array of ffmpeg filters
         */
        // get raw audio source
        this.opt = opt
        this.ffmpeg = false;

        this.Error = false;
        this.Ended = false;
        
        this.source = ytdl(url, {
            quality: 'highestaudio', 
            filter: 'audioonly',
            fmt: "mp3",
            highWaterMark: 1024*4,//1 << 62,
            liveBuffer: 1024*4,//1 << 62,
            dlChunkSize: 0,
            bitrate: 128
        })
            .on('error', (err) => {
                if(this.Error == true) return;
                this.Error = true;
                this.emit("yterr", err)
            })
            .on('end', () => {
                if(this.ffmpeg != false) return;
                this.Ended = true;
                this.emit("ytend")
            });
        // create ffmpeg process if neccesary
        if ( this.opt.startTime > 0 || this.opt.filters.length > 0 ) {
            console.log("[StreamManager] started streaming with the help of the ffmpeg module")
            this.ffmpeg = true;
            this.stream = ffmpeg({ source: this.source, priority: 5 })
                .noVideo()  
                .audioChannels(2)
                .audioBitrate(this.opt.bitrate)
                .setStartTime(this.opt.startTime) //.seek(60)
                .audioFilters(this.opt.filters)
                //.format("s16le") // Raw
                .format('opus') // Arbitrary
                .audioCodec('opus')
                .audioFrequency(48000)
                .addOption('-probesize', '32')
                .on('error', (err) => {
                    if(this.Error == true) return;
                    this.Error = true
                    this.emit("fferr", err)
                })
                .on('end', () => { 
                    if(this.Ended == true) return;
                    this.Ended = true;
                    this.emit("ffend")
                });
        } else {
            console.log("[StreamManager] started streaming without using the ffmpeg module")
            this.stream = this.source;
        }
        // make output readable by discord
        this.audioResource = voice.createAudioResource(this.stream, {
            //inputType: voice.StreamType.Raw,
            inlineVolume: true,
        })
    }
    get duration() {
        return (this.audioResource?.playbackDuration ?? 0) / 1000;
    }
}