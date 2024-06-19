const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "volume",
    description: "zmień głośność",
    perms: [],
    options: [
        {
            name: "lvl",
            description: "poziom głośności",
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
        let lvl = interaction.options.getNumber("lvl")
        if(typeof lvl != "number" || lvl <= 0) return 1;
        let Queue = await client.FMP.getQueue(interaction)
        if(!Queue) return 1;
        Queue.volume(lvl)
        return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`Głośność została ustawiona na ${lvl}`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
    }
}