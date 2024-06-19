const ytdl = require("ytdl-core")
const ffmpeg = require("fluent-ffmpeg")
const voice = require('@discordjs/voice')

module.exports = class StreamManager {
    /**
     * @description klasa przeznaczona do przechowywania wszystkich informacji o aktualnie odtwarzanej muzyce, 
     * oraz umorzliwiająca jego edycje (dodanie filtrów, zapauzowanie, przewijanie, zmiane głośności)
     * @param {String} url link do muzyki
     */
    #queue
    constructor(queue) {
        this.#queue = queue
        this.url = this.#queue.nowPlaying.url   // the url of the song
        this.stream = undefined                 // ytdl stream
        this.FFmpegProcess = undefined          // FFmpeg conversion
        this.audioResource = undefined          // audoResource
        this.audioPlayer = undefined            // discord audio player
    }
    get playbackDuration() {
        return (this.audioResource?.playbackDuration ?? 0) / 1000;
    }
    play() {

    }
    stop() {

    }
    pause() {

    }
    resume() {

    }
}