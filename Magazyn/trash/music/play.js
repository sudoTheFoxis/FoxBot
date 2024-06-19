const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "play",
    description: "odtwórz jakąś muzykę",
    perms: [],
    options: [
        {
            name: "query",
            description: "tytuł lub url muzyki z youtube",
            type: 3,
            required: "true",
        },
    ],
    async run(client, interaction) {
        /*return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`System Muzyczny jest niedostępny...`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })*/
        let query = interaction.options.getString("query")
        await client.FMP.play(query, { interaction })
        return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'FoxMusicPlyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`odtwarzacz został uruchomiony`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
    }
}