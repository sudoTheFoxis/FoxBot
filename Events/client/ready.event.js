const Discord = require('discord.js')

module.exports = { 
    bindEvent(client) { 
        client.once('ready', this.execute.bind(null, client))
    },
    async execute(client) {
        client.Handler.Commandloader.register()
        console.log(`\n\x1b[34m[System]\x1b[32m wczytano... bot jest online\x1b[0m\n`)
    }    
}

/* // not working ffmpeg intantly shuts down (useless)
        let url = "https://youtu.be/uDpC5jzqhRo?si=dgEwWisyHUZ5LJQm"

        
        let getDirectURL = (url) => {
            ytdl.getInfo(url).then(info => {
                
                const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' })
                console.log(format)
            })
        }
        function nextBestFormat(formats) {
            formats = formats
                .filter(format => format.audioBitrate)
                .sort((a, b) => b.audioBitrate - a.audioBitrate);
            return formats.find(format => !format.bitrate) || formats[0];
        }
        let info = await ytdl.getInfo(url)
        let directURL = await nextBestFormat(info.formats).url
        console.log(directURL)
        let args = [
            "-reconnect",
            "1",
            "-reconnect_streamed",
            "1",
            "-reconnect_delay_max",
            "5",
            "-i",
            directURL,
            "-analyzeduration",
            "0",
            "-loglevel",
            "0",
            "-ar",
            "48000",
            "-ac",
            "2",
            "-f",,"opus", "-acodec", "libopus"
        ]
        const ffmpegStream = new prism.FFmpeg({ args, shell: false })
        ffmpegStream
            .on("data", (data) => console.log(`[FFmpeg] data package has been retrieved`))
            .on('error', (error) => console.log(`[FFmpeg] Encoding Error:\n ${error.message}`))
            .on('exit', () => console.log('[FFmpeg] Video recorder exited'))
            .on('close',  () => console.log('[FFmpeg] Video recorder closed'))
            .on('end', () => console.log('[FFmpeg] Video Transcoding succeeded'));

        const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 })
        ffmpegStream.pipe(opus).pipe(fs.createWriteStream("./test.opus"))
*/
/* // some code
        let stream = ytdl(url, {
            quality: 'highestaudio', 
            filter: 'audioonly',
        })
            //.on("data", (data) => console.log(`[YTDL-CORE] data package has been retrieved`))
            .on('error', (err) => {
                console.log(`[YTDL-CORE] Video stream error:\n ${err}\n[ytdl-core] restarting stream...`)
            })
            .on('end', () => console.log('[YTDL-CORE] Video stream ended !'));
*/
/*  // filter manager
        let map = new Map()
        map.set("bass", "testowy-filter")
        map.set("8d", "kolejny filter ffmpeg")
        console.log(map)
        console.log("bol:\n" + map.has("bass"))
        let x = []
        map.forEach(f => x.push(f))
        console.log(x)*/
        /*for(let i = 0; i < 1000; i++) {
            let int
            let TDB = await client.DataHandler.get("test")
            console.log(TDB)
            if(TDB == null) {
                await client.DataHandler.create("Data", "test", { val: 0 })
                TDB = (await client.DataHandler.get("test"))
                console.log(TDB)
            }
            int = TDB.val + 1;
            console.log(int)
            await client.DataHandler.edit("test", { val: int })
        }
*/
/* // the http request test
const https = require('https');

        let id = "TTZuhOfBogI"
        let url = `https://returnyoutubedislikeapi.com/votes?videoId=${id}`;

        https.get(url,(res) => {
            let body = "";

            res.on("data", (chunk) => {
                body += chunk;
            });

            res.on("end", () => {
                try {
                    let json = JSON.parse(body);
                    // do something with JSON
                    console.log(json)
                } catch (error) {
                    console.error(error.message);
                };
            });

        }).on("error", (error) => {
            console.error(error.message);
        });
*/