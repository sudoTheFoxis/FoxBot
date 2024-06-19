module.exports = { 
    bindEvent(client) { 
        process.on('error', this.execute.bind(null, client))
    },
    execute(client, error) {
        return console.log(`\x1b[31m[System] Process Error\x1b[0m: \n${error} \n `);    
    }
}