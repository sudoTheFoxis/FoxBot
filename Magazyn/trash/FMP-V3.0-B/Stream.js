const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const stream = require("stream");
const fs = require("fs");

module.exports = class player {
    #Player;
    constructor(Player) {
        this.#Player = Player;
        // status
        this.status = 0;
        // song output
        this.out = new stream.PassThrough();
        // song source
        this.source;
        // ffmpeg Process
        this.FFmpegArgs;
        this.FFmegProcess;
        this.timestamp;
    }

    async init(url) { // ================================================================================ INIT
        if(!url || typeof url !== "string") return "[FMP#Stream@init]: URL is not a STRING";
        this.status = 1;
        // ================================================================================ POBIERANIE CAŁEGO UTWORU
        let rawData;
        let id = url.split("youtube.com/watch?v=")[1];
        if(this.#Player.Buffor[id]) {
            rawData = this.#Player.Buffor[id];
            console.log("[FMP#Stream@init]: reading data from buffor");
        } else {
            console.log("[FMP#Stream@init]: downloading audio");
            rawData = await new Promise((resolve, reject) => {
                let cache = [];
                ytdl(url,{ quality:"highestaudio", filter:"audioonly", format:"opus", })
                    .on("data", (data) => {cache.push(data)})
                    .on("error", (error) => {console.log(error); return;})
                    .on("end", () => { resolve(Buffer.concat(cache)) });
            })
            this.#Player.Buffor[id] = rawData;
            console.log("[FMP#Stream@init]: audio has been downloaded");
        }
        // ================================================================================ TWORZENIE CZYTALNEGO ZASOBU AUDIO
        this.source = new stream.Readable();
        this.source._read = () => {}; // Implementacja pustej metody _read jest wymagana
        this.source.push(rawData);
        this.source.push(null);
        this.source.on("error", (e) => { console.log("olaboga daj mnie szloga bo nie wytrymie:\n" + e) });
    }
    async play(options) { //================================================================================ PLAY
        this.status = 2;
        /*
        options = {
            volume: 100,
            startTime: 30,
            filters: ["apulsator=hz=0.10"],
            bitrate: "128k"
        };
        //*/
        if(options) {
            this.FFmpegArgs = [
                //"-i", "pipe:0", // Wejście z stdin (pipe 0)
                "-bufsize", "500k",
                "-preset", "veryfast",
                "-vn",
                "-ac","2",
                "-ar","48000", 
                "-ab", options.bitrate ? options.bitrate : "128k",
                "-f","opus",
                "-acodec","libopus"
                //"pipe:1" // Wyjście do stdout (pipe 1)
            ];
            if(options.startTime > 0) this.FFmpegArgs.unshift("-ss", options.startTime.toString());
            if(Array.isArray(options.filters) && options.filters.length) {
                this.FFmpegArgs.push("-af");
                this.FFmpegArgs.push(...options.filters);
            }
            this.FFmegProcess = ffmpeg({ source: this.source, priority: 1 })
                .addOption(this.FFmpegArgs)
                .on('error', (err) => console.log(`[FMP#Stream@play]: FFmpegProcess ERROR: Encoding Error: /n${err}`))
                .on('exit', () => console.log('[FMP#Stream@play]: FFmpegProcess EXIT: Video recorder exited'))
                .on('close',  () => console.log('[FMP#Stream@play]: FFmpegProcess CLOSE: Video recorder closed'))
                .on('end', () => console.log('[FMP#Stream@play]: FFmpegProcess END: Video Transcoding succeeded !'));
    
            this.FFmegProcess.on("progress", (progeress) => {
                this.timestamp = progeress.timemark ;// ( x > -3 sek )
            })
            this.FFmegProcess.pipe(this.out);
        } else {
            this.source.pipe(this.out);
        }
    }
    async destroy() {
        this.status = 3;
        this.out.unpipe();
        if(this.FFmegProcess) {
            this.FFmegProcess._events.error = () => {console.log("[FMP#Stream@play] FFmpegProcess: stream ended by destroy() call")}
            this.FFmegProcess.on("error", () => {})
            this.FFmegProcess.kill();
        }
        // usuwanie
        this.out = undefined;
        this.source = undefined;
        this.FFmegProcess = undefined;
    }
}


