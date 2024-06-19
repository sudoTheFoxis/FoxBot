const ColorTabble = {
    "red": [255,0,0],
    "green": [0,255,0],
    "blue": [0,0,255]
}

// \u001b[{38/48};2;{r};{g};{b}m
module.exports = function color(text) {
    return new colorConstructor(text);
}

class colorConstructor {
    constructor(text) {
        this.text = text
        this.ansiCodes = []
    }
    custom(args) {
        this.ansiCodes.push(args);
        return this;
    }
    FG(...args) {
        if (Array.isArray(args) && args.length == 3) { // RGB color value support
            let [R,G,B] = args;
            this.ansiCodes.push(`\u001b[38;2;${R};${G};${B}m`);
        } else if (!isNaN(Number(args)) && Number(args) <= 255) { // ASCI 255 color code support
            this.ansiCodes.push(`\u001b[38;5;${args}m`);
        } else {
            args = String(args).toLowerCase();
            if (args.startsWith("#")) { // HEX color value support
                let hex = args.replace("#", "");
                let R = parseInt(hex.slice(0, 2), 16);
                let G = parseInt(hex.slice(2, 4), 16);
                let B = parseInt(hex.slice(4, 6), 16);
                this.ansiCodes.push(`\u001b[38;2;${R};${G};${B}m`);
            } else if (ColorTabble[args]) { // easy color acces by Color Tabble
                let [R,G,B] = ColorTabble[args];
                this.ansiCodes.push(`\u001b[38;2;${R};${G};${B}m`);
            }
        }
        return this;
    }
    BG(...args) {
        if (Array.isArray(args) && args.length == 3) { // RGB color value support
            let [R,G,B] = args;
            this.ansiCodes.push(`\u001b[48;2;${R};${G};${B}m`);
        } else if (!isNaN(Number(args)) && Number(args) <= 255) { // ASCI 255 color code support
            this.ansiCodes.push(`\u001b[48;5;${args}m`);
        } else {
            args = String(args).toLowerCase();
            if (args.startsWith("#")) { // HEX color value support
                let hex = args.replace("#", "");
                let R = parseInt(hex.slice(0, 2), 16);
                let G = parseInt(hex.slice(2, 4), 16);
                let B = parseInt(hex.slice(4, 6), 16);
                this.ansiCodes.push(`\u001b[48;2;${R};${G};${B}m`);
            } else if (ColorTabble[args]) { // easy color acces by Color Tabble
                let [R,G,B] = ColorTabble[args];
                this.ansiCodes.push(`\u001b[48;2;${R};${G};${B}m`);
            }
        }
        return this;
    }
    bright() {
        this.ansiCodes.push("\x1b[1m");
        return this;
    }
    dim() {
        this.ansiCodes.push("\x1b[2m");
        return this;
    }
    italic() {
        this.ansiCodes.push("\x1b[3m");
        return this;
    }
    underscore() {
        this.ansiCodes.push("\x1b[4m");
        return this;
    }
    blink() {
        this.ansiCodes.push("\x1b[5m");
        return this;
    }
    Reverse() {
        this.ansiCodes.push("\x1b[7m");
        return this;
    }
    Hidden() {
        this.ansiCodes.push("\x1b[8m");
        return this;
    }
    end() {
        return this.ansiCodes.join('')+this.text+"\x1b[0m";
    }
    rainbow() {
        let text = this.text.split("")
        let codes = rainbowGenerator(text.length)
        let rainbowed = []
        for (let i=0;i < text.length;i++) {
            rainbowed.push(`${codes[i]}${text[i]}`)
        }
        this.text = rainbowed.join("")
        return this;
    }
}
function rainbowGenerator(length) {
    let codes = [];
    let steps = length / 6 // Liczba punktów gradientu
    let stepSize = 255 / steps; // liczba punktów na 1 kolor
    let limit = (255+255+255+255+255+255) / stepSize; // limit kroków
    let R = 255;
    let G = 0;
    let B = 0;

    for (let i = 0; i < limit; i++) {
        R = Math.round(R);
        G = Math.round(G);
        B = Math.round(B);
        if (R < 0) R = 0;
        if (R > 255) R = 255;
        if (G < 0) G = 0;
        if (G > 255) G = 255;
        if (B < 0) B = 0;
        if (B > 255) B = 255;
        // RGB rainbow
        codes.push(`\u001b[38;2;${R};${G};${B}m`)
        if (R == 255 && G < 255 && B == 0) {
            G += stepSize
        } else if (R > 0 && G == 255 && B == 0) {
            R -= stepSize
        } else if (R == 0 && G == 255 && B < 255) {
            B += stepSize
        } else if (R == 0 && G > 0 && B == 255) {
            G -= stepSize
        } else if (R < 255 && G == 0 && B == 255) {
            R += stepSize
        } else if (R == 255 && G == 0 && B > 0) {
            B -= stepSize
        }
    }
    return codes
}