const Discord = require('discord.js')
const fs = require('fs')

module.exports = {
    status: "ON",
    name: "word",
    description: "wylosuj słowo",
    help: "",
    perms: [],
    options: [
        {
            name: "litera",
            description: "podaj litere lub ciąg znaków od których bedzie się rozpoczynać losowane słowo",
            type: 3,
            required: "false",
        },
    ],
    async run(client, interaction) {

        let litera = interaction.options.getString("litera")
        let resource = fs.readFileSync(`${process.cwd()}/Magazyn/scrabble-polish-words.txt`, 'utf-8').split('\n')
        //https://github.com/turekj/msc/blob/master/CheatAR/development/server/word-dictionary-importer/src/main/resources/scrabble-polish-words.txt
        if(litera) {
            litera = litera.toLowerCase()
            filteredWords = resource.filter(word => word.startsWith(litera) /*.charAt(0).toUpperCase() === 'K'*/)
        } else {
            filteredWords = resource
        }
        if (filteredWords.length === 0) {
            return interaction.editReply({ content: "Nie znaleziono podobieństwa" })
        }
        let random = Math.floor(Math.random() * filteredWords.length)
        let word = filteredWords[random]
        return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'word'})
            .setColor("3498DB")
            .setDescription(`Znaleziono \`${filteredWords.length}\` wyrazów${ litera ? ` zaczynających się na \`${litera}\`` : `` },\n wylosowany wyraz to \`${word}\``)
        ]})
    }
}
        /*
        let apiUrl = `https://api.datamuse.com/words?sp=${litera}*`;
        let result = await new Promise((resolve, reject) => {
            let words = [];
            request(apiUrl, { json: true }, (err, res, body) => { //Kod korzysta z API Datamuse, które pozwala na generowanie list słów na podstawie różnych kryteriów. W tym przypadku używamy parametru sp z wartością k*, który oznacza, że chcemy otrzymać słowa zaczynające się na literę "k". Następnie mapujemy wynikowy obiekt JSON i wybieramy tylko pole "word" z każdego elementu, a następnie logujemy wynik do konsoli.
                if (err) {
                    //console.log(err);
                    reject(err);
                }
            
                body.map((result) => {
                    words.push(result.word)
                })
                resolve(words)
            });
        })
        let random = Math.floor(Math.random() * result.length)
        let word = result[random]
        if (!word) return interaction.editReply({ content: "Nie znaleziono podobieństwa" })
        return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Losowanie wyrazu'})
            .setColor("E10000")
            .setDescription(`wylosowany wyraz to \`${word}\``)
        ]})
        */
        /*
        let role = interaction.guild.roles.cache.find(r => r.name === "kabaczek");
        if(!role || role === undefined) return interaction.editReply({ content: "Nie znaleziono roli \`@Kabaczek\`"})
        */