const defaultOptions = {
    // comon options
    selfRecovery: true,         // after stream crash, renewing the same song in exact time (can take some time to recovery)
    maxSelfRecovery: 3,         // the number of maximum self-retrieval attempts, beyond which the music will be skipped
    hideErrors: false,          // hide all errors on console
    showDebug: false,         // display debug info, show all FMP actions
    showInfo: false,         // display debug info, show all FMP actions
    joinAsDeaf: false,
    // queue
    pauseWhenEmpty: true,           // pause music when there is noone in vc except the bot
    leaveWhenEmpty: true,           // leave when there is noone in vc except the bot
    leaveWhenEmptyDelay: 30,        // time in seconds
    clearQueueWhenEmpty: false,     // delete queue when there is no one in vc except the bot
    clearQueueWhenEmptyDelay: 60,   // time in seconds
    leaveOnEnd: false,              // leave from vc if queue is end
    leaveOnEndDelay: 30,            // time in seconds
    leaveWhenPaused: false,         // leave from vc if music is paused
    leaveWhenPausedDelay: 60,       // time in seconds    
    // default filter tabble
    FilterList: {
        "vaporwave": "asetrate=48000*0.8,aresample=48000,atempo=1.1",   // slow down the music
        "nightcore": "asetrate=48000*1.25,aresample=48000,bass=g=5",   // very fast song
        "purebass": "bass=g=40,dynaudnorm=f=300,asubboost,volume=2",  // almost bass only
        "bassboost": "bass=g=10,dynaudnorm=f=200",          // small boost to the bass
        "HyperBass": "bass=g=20,dynaudnorm=f=250",         // medium boost to the bass
        "karaoke": "stereotools=mlev=0.1",        // like deff music with echo
        "echo": "aecho=0.8:0.9:1000:0.3",        // trash
        "8d": "apulsator=hz=0.10",        // sound around us
        "mcompand": "mcompand",        // something like bad speaker with little echo
        "reverse": "areverse",        // first downloading entire song then reversing it (funny XD)
        "flanger": "flanger",        // like 8d
        "tremolo": "tremolo",      // volume up and down very fast
        "phaser": "aphaser",      // like lineal
        "earwax": "earwax",      // deff sound
        "haas": "haas",      // inverse
    },
    // player settings
    useBuffor: true,
    ytdlOptions: {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25
    },
}

module.exports = function OptionsValidate(options) {
    if (Object.keys(options).length <= 0) {
        options = defaultOptions;
    } 
    let validatedOptions = {}
    //selfRecovery
    if (options.selfRecovery && typeof options.selfRecovery == "boolean") {
        validatedOptions.selfRecovery = options.selfRecovery
    } else validatedOptions.selfRecovery = defaultOptions.selfRecovery
    //maxSelfRecovery
    if (options.maxSelfRecovery && typeof options.maxSelfRecovery == "number") {
        validatedOptions.maxSelfRecovery = options.maxSelfRecovery
    } else validatedOptions.maxSelfRecovery = defaultOptions.maxSelfRecovery
    //hideErrors
    if (options.hideErrors && typeof options.hideErrors == "boolean") {
        validatedOptions.hideErrors = options.hideErrors
    } else validatedOptions.hideErrors = defaultOptions.hideErrors
    //showDebug
    if (options.showDebug && typeof options.showDebug == "boolean") {
        validatedOptions.showDebug = options.showDebug
    } else validatedOptions.showDebug = defaultOptions.showDebug
    //showInfo
    if (options.showInfo && typeof options.showInfo == "boolean") {
        validatedOptions.showInfo = options.showInfo
    } else validatedOptions.showInfo = defaultOptions.showInfo
    //joinAsDeaf
    if (options.joinAsDeaf && typeof options.joinAsDeaf == "boolean") {
        validatedOptions.joinAsDeaf = options.joinAsDeaf
    } else validatedOptions.joinAsDeaf = defaultOptions.joinAsDeaf
    //pauseWhenEmpty
    if (options.pauseWhenEmpty && typeof options.pauseWhenEmpty == "boolean") {
        validatedOptions.pauseWhenEmpty = options.pauseWhenEmpty
    } else validatedOptions.pauseWhenEmpty = defaultOptions.pauseWhenEmpty
    //leaveWhenEmpty
    if (options.leaveWhenEmpty && typeof options.leaveWhenEmpty == "boolean") {
        validatedOptions.leaveWhenEmpty = options.leaveWhenEmpty
    } else validatedOptions.leaveWhenEmpty = defaultOptions.leaveWhenEmpty
    //leaveWhenEmptyDelay
    if (options.leaveWhenEmptyDelay && typeof options.leaveWhenEmptyDelay == "number") {
        validatedOptions.leaveWhenEmptyDelay = options.leaveWhenEmptyDelay
    } else validatedOptions.leaveWhenEmptyDelay = defaultOptions.leaveWhenEmptyDelay
    //clearQueueWhenEmpty
    if (options.clearQueueWhenEmpty && typeof options.clearQueueWhenEmpty == "boolean") {
        validatedOptions.clearQueueWhenEmpty = options.clearQueueWhenEmpty
    } else validatedOptions.clearQueueWhenEmpty = defaultOptions.clearQueueWhenEmpty
    //clearQueueWhenEmptyDelay
    if (options.clearQueueWhenEmptyDelay && typeof options.clearQueueWhenEmptyDelay == "number") {
        validatedOptions.clearQueueWhenEmptyDelay = options.clearQueueWhenEmptyDelay
    } else validatedOptions.clearQueueWhenEmptyDelay = defaultOptions.clearQueueWhenEmptyDelay
    //leaveOnEnd
    if (options.leaveOnEnd && typeof options.leaveOnEnd == "boolean") {
        validatedOptions.leaveOnEnd = options.leaveOnEnd
    } else validatedOptions.leaveOnEnd = defaultOptions.leaveOnEnd
    //leaveOnEndDelay
    if (options.leaveOnEndDelay && typeof options.leaveOnEndDelay == "number") {
        validatedOptions.leaveOnEndDelay = options.leaveOnEndDelay
    } else validatedOptions.leaveOnEndDelay = defaultOptions.leaveOnEndDelay
    //leaveWhenPaused
    if (options.leaveWhenPaused && typeof options.leaveWhenPaused == "boolean") {
        validatedOptions.leaveWhenPaused = options.leaveWhenPaused
    } else validatedOptions.leaveWhenPaused = defaultOptions.leaveWhenPaused
    //leaveWhenPausedDelay
    if (options.leaveWhenPausedDelay && typeof options.leaveWhenPausedDelay == "boolean") {
        validatedOptions.leaveWhenPausedDelay = options.leaveWhenPausedDelay
    } else validatedOptions.leaveWhenPausedDelay = defaultOptions.leaveWhenPausedDelay
    // useBuffor
    if (options.useBuffor && typeof options.useBuffor == "boolean") {
        validatedOptions.useBuffor = options.useBuffor
    } else validatedOptions.useBuffor = defaultOptions.useBuffor
    
    return validatedOptions
}