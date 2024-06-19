const c = require("../utilities/color.js")
const InfoTabble = {
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


module.exports = function Info(showInfo, code, args) {
    if (showInfo == false) return code;
    let prefix = c("[").FG("#f86a07").end() + c("FMP").FG("#f5fdfd").end() + c("]").FG("#f86a07").end() + c("[Info]").FG("#0093ff").end();
    let content = InfoTabble[code];
    if (!content) {
        process.stdout.write(`${prefix}: unknown debug code: ${code}\n`);
        return code;
    }
    process.stdout.write(`${prefix}: ${content}\n`);
    return code;
}
