const Discord = require("discord.js");
const voice = require("@discordjs/voice");
const ytdl = require("@distube/ytdl-core");
const stream = require("stream");

module.exports = class Player {
    // ta klasa zostaje tworzona dla karzdej nowej muzyki
    #Queue;
    constructor(Queue) {
        this.#Queue = Queue;
        // settings
        this.volume = 100;
        this.startTime = 0;
        this.paused = false;
        this.filters = [];
        // Stream
        this.Stream;
        this.Buffor = {};
        // integration with discord
        this.AudioResource = undefined;
        this.AudioPlayer = undefined; // discord audio player
        this.connection = voice.joinVoiceChannel({
            channelId: this.#Queue.VC.id,
            guildId: this.#Queue.VC.guild.id,
            adapterCreator: this.#Queue.VC.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        })
    }
    get timestamp() { // ================================================================================ OBECZNY CZAS ODTWARZACZA
        if (this.status == "bufforing") return "bufforing";
        return (this.AudioResource?.playbackDuration ?? 0) / 1000;
    }
    async play(song) {
        if(song.isLive == true) return console.log("[FMP#Queue@play]: live content is currentlu unsupported")
        // create audio Stream
        let newStream = new (require("./Stream.js"))(this);
        await newStream.init(song.url);
        newStream.play();
        if(this.Stream?.status < 3) await this.Stream.destroy();
        this.Stream = newStream;
        // connect to discord api
        let { stream, type } = await voice.demuxProbe(this.Stream.out);
        this.AudioResource = voice.createAudioResource(stream, { inputType: type, inlineVolume: false });
        this.AudioPlayer = voice.createAudioPlayer()
            .once("error", error => console.log("[FMP#Player@play]: Audio Player Error:\n" + error))
            .once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {if (newState.status == "idle") return console.log("[FMP#Player@play]: Audio Player End");})
        this.connection.subscribe(this.AudioPlayer);
        this.AudioPlayer.play(this.AudioResource);
    }
    pause() { // ================================================================================ ODPAUZOWANIE
        this.AudioPlayer.pause();
    }
    unpause() { // ================================================================================ ZAPAUZOWANIE
        this.AudioPlayer.unpause();
    }
    volume() { //================================================================================ ZMIANA GŁOŚNOŚCI
        this.AudioResource?.volume?.setVolume(Math.pow(lvl / 100, 0.5 / Math.log10(2)));
    }
    async destroy() { // ================================================================================ WYŁĄCZENIE I USUNIĘCIE ODTWARZACZA
        this.AudioPlayer.stop();
        if(this.Stream?.status < 3) await this.Stream.destroy();
        this.Stream = undefined;
        this.AudioResource = undefined;
        this.AudioPlayer = undefined;
        this.Buffor = {};
    }
}
        /*// ================================================================================ TWORZENIE ŹRUDŁA AUDIO
        let newStream = new (require("./Stream.js"))();
        await newStream.init(url);
        newStream.play();
        if(this.Stream?.status < 3) await this.Stream.destroy();
        this.Stream = newStream;
        
        // ================================================================================ TWORZENIE AUDIO RESOURCE
        this.AudioResource = voice.createAudioResource(this.Stream.out, {
            inputType: voice.StreamType.Raw,
            //inlineVolume: false,
        })

        // ================================================================================ TWORZENIE PLAYERA AUDIO
        //this.AudioResource?.volume?.setVolume(Math.pow(this.#Queue.volume / 100, 0.5 / Math.log10(2)))
        this.AudioPlayer = voice.createAudioPlayer()
            .once("error", error => {
                console.log("CONNECTION#PLAYER@ERR\n" + error)
                return;
            })
            .once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                if (newState.status == "idle") {
                    console.log("CONNECTION#PLAYER@END")
                    return;
                }
            })
        if (this.#Queue.paused == true) {
            this.AudioPlayer.pause()
        } else if (this.#Queue.paused == false) {
            this.AudioPlayer.unpause()
        }
        this.connection.subscribe(this.AudioPlayer)
        this.AudioPlayer.play(this.AudioResource)
        //*/