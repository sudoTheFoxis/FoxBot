module.exports = class FilterManager {
    #FMP
    #Queue
    constructor(FMP, Queue) {
        this.#FMP = FMP
        this.#Queue = Queue

        this.FilterList = new Map()
    }
    #resolveFilter = (filter) => {
        if (typeof filter === "object" && typeof filter.name === "string" && typeof filter.value === "string") {
            return filter;
        }
        if (typeof filter === "string" && Object.prototype.hasOwnProperty.call(this.#FMP.Options.filters, filter)) {
            return {
                name: filter,
                value: this.#FMP.Options.filters[filter],
            };
        }
        return console.log("nie znaleziono filtra o żądanej nazwie: \n" + filter)
    }
    async add(input) {
        let apply = async (input) => {
            if (this.FilterList.has(input) || this.FilterList.has(input?.name)) {
                console.log("filter o podanej nazwie już istneje: \n" + (input.name ? input.name : input ))
            } else {
                let filter = await this.#resolveFilter(input);
                if (!filter || typeof filter != 'object') return true;
                this.FilterList.set(filter.name, filter.value)
            }
        }
        if (Array.isArray(filters)) {
            for (let filter of filters) {
                await apply(filter)
            }
        } else {
            await apply(filters)
        }
        this.#Queue.createPlayer()
    }
    async del(input) {
        let remove = async (input) => {
            if (!this.FilterList.has(input) || !this.FilterList.has(input?.name)) {
                console.log("filter o podanej nazwie nie jest obecnie w urzytku: \n" + (input.name ? input.name : input ))
            } else {
                if(typeof input == "object") input = input.name;
                this.FilterList.delete(input)
            }
        }
        if (Array.isArray(filters)) {
            for (let filter of filters) {
                await remove(filter)
            }
        } else {
            await remove(filters)
        }
        this.#Queue.createPlayer()
    }
    get(input) {
        if(input) {
            if(typeof input == "string")
            this.FilterList
        }
        return this.FilterList
    }
    getFormatted() {
        let filters = []; 
        this.FilterList.forEach(f => filters.push(f))
        return filters;
    }
}