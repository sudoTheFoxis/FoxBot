const c = require("../utilities/color.js")
const DebugTabble = {
    /**
     * @description code ranges description:
     * [0-19] Dev debug codes
     * [100-149] FMP
     * [150-174] QueueManager
     * [200-300] Queue
     */
    0: "custom code message has not been created yet",
    "FMP#DEBUG": "this is a debug message",
}


module.exports = function Debug(showDebug, code, args) {
    if (showDebug == false) return code;
    let prefix = c("[").FG("#f86a07").end() + c("FMP").FG("#f5fdfd").end() + c("]").FG("#f86a07").end() + c("[Debug]").FG("#ffc600").end();
    let content = DebugTabble[code];
    if (!content) {
        process.stdout.write(`${prefix}: unknown debug code: ${code}\n`);
        return code;
    }
    process.stdout.write(`${prefix}: ${content}\n`);
    return code;
}
