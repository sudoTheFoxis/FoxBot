const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "ping",
    description: "zprawdź opóźnienie bota",
    help: "",
    perms: [],
    async run(client, interaction) {
        await interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'ping', iconURL: 'https://i.imgur.com/6hyk84I.png' })
                .setColor('#000FFF')
                .setDescription(`***Pong!***, **obecny ping bota to:** \`${Date.now() - interaction.createdTimestamp} ms\``) //\nopuźnienie API: \`${Math.round(client.ws.ping)+1}ms\`
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 

        })

    }
}