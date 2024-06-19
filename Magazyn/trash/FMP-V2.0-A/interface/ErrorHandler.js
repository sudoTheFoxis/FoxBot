const c = require("../utilities/color.js")
const ErrorTabble = {
    /**
     * @description code ranges description:
     * [0-19] Dev error codes
     * [100-109] .play()
     * [110-119] .stop()
     * [120-129] .pause()
     * [130-139] .resume()
     * [140-149] 
     * [150-159]
     * [160-169]
     * 
     */
    0: "custom code message has not been created yet",
    "FMP#DEBUG": "this is a debug message",
}

module.exports = function Error(hideErrors, code, args) {
    if (hideErrors == true) return code;

    let prefix = c("[").FG("#f86a07").end() + c("FMP").FG("#f5fdfd").end() + c("]").FG("#f86a07").end() + c("[Error]").FG("#ff2500").end();
    let content = ErrorTabble[code];
    if (!content) {
        process.stdout.write(`${prefix}: unknown error code: ${code}\n`);
        return code;
    }
    process.stdout.write(`${prefix}: ${content}\n`);
    return code;
}
