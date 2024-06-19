module.exports = { 
    bindEvent(client) { 
        process.on('shardError', this.execute.bind(null, client))
    },
    execute(client, error) {
        return console.log(`\x1b[31m[System] A websocket connection encountered an error\x1b[0m: \n${error} \n `);
    
    }
}