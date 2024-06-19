module.exports = class FilterManager {
    #FMP
    #Queue
    #apply
    constructor(FMP, Queue) {
        this.#FMP = FMP
        this.#Queue = Queue
        this.filters = new Map()
        this.#apply = () => {
            this.#Queue._startTime = this.#Queue.currentTime
            this.#Queue.StreamManager.Start()
        }
    }
    #resolveFilter = (filter) => {
        if (typeof filter === "object" && typeof filter.name === "string" && typeof filter.value === "string") {
            return filter;
        }
        if (typeof filter === "string" && this.#FMP.FilterList[filter]) {
            return {
                name: filter,
                value: this.#FMP.FilterList[filter],
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
        return [...this.filters.values()];
    }
    list() {
        return this.#FMP.FilterList
    }
}