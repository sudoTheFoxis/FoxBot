const Dsicord = require("discord.js")
const voice = require("@discordjs/voice")

const Stream = require("./Steam.js")

module.exports = class Connection {
    #FMP
    #Queue
    constructor(FMP, Queue) {
        /**
         * @description manages the connection to discord and transmitting audio
         */
        this.#FMP = FMP;
        this.#Queue = Queue;
        this.destroyed = false
        //this.connection = voice.getVoiceConnection(this.#Queue?.VC?.guild?.id)
        this.#FMP.Debug("CONNECTION#CREATE")
        this.connection = voice.joinVoiceChannel({
            channelId: this.#Queue.VC.id,
            guildId: this.#Queue.VC.guild.id,
            adapterCreator: this.#Queue.VC.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        })
        this.Stream = undefined;
        this.play()
    }
    get duration() {
        return this?.Stream?.duration;
    }
    play() {
        this.#FMP.Debug("CONNECTION#PLAY")
        this.Stream = new Stream(this.#Queue.nowPlaying.url, {
            bitrate: this.#Queue.VC.bitrate,
            startTime: this.#Queue.startTime,
            filters: this.#Queue.filters,
        })
        this.Stream.audioResource?.volume?.setVolume(Math.pow(this.#Queue.volume / 100, 0.5 / Math.log10(2)))
        this.audioPlayer = voice.createAudioPlayer()
            .once("error", error => {
                //if(this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting error event execution");
                this.#FMP.Error("CONNECTION#PLAYER@ERR")
                return;
            })
            .once(voice.AudioPlayerStatus.Idle, (oldState, newState) => {
                if (newState.status == "idle") {
                    //if(this.#Lock != false) return console.log("[audioPlayer] #Lock != false, aborting error event execution");
                    if(this.Stream.Error != false) return;
                    this.#FMP.Debug("CONNECTION#PLAYER@END")
                    return;
                }
            })
        if (this.#Queue.paused == true) {
            this.audioPlayer.pause()
        } else if (this.#Queue.paused == false) {
            this.audioPlayer.unpause()
        }

        this.connection.subscribe(this.audioPlayer)
        this.audioPlayer.play(this.Stream.audioResource)
    }
    stop(force = true) {
        this.#FMP.Debug("CONNECTION#STOP")
        this.audioPlayer.removeAllListeners();
        this.audioPlayer.stop(force);
        delete this.Stream;
    }
    pause() {
        this.#FMP.Debug("CONNECTION#PAUSE")
        this.audioPlayer.pause()
    }
    unpause() {
        this.#FMP.Debug("CONNECTION#UNPAUSE")
        this.audioPlayer.unpause()
    }
    volume(lvl) {
        this.#FMP.Debug("CONNECTION#VOLUME")
        this.Stream.audioResource?.volume?.setVolume(Math.pow(lvl / 100, 0.5 / Math.log10(2)))
    }
}