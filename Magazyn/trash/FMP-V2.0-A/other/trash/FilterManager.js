module.exports = class FilterManager {
    #FMP
    #Guild
    #apply
    constructor(FMP, Guild) {
        this.#FMP = FMP
        this.#Guild = Guild
        this.filters = new Map()
        this.#apply = () => {

        }
    }
    #resolveFilter = (filter) => {
        if (typeof filter === "string" && this.#FMP.FilterList[filter]) {
            return {
                name: filter,
                value: this.#FMP.FilterList[filter],
            };
        }
        return;
    }
    async add(input) {
        let addFilter = async (input) => {
            if (this.filters.has(input) || this.filters.has(input?.name)) {
                console.log("filter o podanej nazwie już istneje: \n" + (input.name ? input.name : input ))
            } else {
                let filter = this.#resolveFilter(input);
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
        return;
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
        return;
    }
    async set(input) {
        this.filters.clear()
        let addFilter = async (input) => {
            if (this.filters.has(input) || this.filters.has(input?.name)) {
                console.log("filter o podanej nazwie już istneje: \n" + (input.name ? input.name : input ))
            } else {
                let filter = this.#resolveFilter(input);
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
        return;
    }
    clear() {
        this.filters.clear()
        this.#apply() // update the stream
        return;
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