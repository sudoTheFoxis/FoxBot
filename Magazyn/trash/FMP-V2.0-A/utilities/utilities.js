function getNow() {
    /**
     * @description get current date/time
     * @output {String} date - date in format YYYY:MM:DD
     * @output {String} time - time in format HH:MM:SS
     */
    let today = new Date();
    let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    return { date, time };
}
function toSeconds(time) {
    /**
     * @description translate time format from "HH:MM:SS" to "SS"
     * @input  {String} time - time in "HH:MM:SS" format
     * @output {Number} time - time in seconds
     */
    try {
        let input = time.split(":")
        let binaryTime
        if ( input.length == 1 ) {
            binaryTime = (+input[0])
        } else if ( input.length == 2 ) {
            binaryTime = (+input[0]) * 60 + (+input[1])
        } else if ( input.length == 3 ) {
            binaryTime = (+input[0]) * 60 * 60 + (+input[1]) * 60 + (+input[2])
        }

        if ( !binaryTime && !/^-?[\d.]+(?:e-?\d+)?$/.test(binaryTime) ) return "NaN"; 
        return binaryTime
    } catch(e) {
        console.log(`[Function Error] input:${time}\nERROR:\n${e}`)
        return "null";
    }
}
function toNormal(time) {
    /**
     * @description translate time format from "SS" to "HH:MM:SS"
     * @input  {number} time    - time in seconds
     * @output {Number} hours   - number of hours
     * @output {Number} minutes - number of minutes
     * @output {Number} seconds - number of seconds
     */
    if (time === 0) return null
    if (!time || !/^-?[\d.]+(?:e-?\d+)?$/.test(time)) return "NaN";
    let hours   = Math.floor(time / 3600)
    let minutes = Math.floor(time / 60) % 60
    let seconds = time % 60
    return [hours,minutes,seconds]
        .map(v => v < 10 ? "0" + v : v)
        .filter((v,i) => v !== "00" || i > 0)
}
function createProgress(val, max, size) {
    /**
     * @description create progress bar
     * @input  {Number} val  - input value
     * @input  {Number} max  - max Value for progress bar
     * @input  {Number} size - the lenght of progress bar (default 10)
     * @output {String} bar  - progress presented as ASCI progress bar
     * @output {String} text - progress in precentage
     */
    try {
        let percentage = val / max; // Calculate the percentage of the bar
        let progress = Math.round((size * percentage)); // Calculate the number of square caracters to fill the progress side.
        let emptyProgress = size - progress; // Calculate the number of dash caracters to fill the empty progress side.

        let progressText = '▰'.repeat(progress); // Repeat is creating a string with progress * caracters in it
        let emptyProgressText = '▱'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it

        let text = Math.round(percentage * 100) + '%'; // Displaying the percentage of the bar
        let bar = progressText + emptyProgressText; // Creating the bar
        return { bar, text };
    } catch(e) {
        let bar = '▰'.repeat(size);
        let text = '100%';
        return { bar, text };
    }
}

module.exports = {
    getNow,
    toSeconds,
    toNormal,
    createProgress
}