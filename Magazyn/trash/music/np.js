const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "np",
    description: "zprawdź co obecnie jest grane",
    perms: [],
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
        let Queue = await client.FMP.getQueue(interaction)
        if(!Queue) return 1;
        //Queue.songs
        //Queue.nowPlaying
        //Queue.cache // previouslyPlayed, disabled if loop = "queue"
        let song = await Queue.np()
        return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`obecnie odtwarzana muzyka:\n${song}`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
    }
}