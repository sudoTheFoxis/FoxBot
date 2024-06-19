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
            maxSelfRecovery: 3,   // the number of maximum self-retrieval attempts, beyond which the music will be skipped
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
            ytdlOptions: { //ytdl-core options
                filter: "audioonly",
                quality: "highestaudio",
                //highWaterMark: 1 << 25
            },
            // filters
            FilterList: {
                "vaporwave": "asetrate=48000*0.8,aresample=48000,atempo=1.1", // slow down the music
                "nightcore": "asetrate=48000*1.25,aresample=48000,bass=g=5", // very fast song
                "purebass": "bass=g=40,dynaudnorm=f=300,asubboost,volume=2", // almost bass only
                "bassboost": "bass=g=10,dynaudnorm=f=200", // small boost to the bass
                "HyperBass": "bass=g=20,dynaudnorm=f=250", // medium boost to the bass
                "karaoke": "stereotools=mlev=0.1", // like deff music with echo
                "echo": "aecho=0.8:0.9:1000:0.3", // trash
                "8d": "apulsator=hz=0.10", // sound around us
                "mcompand": "mcompand", // something like bad speaker with little echo
                "reverse": "areverse", // first downloading entire song then reversing it (funny XD)
                "flanger": "flanger", // like 8d
                "tremolo": "tremolo", // volume up and down very fast
                "phaser": "aphaser", // like lineal
                "earwax": "earwax", // deff sound
                "haas": "haas", // inverse
            },
        }
        this.Options = { ...this.DefaultOptions, ...Options}
        this.Options.ytdlOptions = { ...Options?.ytdlOptions, ...this.DefaultOptions.ytdlOptions}
        this.Options.FilterList = { ...Options?.customFilters, ...this.DefaultOptions.FilterList}

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
        if(!queue.nowPlaying && queue._paused == false) {
            queue.playSong()
            //queue.StreamManager.create()
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

/**
 * @name FoxMusicPlayer
 * @author Discord: matix2023
 * @description small but powerful custom music player
 * @note it's not very "idiot" proof
 */