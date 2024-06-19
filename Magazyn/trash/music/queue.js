const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "queue",
    description: "zarządzaj listą",
    perms: [],
    async run(client, interaction) {
        /**
         * @SubCommand list
         * @SubCommand remove
         * @SubCommand move
         * @SubCommand shuffle
         */
        return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`System Muzyczny jest niedostępny...`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
        let Queue = await client.FMP.getQueue(interaction)
        if(!Queue) return 1;

    }
}