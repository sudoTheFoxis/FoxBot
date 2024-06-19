const Discord = require('discord.js')
const client = new Discord.Client({ intents: 32767 })
const fs = require('fs');
client.config = require(`./config.js`)
client.utils = require('./Magazyn/utils.js')

console.log(' ')
console.log('\x1b[34m[System]\x1b[0m wczytywanie...')
// ===================== Handler
const Handler = require('./Handler/Handler.js')
client.Handler = new Handler(client, {
    technicGuildId: client.config.technicGuildId,
    register_Commands_globaly: "test", 
    /**
     * @true Slash Command register slower, but for all discord servers 
     * @false Slash Command register faster, but only for the servers where the bot are in (comands must be register manually for new servers)
     * @"test" Slash Command register for only technic guild (usefull when you want to make some new commands)
     */  
    CommandsDir: "./Commands",   //Commands files dir
    EventsDir: "./Events",      //Events files dir
    CLIDir: "./CLI",           //CLI command files dir
})
client.Handler.loadall()

// ===================== DataHandler
const DataHandler = require('./Magazyn/DataHandler.js')
client.DataHandler = new DataHandler('../DataBase')

// ===================== FoxMusicPlayer
//const FMP = require("./FMP-V3.1/FoxMusicPlayer.js")
//client.FMP = new FMP(client)

client.login(client.config.token)