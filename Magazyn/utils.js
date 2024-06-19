module.exports = new class utils {
    getNow(type) {
        let today = new Date();
        let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        return { date, time };
    }
    toSeconds(time) {
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
    toNormal(time) {
        if (time === 0) return null
        if (!time || !/^-?[\d.]+(?:e-?\d+)?$/.test(time)) return "NaN";
        let hours   = Math.floor(time / 3600)
        let minutes = Math.floor(time / 60) % 60
        let seconds = time % 60
        return [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":")
    }
    toHuman(seconds) {
        let time = [];
        let y = Math.floor(seconds / 31536000);
        let o = Math.floor((seconds % 31536000) / 2628000);
        let d = Math.floor(((seconds % 31536000) % 2628000) / 86400);
        let h = Math.floor((seconds % (3600 * 24)) / 3600);
        let m = Math.floor((seconds % 3600) / 60);
        let s = Math.floor(seconds % 60);
        if(y > 0) time.push(y + (y === 1 ? " year, " : " years, "))
        if(o > 0) time.push(o + (o === 1 ? " month, " : " months, "));
        if(d > 0) time.push(d + (d === 1 ? " day, " : " days, "));
        if(h > 0) time.push(h + (h === 1 ? " hour, " : " hours, "));
        if(m > 0) time.push(m + (m === 1 ? " minute " : " minutes, "));
        if(s > 0) time.push(s + (s === 1 ? " second" : " seconds "));
        return time.join("");
    }
    createProgress(value, maxValue, barSize) {
        try {
            let percentage = value / maxValue; // Calculate the percentage of the bar
            let progress = Math.round((barSize * percentage)); // Calculate the number of square caracters to fill the progress side.
            let emptyProgress = barSize - progress; // Calculate the number of dash caracters to fill the empty progress side.
            let progressText = '▰'.repeat(progress); // Repeat is creating a string with progress * caracters in it
            let emptyProgressText = '▱'.repeat(emptyProgress); // Repeat is creating a string with empty progress * caracters in it
            let percentageText = Math.round(percentage * 100) + '%'; // Displaying the percentage of the bar
            let bar = progressText + emptyProgressText; // Creating the bar
            return { bar, percentageText };
        } catch(e) {
            let bar = '▰'.repeat(barSize);
            let percentageText = '100%';
            return { bar, percentageText };
        }
    }
}