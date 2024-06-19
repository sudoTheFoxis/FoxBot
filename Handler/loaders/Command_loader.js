const Discord = require('discord.js')
const fs = require('fs')

module.exports = class Commandloader {
    constructor(client, Handler) {
        this.client = client
        this.Handler = Handler
        this.Handler.stats.Commandloader = { finded: 0, loaded: 0, Errors: 0 }
    }
    load() {
        let CommandDir = `${process.cwd()}/${this.Handler.Options.CommandsDir}`;//get directory grom main folder
        this.client.Commands = new Discord.Collection()
        
        if(CommandDir && fs.existsSync(`${CommandDir}/`)) { //pacza czy foler istnije
            fs.readdirSync(`${CommandDir}/`).forEach(dir => { //skanuje w poszukiwaniu podfolderów
                fs.readdirSync(`${CommandDir}/${dir}`).filter(file => file.endsWith('.js')).forEach(file => { //skanuje podfoldery w poszukiwaniu plików "js"
        
                    let commandFile = require(`${CommandDir}/${dir}/${file}`)
                    console.log(`\x1b[34m[Command loader]\x1b[0m wczytywanie pliku: \x1b[34m${dir}/${file}\x1b[0m`)
                    this.Handler.stats.Commandloader.finded ++
                    try {
                        if (!commandFile.status || commandFile.status == "1" || commandFile.status.toLowerCase() == "on") {
                            //-- Basic debuger
                            if (!commandFile.name) { 
                                console.log(`\x1b[33m[Command loader]\x1b[0m wykryto błąd w kodzie pliku: \x1b[0m${dir}/${file}\x1b[0m: brak nazwy komendy`)
                                this.Handler.stats.Commandloader.Errors ++
                                return;
                            }
                            if (!commandFile.run) {
                                console.log(`\x1b[33m[Command loader]\x1b[0m wykryto błąd w kodzie pliku: \x1b[0m${dir}/${file}\x1b[0m: brak funkcionalności, nie wykryto modułu "run"`)
                                this.Handler.stats.Commandloader.Errors ++
                                return;
                            }
                            if (!commandFile.description) {
                                console.log(`\x1b[33m[Command loader]\x1b[0m wykryto błąd w kodzie pliku: \x1b[0m${dir}/${file}\x1b[0m: brak opisu komendy.`)
                                this.Handler.stats.Commandloader.Errors ++
                                return;
                            }
        
         
                            let cmdname = commandFile.name
                                .toLowerCase()
                                .replace(/\s+/g, '')    
                                
                            this.client.Commands.set(cmdname, commandFile)
                            console.log(`\x1b[32m[Command loader]\x1b[0m wczytano komende: \x1b[32m${cmdname}\x1b[0m z pliku: \x1b[32m${dir}/${file}\x1b[0m`)      
                            this.Handler.stats.Commandloader.loaded ++
                            return; 
                            //--  
        
                        } else if (commandFile.status == "0" || commandFile.status.toLowerCase() == "off") {
                            console.log(`\x1b[32m[Command loader]\x1b[0m wykryto komende: \x1b[33m${commandFile.name}\x1b[0m w pliku: \x1b[33m${dir}/${file}\x1b[0m, lecz nie została ona wczytana ponieważ jest \x1b[33mwyłączona\x1b[0m`)
                            return;
                        } else {
                            console.log(`\x1b[31m[Command loader Debuger] wykryto błąd w kodzie pliku: \x1b[33m${dir}/${file}\x1b[31m: status komendy jest niepoprawny: \x1b[33m${commandFile.status}\x1b[0m`)
                            this.Handler.stats.Commandloader.Errors ++
                            return;
                        }
        
                    } catch (error) {
                        console.log(`\x1b[31m[Command loader Error]\x1b[0m \n ${error} \n `)
                        this.Handler.stats.Commandloader.Errors ++
                        return;
                    }
                })
            })

            //if(this.Handler.stats.Commandloader.finded <= 0) {console.log(`[SlashCMD loader] nie wykryto żadnego pliku z komendami`)}
        } else {
            console.log(`\x1b[31m[Command loader FATAL Error] nie można odnaleść ścieżki komend lub nie jest ona zdefiniowana\x1b[0m`);
            this.Handler.stats.Commandloader = `[Command loader FATAL Error]`;
            return;
        }
        return;
    }

    async register() {
        //console.log('\x1b[32m[CommandLoader]\x1b[0m rejestrowanie komend... ')
        if(!this.client.Commands) return;
        let registerMode = this.Handler.Options.register_Commands_globaly
        let CommandArr = []
        await this.client.Commands.map(cmd => CommandArr.push(cmd))

        //=============================================== load core
        if (registerMode == true) {
            await CommandArr.forEach(cmd => {
                this.client.application?.command.create(cmd).catch(err => {console.log(`\x1b[31m[Command register ERROR] global register:\x1b[0m ${cmd}\n` + err)})
            })
        } else if (registerMode == false) {
            await CommandArr.forEach(cmd => {
                this.client.guilds.cache.forEach(guild => {
                    guild.commands.create(cmd).catch(err => {console.log(`\x1b[31m[Command register ERROR] local register:\x1b[0m ${cmd}\n` + err)})
            })})

        } else if(registerMode == "test") {
            await CommandArr.forEach(cmd => {
                let guild = this.client.guilds.cache.get(this.Handler.Options.technicGuildId)
                guild.commands.create(cmd).catch(err => {console.log(`\x1b[31m[Command register ERROR] local register:\x1b[0m ${cmd.name}\n` + err)})
            })

        } else {
            console.log(`\x1b[31m[Command register ERROR] tryb rejestrowania komend jest nieprawidłowy: ${registerMode}, (false/true)\x1b[0m`);

        }
        //} catch (err) {console.log(`slash command register FATAL ERROR:\n` + err)}
    }
    async unregister() {
        //console.log('\x1b[32m[CommandLoader]\x1b[0m usówanie komend... ')
        let registerMode = this.Handler.Options.register_Commands_globaly
        if(registerMode === true) {
            await this.client.application?.commands.set([])
            console.log(`\x1b[32m[Command unregister]\x1b[0m komendy globalne zostały odrejestrowane, mogą być one widoczne jeszcze przez jakiś czas\x1b[0m`)
        
        } else if(registerMode === false) {
            console.log(`\x1b[32m[Command unregister]\x1b[0m ładowanie listy serverów, odrejestrowywanie komend...\x1b[0m`)
            await this.client.guilds.cache.forEach(guild => {
                this.client.application.commands.set([], guild.id)
            })
            console.log(`\x1b[32m[Command unregister]\x1b[0m komendy zostały odrejestrowane na serverach na których bot obecnie się znajduje\x1b[0m`)
        } else if(registerMode === "test" || !registerMode) {
            await this.client.application.commands.set([], this.Handler.Options.technicGuildId)
            console.log(`\x1b[32m[Command unregister]\x1b[0m komendy zostały odrejestrowane na serverze technicznym\x1b[0m`)
        }
    }
}
