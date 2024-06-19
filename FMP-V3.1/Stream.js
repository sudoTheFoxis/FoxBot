const ytdl = require("@distube/ytdl-core");
const ffmpeg = require("fluent-ffmpeg");
const stream = require("stream");
const fs = require("fs");

module.exports = class Stream {
    #Queue
    constructor(Queue) {
        this.#Queue = Queue
        // ta klasa zapewnia źrudło dźwięku oraz umozliwia jego manipulacje
        // status
        this.status = 0;
        // song output
        this.out = new stream.PassThrough();
        // song raw source
        this.rawSrc;
        // ffmpeg Process
        this.FFmpegArgs;
        this.FFmegProcess;
        this.timestamp;
    }
    async init(url) { // ================================================================================ fetch song data for play
        if(!url || typeof url !== "string") return "[FMP#Stream@init]: URL is not a STRING";
        this.status = 1;
        // ================================================================================ POBIERANIE CAŁEGO UTWORU
        let rawData;
        let id = url.split("youtube.com/watch?v=")[1];

        if(this.#Queue.Buffor[id]) { // ram cache
            rawData = this.#Queue.Buffor[id];
            console.log("[FMP#Stream@init]: reading data from buffor");

        } else if (fs.existsSync(`${this.#Queue.cacheDir}/${id}`) && this.#Queue.cache == true) { // disk cache
            rawData = fs.readFileSync(`${this.#Queue.cacheDir}/${id}`)
            console.log("[FMP#Stream@init]: reading data from buffor");

        } else { // downloading
            console.log("[FMP#Stream@init]: downloading audio");
            rawData = await new Promise((resolve, reject) => {
                let cache = [];
                ytdl(url,{ quality:"highestaudio", filter:"audioonly", format:"opus" })
                    .on("data", (data) => {cache.push(data)})
                    .on("error", (error) => {console.log(error); return;})
                    .on("end", () => { resolve(Buffer.concat(cache)) });
            })
            // save song
            if (this.#Queue.cache == true) { // disk cache
                fs.writeFileSync(`${this.#Queue.cacheDir}/${id}`, rawData);

            } else { // ram cache
                this.#Queue.Buffor[id] = rawData;
            
            }
            console.log("[FMP#Stream@init]: audio has been downloaded");
        }
        // ================================================================================ TWORZENIE CZYTALNEGO ZASOBU AUDIO
        this.rawSrc = new stream.Readable();
        this.rawSrc._read = () => {}; // Implementacja pustej metody _read jest wymagana
        this.rawSrc.push(rawData);
        this.rawSrc.push(null);
        this.rawSrc.on("error", (e) => { console.log("olaboga daj mnie szloga bo nie wytrymie:\n" + e) });
    }
    async play(options) { //================================================================================ PLAY the song
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
                "-ab", options.bitrate ?? "128k",
                "-f","opus",
                "-acodec","libopus"
                //"pipe:1" // Wyjście do stdout (pipe 1)
            ];
            if(options.startTime > 0) this.FFmpegArgs.unshift("-ss", options.startTime.toString());
            if(Array.isArray(options.filters) && options.filters.length) {
                this.FFmpegArgs.push("-af");
                this.FFmpegArgs.push(...options.filters);
            }
            this.FFmegProcess = ffmpeg({ source: this.rawSrc, priority: 1 })
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
            this.rawSrc.pipe(this.out);
        }
    }
    async stop() {
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


