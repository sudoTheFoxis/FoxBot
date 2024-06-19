function hex(color) {
    color = color.toString();
    let R = parseInt(color.substring(1, 3), 16);
    let G = parseInt(color.substring(3, 5), 16);
    let B = parseInt(color.substring(5, 7), 16);
    return RGB
}
function ColorTabble() {
    /**
     * @description print all 256 ANSI color codes, more info:
     * https://gist.github.com/fnky/458719343aabd01cfb17a3a4f7296797
     */
    console.log("======================< ANSI Color Codes >======================")
    for (let i = 0; i < 16; i++) {
        for (let f = 0; f < 16; f++) {
            let code = i * 16 + f;
            let printable = code + " ".repeat(3 - String(code).length) 
            let msg = `\u001b[38;5;${code}m ${printable}`
            process.stdout.write(msg)
        }
        process.stdout.write("\n")
    }
    process.stdout.write("\n")
}
function rainbow() {
    let R = 255
    let G = 0
    let B = 0

    let duration = 2500; // Czas trwania przejścia w milisekundach
    let steps = 255; // Liczba kroków przejścia na kolor

    let stepDuration = duration / steps;
    let stepSize = 255 / steps;

    let index = 0;
    let limit = 0 //(255+255+255+255+255+255) / Math.round(stepSize);

    function Cycle() {
        index += 1;
        // DEBUG
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
        //console.log(`\u001b[38;2;${R};${G};${B}mHello There: ${R} ${G} ${B}\x1b[0m`);   
        console.log(`\u001b[38;2;${R};${G};${B}m##########################################################################################\x1b[0m`);
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
        // repeat
        if (limit <= 0 || index < limit) {
            setTimeout(Cycle, stepDuration);
        }
    }
    Cycle()
}
/* // multi Queue managment concept
this.Queues = new Map(); // queue list
        
        this.addQueue = (name) => {
            this.Queues.set(name, this.#Queue)
        }
        this.delQueue = (name) => {s
            this.Queues.delete(name)
        }
        this.getQueue = (name) => {
            return this.Queues.get(name)
        }
        this.nowQueue = () => {
            let name, value
            name = this.Queues.keys().next().value
            value = this.Queues.values().next().value
            return {name, value};
        }
        this.test = () => {
            console.log(this.Queues.values())
        }*/