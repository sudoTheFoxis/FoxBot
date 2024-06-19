const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "info",
    description: "wyświetla informacje o bocie",
    help: "",
    perms: [],
    async run(client, interaction) {
        await interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'info', iconURL: 'https://i.imgur.com/6hyk84I.png' })
                .setColor('#000FFF')
                .addFields(
                    { name: "Nazwa", value: `${client.config.name}`, inline: true },
                    { name: "Wersja", value: `${client.config.version}`, inline: true },
                    { name: "Autor", value: `${client.users.cache.get(client.config.BotAdminID)}`, inline: true },
                    { name: "Czas pracy", value: `\`\`\`${client.utils.toHuman(Math.round(client.uptime / 1000))}\`\`\``, inline: true },
                    { name: "opis", value: `\`\`\`${client.config.description}\`\`\``, inline: false },
                )
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 

        })

    }
}