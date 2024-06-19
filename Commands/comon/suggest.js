const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "suggest",
    description: "zaproponuj coś lub zgłoś problem z botem",
    help: `**składnia: \`/suggest <typ> <streść>\`**
    • **propozycja**: zaproponój nową komende która twoim zdaniem przydałaby się w bocie, lub uleprzoną funkcionalność istniejącej komendy.
    • **problem**: zgloś błąd w już istniejącej funkcjonalności komendy bota.
    **jeśli chcesz zgłosić problem związany z botem w zgłoszeniu przedstaw**:
    • w jakich okolicznościach wydarzył się ten błąd,
    • zamieść __dokładnie__ taką samą komende jaką wpisałeś kiedy wyskoczył błąd.
    **niezalerznie od wybranego tematu zgłoszenia proszę o zachowanie cenzuralności wypowiedzi**`,
    perms: [],
    options: [
        {
            name: "typ",
            description: "to jest propozycja czy problem?",
            type: 3,
            required: "true",
            choices: [
                { name: "propozycja", value: "propozycja" },
                { name: "problem", value: "problem" },
            ]
        },
        {
            name: "treść",
            description: "podaj zawartość zgłoszenia",
            type: 3,
            required: "true",
        },
    ],
    async run(client, interaction) {
        let typ = interaction.options.getString("typ");
        let value = interaction.options.getString("treść");

        if (typ == "propozycja") {
            await client.channels.cache.get(client.config.suggestChannelId).send({ //========================================= 
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'propozycja', iconURL: 'https://img.icons8.com/nolan/64/light-on.png' })
                    .setColor('#00ECFF')
                    .addFields(
                        { name: "urzytkownik", value: `${interaction.user}`, inline: true },
                        { name: "IDservera", value: `${interaction.guildId}`, inline: true },
                        { name: "IDkanału", value: `${interaction.channelId}`, inline: true },
                        { name: "treść", value: `${value}`, inline: false },
                    )
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                ], 
    
            })
            await interaction.editReply({ //========================================= 
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'wysłano propozycje', iconURL: 'https://img.icons8.com/nolan/64/light-on.png' })
                    .setColor('#00ECFF')
                    .addFields(
                        { name: "treść", value: `${value}`, inline: false },
                    )
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                ], 
            })

        } else if (typ == "problem") {
            await client.channels.cache.get(client.config.bugReportChannelId).send({ //========================================= 
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'problem', iconURL: 'https://img.icons8.com/nolan/64/light-off.png' })
                    .setColor('#FF6C00')
                    .addFields(
                        { name: "urzytkownik", value: `${interaction.user}`, inline: true },
                        { name: "IDservera", value: `${interaction.guildId}`, inline: true },
                        { name: "IDkanału", value: `${interaction.channelId}`, inline: true },
                        { name: "treść", value: `${value}`, inline: false },
                    )
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                ], 
    
            })
            await interaction.editReply({ //=========================================
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'zgłoszono problem', iconURL: 'https://img.icons8.com/nolan/64/light-off.png' })
                    .setColor('#FF6C00')
                    .addFields(
                        { name: "treść", value: `${value}`, inline: false },
                    )
                    .setFooter({ text: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
                    .setTimestamp()
                ], 
            })
        }
    }
}