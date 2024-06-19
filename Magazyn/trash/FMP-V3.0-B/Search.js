module.exports = function search(query, options) {
    if (query.includes('open.spotify.com')) {
        return;
    } else if (query.includes('soundcloud.com')) {
        return;
    } else {
        return YTSearch(query, options);
    }
} 
// ================================================================================================ YouTube integration
async function YTSearch(query, options) {
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
    let ytdl = require("@distube/ytdl-core");
    let ytsr = require("@distube/ytsr");
    let ytpl = require("@distube/ytpl");
    
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
        for(let item of request.items) {
            let song = {
                type: "video",
                author: request.author,
                title: item.title,
                id: item.id,
                url: item.url,
                duration: item.durationSec,
                isLive: item.isLive,
                async details() {
                    if(this._details == undefined) {
                        this._details = await YTInfo(this.id)
                        return this._details
                    } else {
                        return this._details
                    }
                }, 
                _details: undefined,
            }
            result.items.push(song)
        }
        return result;

    } else if (query.includes('youtube.com/watch?') || query.includes('://youtu.be/')) { // get YouTube video info
        let request = (await ytdl.getBasicInfo(query)).videoDetails
        if (!request) return 1;
        let result = {
            type: "video",
            author: request.author,
            title: request.title,
            id: request.videoId,
            url: request.video_url,
            duration: request.lengthSeconds,
            isLive: request.isLiveContent,
            async details() {
                if(this._details == undefined) {
                    this._details = await YTInfo(this.id)
                    return this._details
                } else {
                    return this._details
                }
            }, 
            _details: undefined,
            metadata: options?.metadata
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
        let result = {
            type: "video",
            author: request.author,
            title: request.title,
            id: request.id,
            url: request.url,
            duration: request.duration.split(':').reverse().reduce((prev, curr, i) => prev + curr*Math.pow(60, i), 0),
            isLive: request.isLive,
            async details() {
                if(this._details == undefined) {
                    this._details = await YTInfo(this.id)
                    return this._details
                } else {
                    return this._details
                }
            }, 
            _details: undefined,
            metadata: options?.metadata
        }
        return result;
    }
}
async function YTInfo(ID) { // get advanced info about video
    let ytdl = require("@distube/ytdl-core");
    let https = require('https');
    if(typeof ID == "object" && ID?.url) ID = ID.url;
    if (ID.includes("youtube.com")) {
        ID = ID.split("youtube.com/watch?v=")[1]//.split("&")[0]
    }
    let RYDAPI = await new Promise ((resolve, reject) => { //get video like/dislike count
            https.get(`https://returnyoutubedislikeapi.com/votes?videoId=${ID}`,(res) => { 
            let body = "";
            res.on("data", (chunk) => {
                body += chunk;
            });
            res.on("end", () => {
                return resolve(JSON.parse(body));
            });
        }).on("error", (error) => {
            return reject(429);
        });
    });
    if (RYDAPI == 429) { 
        return console.log("[RYDAPI] too many requests"); 
    }

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
        isCrawlable: YTDLinfo.isCrawlable,

        category: YTDLinfo.category,
        allowRatings: YTDLinfo.allowRatings,
        views: (+YTDLinfo.viewCount),
        likes: (+RYDAPI.likes),
        dislikes: (+RYDAPI.dislikes),
        rating: RYDAPI.rating.toFixed(1),
        isFamilySafe: YTDLinfo.isFamilySafe,
        isAgeRestricted: YTDLinfo.age_restricted,
        keywords: YTDLinfo.keywords,
    }
    return result;
}
// ================================================================================================ Spotify integration

// ================================================================================================ SoundCloud integration