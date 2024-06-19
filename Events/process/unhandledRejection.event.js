module.exports = { 
    bindEvent(client) { 
        process.on('unhandledRejection', this.execute.bind(null, client))
    },
    execute(client, error) {
        return console.log(`\x1b[31m[System] Unhandled promise rejection\x1b[0m: \n${error} \n `);
    
    }
}