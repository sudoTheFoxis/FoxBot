module.exports = class FilterManager {
    #FMP
    #Queue
    #apply
    constructor(FMP, Queue) {
        this.#FMP = FMP
        this.#Queue = Queue
        this.FilterList = { ...this.#FMP?.Options?.customFilters, ...{
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
        }},
        this.filters = new Map()
        this.#apply = () => {
            this.#Queue._startTime = this.#Queue.currentTime
            this.#Queue.StreamManager.create()
        }
    }
    #resolveFilter = (filter) => {
        if (typeof filter === "object" && typeof filter.name === "string" && typeof filter.value === "string") {
            return filter;
        }
        if (typeof filter === "string" && this.FilterList[filter]) {
            return {
                name: filter,
                value: this.FilterList[filter],
            };
        }
        return console.log("nie znaleziono filtra o żądanej nazwie: \n" + filter)
    }
    async add(input) {
        let addFilter = async (input) => {
            if (this.filters.has(input) || this.filters.has(input?.name)) {
                console.log("filter o podanej nazwie już istneje: \n" + (input.name ? input.name : input ))
            } else {
                let filter = await this.#resolveFilter(input);
                if (!filter || typeof filter != 'object') return true;
                this.filters.set(filter.name, filter.value)
            }
        }
        if (Array.isArray(input)) {
            for (let filter of input) {
                await addFilter(filter)
            }
        } else {
            await addFilter(input)
        }
        this.#apply() // update the stream
        return 0;
    }
    async del(input) {
        let remFilter = async (input) => {
            if (!this.filters.has(input) && !this.filters.has(input?.name)) {
                console.log("filter o podanej nazwie nie jest obecnie w urzytku: \n" + (input.name ? input.name : input ))
            } else {
                if(typeof input == "object") input = input.name;
                //let fetch = this.filters.get(input)
                this.filters.delete(input)
            }
        }
        if (Array.isArray(input)) {
            for (let filter of input) {
                await remFilter(filter)
            }
        } else {
            await remFilter(input)
        }
        this.#apply() // update the stream
        return 0;
    }
    async set(input) {
        this.filters.clear()
        let addFilter = async (input) => {
            if (this.filters.has(input) || this.filters.has(input?.name)) {
                console.log("filter o podanej nazwie już istneje: \n" + (input.name ? input.name : input ))
            } else {
                let filter = await this.#resolveFilter(input);
                if (!filter || typeof filter != 'object') return true;
                this.filters.set(filter.name, filter.value)
            }
        }
        if (Array.isArray(input)) {
            for (let filter of input) {
                await addFilter(filter)
            }
        } else {
            await addFilter(input)
        }
        this.#apply() // update the stream
        return 0;
    }
    clear() {
        this.filters.clear()
        this.#apply() // update the stream
        return 0;
    }
    get() {
        return this.filters;
    }
    getFormatted() { // format the filters so they can be used in ffmpeg
        //let formatted = []; 
        //this.filters.forEach(f => formatted.push(f))
        //return formatted;
        return [...this.filters.values()];
    }
}