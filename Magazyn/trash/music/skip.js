const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "skip",
    description: "przewiń liste",
    perms: [],
    options: [
        {
            name: "number",
            description: "o ile miejsc ma być pominięta lista",
            type: 10,
            required: "false",
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
        let number = interaction.options.getNumber("number")
        if(!number || typeof number != "number") number = 1;
        let Queue = await client.FMP.getQueue(interaction)
        if(!Queue) return 1;
        Queue.skip(number)
        return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`lista została przesunięta o \`${number}\` miejsc`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
    }
}