const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "seek",
    description: "przewiń muzyke",
    perms: [],
    options: [
        {
            name: "time",
            description: "czas o jaki muzyka ma być przesunięta",
            type: 10,
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
        let time = interaction.options.getNumber("time")
        if(typeof time != "number") return 1;
        let Queue = await client.FMP.getQueue(interaction)
        if(!Queue) return 1;
        Queue.seek(time)
        return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`odtwarzacz został przesunięty o \`${time}\` sekund`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
    }
}