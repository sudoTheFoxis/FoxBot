const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "invite",
    description: "zaproś bota na inny server",
    help: "",
    perms: [],
    async run(client, interaction) {
        await interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'invite', iconURL: 'https://img.icons8.com/nolan/64/invite.png' })
                .setColor('#000FFF')
                .setDescription(`kliknij w przycisk poniżej aby zaprosić bota na swój serwer`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
            components: [ new Discord.ActionRowBuilder()
			    .addComponents(
				    new Discord.ButtonBuilder()
                        .setLabel("Invite")
                        .setStyle(Discord.ButtonStyle.Link)
                        .setURL(`https://discord.com/api/oauth2/authorize?client_id=${client.user.id}&permissions=8&scope=bot%20applications.commands`),
                    /*
                    new Discord.ButtonBuilder()
                        .setLabel("server techniczny")
                        .setStyle("LINK")
                        .setURL(`https://discord.gg/bSC9kaEt`),
                    */
                )
            ]

        })

    }
}