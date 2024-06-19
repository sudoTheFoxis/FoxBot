const ytsr = require("better-ytsr")
const ytpl = require("ytpl")
const ytdl = require("ytdl-core")
const voice = require('@discordjs/voice')
const https = require('https')

const EventEmitter = require("events")
const QueueManager = require("./QueueManager.js")

module.exports = class FMP extends EventEmitter {
    constructor(client, Options = {}) {
        super()
        if (typeof Options !== "object" || Array.isArray(Options)) {
            console.log('[FMP Error] The FMP options must be a object where the options are in')
            process.exit(1)
        }
        this.DefaultOptions = {
            // comon options
            selfRecovery: true, // after stream crash, renewing the same song in exact time (can take some time to recovery) (not complete in half)
            displayErrors: false, // show all errors on console         (not complete)
            debugInfo: false, // log all FMP actions (not complete in half)
            // connection
            joinAsDeaf: false,
            pauseWhenEmpty: true, // pause music when there is noone in vc except the bot (not complete)
            leaveWhenEmpty: true, // leave when there is noone in vc except the bot (not complete)
            leaveWhenEmptyDelay: 30, //time in seconds                  (not complete)
            clearQueueWhenEmpty: false, // delete queue when there is no one in vc except the bot (not complete)
            clearQueueWhenEmptyDelay: 60, //time in seconds             (not complete)
            // queue
            leaveOnEnd: false, // leave from vc if queue is end         (not complete)
            leaveOnEndDelay: 30, // time in seconds                     (not complete)
            leaveWhenPaused: false, // leave from vc if music is paused (not complete)
            leaveWhenPausedDelay: 60, //time in seconds                 (not complete)
            // stream/ffmpeg settings
            ytdlOptons: { //ytdl-core options
                filter: "audioonly",
                quality: "highestaudio",
                highWaterMark: 1 << 25
            }
        }
        this.Options = { ...this.DefaultOptions, ...Options}
        this.Options.ytdlOptons = { ...this.Options.ytdlOptons, ...this.DefaultOptions.ytdlOptons }

        this.client = client

        this.QueueManager = new QueueManager(this)
    }
    async search(query, options) {
        /**
         * @description just a youtube search function
         * @param {String}  query the query to search
         * @param {Object}  options the ytsr settings/options to the search request
         * @param {String}  options.gl 2-Digit Code of a Country, defaults to US
         * @param {String}  options.hl 2-Digit Code for a Language, defaults to en
         * @param {Boolean} options.safeSearch pull items in youtube restriction mode
         * @param {Number}  options.limit limits the pulled items, defaults to 100
         * @param {Number}  options.pages limits the pulled pages, pages contain 20-30 items
         * @param {Object}  options.requestOptions Additional parameters to passed to miniget
         * 
         * @param {Boolean} options.exactMatch when youtube says 'Search Instead for' (better-ytsr)
         * @param {Object}  options.filters additional request options (better-ytsr)
         * @param {String}  options.filters.uploadDate "Last hour", "Today", "This week", "This month", "This year"
         * @param {String}  options.filters.type "Video", "Channel", "Playlist", "Movie"
         * @param {String}  options.filters.duration "Under 4 minutes", "4 - 20 minutes", "Over 20 minutes"
         * @param {Array}   options.filters.features "Live", "4K", "HD", "Subtitles/CC", "Creative Commons", "360", "VR180", "3D", "HDR"
         * @param {String}  options.filters.sortBy "Relevance", "Upload date", "View count", "Rating"
         * @param {Object}  options.metadata add any metadata do the result eg. requestedBy, (its not a request option)
         */
        if (query.includes('youtube.com/playlist?')) { //get YouTube playlist info
            let request = await ytpl(query, {
                limit: "Infinity",
                pages: "Infinity"
            })
            if (!request) return 1;
            let result = {
                type: "playlist",
                id: request.id,
                url: request.url,
                title: request.title,
                author: request.author,
                visibility: request.visibility,
                views: request.views,
                lastUpdated: request.lastUpdated,
                thumbnails: request.thumbnails,
                length: request.estimatedItemCount,
                items: [],

                metadata: options?.metadata
            }
            let getInfo = (ID) => this.getInfo(ID)
            for(let item of request.items) {
                let song = {
                    type: "video",
                    title: item.title,
                    id: item.id,
                    url: item.url,
                    duration: item.durationSec,
                    isLive: item.isLive,
                    async getDetails() {
                        if(this.details == undefined) {
                            this.details = await getInfo(this.id)
                            return this.details
                        } else {
                            return this.details
                        }
                    }, 
                    details: undefined
                }
                result.items.push(song)
            }
            return result;

        } else if (query.includes('youtube.com/watch?')) { // get YouTube video info
            let request = (await ytdl.getBasicInfo(query)).videoDetails
            if (!request) return 1;
            let getInfo = (ID) => this.getInfo(ID)
            let result = {
                type: "video",
                title: request.title,
                id: request.videoId,
                url: request.video_url,
                duration: request.lengthSeconds,
                isLive: request.isLiveContent,
                async getDetails() {
                    if(this.details == undefined) {
                        this.details = await getInfo(this.id)
                        return this.details
                    } else {
                        return this.details
                    }
                }, 
                details: undefined
            }
            return result;

        } else { // YouTube search
            let defaultSearchOpts = { 
                limit: 1, 
                safeSearch: false, 
                gl: "PL", hl: "PL", 
                exactMatch: true, 
                filters: { type: "Video" } 
            } //search options
            options = {...options, ...defaultSearchOpts}
            let request = (await ytsr(query, options)).items[0]
            if (!request) return 1;
            let getInfo = (ID) => this.getInfo(ID)
            let result = {
                type: "video",
                title: request.title,
                id: request.id,
                url: request.url,
                duration: request.duration.split(':').reverse().reduce((prev, curr, i) => prev + curr*Math.pow(60, i), 0),
                isLive: request.isLive,
                async getDetails() {
                    if(this.details == undefined) {
                        this.details = await getInfo(this.id)
                        return this.details
                    } else {
                        return this.details
                    }
                }, 
                details: undefined
            }
            return result;
        }
    } 
    async getInfo(ID) {
        if(typeof ID == "object" && ID?.url) ID = ID.url;
        if (ID.includes("youtube.com")) {
            console.log(ID)
            ID = ID.split("youtube.com/watch?v=")[1]//.split("&")[0]
            console.log(ID)
        }
        let RYDAPI 
        https.get(`https://returnyoutubedislikeapi.com/votes?videoId=${ID}`,(res) => { //get video like/dislike count
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                RYDAPI = JSON.parse(body);
            });
        }).on("error", (error) => {
            console.log("[RYDAPI] too many requests");
        });
        let YTDLinfo = (await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${ID}`)).videoDetails //get video info
        if (!YTDLinfo) return 1;
        let result = {
            type: "video",
            id: YTDLinfo.videoId,
            url: YTDLinfo.video_url,
            title: YTDLinfo.title,
            description: YTDLinfo.description,
            author: YTDLinfo.author,
            thumbnails: YTDLinfo.thumbnails,
            storyBoard: YTDLinfo.storyboards[0],
            uploadDate: YTDLinfo.uploadDate,
            publishDate: YTDLinfo.publishDate,
    
            chapters: YTDLinfo.chapters,
            duration: (+YTDLinfo.lengthSeconds),
            isLive: YTDLinfo.isLiveContent,
    
            category: YTDLinfo.category,
            allowRatings: YTDLinfo.allowRatings,
            views: (+YTDLinfo.viewCount),
            likes: (+RYDAPI.likes),
            dislikes: (+RYDAPI.dislikes),
            rating: RYDAPI.rating.toFixed(1),
            isFamilySafe: YTDLinfo.isFamilySafe,
            isAgeRestricted: YTDLinfo.isAgeRestricted,
            keywords: YTDLinfo.keywords,
        }
        return result;
    }
    async play(query, options) {
        /**
         * @description simple play function
         * @param {String} query string or url
         * @param {Object} options
         * @param {Object} options.CS custom player settings for a single song (not completed, yet)
         * @param {Discord.interaction} options.interaction (APPLICATION_COMMAND)
         * @param {Discord.voiceChannel} options.VC the channel on which the music is to be played
         * @param {Discord.textChannel} options.TC the channel on which the information will be sent
         */ 
        if(!options?.VC || !options?.VC?.bitrate) {
            if (!options?.interaction) return true;
            options.VC = options.interaction.member.voice.channel
            if(!options?.VC || !options?.VC?.bitrate ) return true;
        }
        if(!options?.TC || options?.TC?.type !== 0 ) {
            if (!options?.interaction) return true;
            options.TC = options.interaction.channel
            if(!options?.TC || options?.TC?.type !== 0 ) return true;
        }
        let queue = await this.QueueManager.get(options.VC.guild.id)
        if (!queue) {
            this.QueueManager.create(options.VC.guild.id)
            queue = await this.QueueManager.get(options.VC.guild.id)
            queue.VC = options.VC
            queue.TC = options.TC
        }
        let result = await this.search(query)
        if(!result) return 1;
        if(result.type == "playlist") {
            for (let item of result.items) {
                queue.songs.push(item)
            }
        } else if (result.type == "video") {
            queue.songs.push(result)
        } else {
            return 1;
        }
        if(Object.keys(queue.nowPlaying).length == 0 && queue._paused == false) {
            queue.StreamManager.create()
        }
        return 0;
    }
    async stop(queue) {
        /**
         * @param {String or Object} Queue the Queue object or server/queue id
         */
        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return true;
        queue.stop()
    }
    async pause(queue) {
        /**
         * @param {String or Object} Queue the Queue object or server/queue id
         */
        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return true;

    }
    async resume(queue) {
        /**
         * @param {String or Object} Queue the Queue object or server/queue id
         */
        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return true;

    }
    async np(queue) {
        /**
         * @param {String or Object} Queue the Queue object or server/queue id
         */
        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return true;
        return await queue.np();
    }
    async seek(queue, time) {
        /**
         * @param {String or Object} Queue the Queue object or server/queue id
         * @param {String} time the time to seek or set
         */
        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return true;

    }
    async loop(queue, mode) {
        /**
         * @param {String or Object} Queue the Queue object or server/queue id
         * @param {String} mode loop single song or entire queue, or just disable it
         */
        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return true;

    }
    async volume(queue, lvl) {
        /**
         * @param {String or Object} Queue the Queue object or server/queue id
         * @param {number} lvl the volume lvl to set
         */
        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return true;

    }
    getQueue(ID) {
        /**
         * @param {String or Number} ID the server ID
         */
        if(typeof(ID) == "object" ) ID = ID.guild.id;
        if(typeof(ID) != "string" ) return true;
        return this.QueueManager.get(ID);
    }
    connect(VC) {
        if(!VC || !VC.bitrate) {
            VC = VC.member.voice.channel
            if(!VC || !VC.bitrate) return true;
        }
        let connection = voice.getVoiceConnection(VC.guild.id)
        if (!connection) {
            connection = voice.joinVoiceChannel({
                channelId: VC.id,
                guildId: VC.guild.id,
                adapterCreator: VC.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            })
        }
        return connection;
    }
    disconnect(VC) {
        if(!VC || !VC.bitrate) {
            VC = VC.member.voice.channel
            if(!VC || !VC.bitrate) return true;
        }
        let connection = voice.getVoiceConnection(VC.guild.id)
        if (!connection) return true;
        return connection.destroy();
    }
}

//const voice=require('@discordjs/voice');let VC=interaction.member.voice.channel;voice.joinVoiceChannel({channelId:VC.id,guildId:VC.guild.id,adapterCreator:VC.guild.voiceAdapterCreator,selfDeaf:false,selfMute:false})
    /*async getBasicInfo(ID){ // returns data required to play song
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
    }*/
            /*
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
            }*/
            /*
            for (let item of result.items) {
                resultQueue.push(this.getBasicInfo(item.url))
            }
            let final = await Promise.allSettled(resultQueue)
            console.log(final)*/
            /*
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
            }*/
/* 
    async filter(queue) {

        if(typeof(queue) == "string" ) queue = await this.QueueManager.get(queue);
        if(queue?.guild?.id) queue = await this.QueueManager.get(queue.guild.id);
        if(typeof(queue) != "object" ) return undefined;
        this.get = function() {

        }
        this.add = function() {

        }
        this.remove = function() {

        }
        this.set = function() {

        }
    }
*/


/**
 * @name FoxMusicPlayer
 * @author Discord: matix2023
 * @description small but powerful custom music player
 * @note it's not very "idiot" proof
 */