const Discord = require('discord.js')
const fs = require('fs')

module.exports = class Eventloader {
    constructor(client, Handler) {
        this.client = client
        this.Handler = Handler
        this.Handler.stats.Eventloader = { finded: 0, loaded: 0, Errors: 0 }
    }
    load() {
        let EventsDir = `${process.cwd()}/${this.Handler.Options.EventsDir}`;

        if(EventsDir && fs.existsSync(`${EventsDir}/`)) {

            let FolderFilter = (dir) => fs.statSync(`${EventsDir}/${dir}`).isDirectory();
            fs.readdirSync(`${EventsDir}/`).filter(FolderFilter).forEach(dir => {
                
                let FileFilter = (file) => fs.statSync(`${EventsDir}/${dir}/${file}`).isFile() && file.endsWith('.event.js');
                fs.readdirSync(`${EventsDir}/${dir}`).filter(FileFilter).forEach(file => {

                    console.log(`\x1b[34m[Events loader]\x1b[0m wczytywanie pliku: \x1b[34m${dir}/${file}\x1b[0m`)
                    this.Handler.stats.Eventloader.finded ++
                    try {
                        require(`${EventsDir}/${dir}/${file}`).bindEvent(this.client)
                        console.log(`\x1b[32m[Events loader]\x1b[0m wczytano event z pliku: \x1b[32m${dir}/${file}\x1b[0m`)
                        this.Handler.stats.Eventloader.loaded ++
                        return;

                    } catch (error) {
                        console.error(`\x1b[31m[Events loader ERROR] file:\x1b[33m ${file}\x1b[0m \n${error} \n `)
                        this.Handler.stats.Eventloader.Errors ++
                    }
                })
            })
            //if(Handler.stats.loaded_events.finded === 0) {console.log(chalk.hex(`#FFC100`).bold(`[Event loader] nie wykryto żadnego pliku z eventami`))}
        } else {
            console.error(`\x1b[31m[Events loader FATAL ERROR] nie można odnaleść ścieżki eventów lub nie jest ona zdefiniowana\x1b[0m`);
            this.Handler.stats.Eventloader = `[Events loader FATAL Error]`;
        }
        return; 
    }
    unload() {
        return;
    }
}
/* old version only client event suport

*/