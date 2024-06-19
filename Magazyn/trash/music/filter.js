const Discord = require('discord.js')
const { filter } = require('mathjs')
module.exports = {
    status: "ON",
    name: "filter",
    description: "nałóż efekt dźwiękowy na muzyke",
    perms: [],
    options: [
        {
            name: "add",
            description: "dodaj wybrane filtry",
            type: 1,
            options: [
                {
                    name: "filters",
                    description: "filtry ffmpeg",
                    type: 3,
                    required: "true",
                },
            ]
        },
        {
            name: "del",
            description: "usuń wybrane filtry",
            type: 1,
            options: [
                {
                    name: "filters",
                    description: "filtry ffmpeg",
                    type: 3,
                    required: "true",
                },
            ]
        },
        {
            name: "set",
            description: "nadpisz obecne filtry",
            type: 1,
            options: [
                {
                    name: "filters",
                    description: "filtry ffmpeg",
                    type: 3,
                    required: "true",
                },
            ]
        },
        {
            name: "get",
            description: "wyświetl obecnie urzywane filtry",
            type: 1
        },
        {
            name: "clear",
            description: "wyłącz wszystkie filtry",
            type: 1
        },
        {
            name: "list",
            description: "wyświetl dostępne filtry",
            type: 1
        },
    ],
    async run(client, interaction) {
        let cmd = interaction.options._subcommand
        let filters = interaction.options?._hoistedOptions

        let queue = client.FMP.getQueue(interaction)
        if(!queue) return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`aby nałożyć filtry na muzyke, najpierw trzeba jakąś puścić`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })

        switch(cmd) {
            case "add": //========================================================================= add
                await Queue.FilterManager.add(filters)
                interaction.editReply({ 
                    embeds: [ new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                        .setColor('#000FFF')
                        .setDescription(`nastepujące filtry zostały dodane: \n${filters}`)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                    ], 
                })
                break;

            case "del": //========================================================================= del
                await Queue.FilterManager.del(filters)
                interaction.editReply({ 
                    embeds: [ new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                        .setColor('#000FFF')
                        .setDescription(`nastepujące filtry zostały usunięte: \n${filters}`)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                    ], 
                })
                break;

            case "set": //========================================================================= set
                await Queue.FilterManager.set(filters)
                interaction.editReply({ 
                    embeds: [ new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                        .setColor('#000FFF')
                        .setDescription(`obecna lista filtrów została nadpisana następującą:\n${filters}`)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                    ], 
                })
                break;

            case "clear": //======================================================================= clear
                await Queue.FilterManager.clear()
                interaction.editReply({ 
                    embeds: [ new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                        .setColor('#000FFF')
                        .setDescription(`wszystkie filtry zostały wyłączone`)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                    ], 
                })
                break;

            case "get": //========================================================================= get
                filters = await Queue.FilterManager.get()
                console.log(filters)
                interaction.editReply({ 
                    embeds: [ new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                        .setColor('#000FFF')
                        .setDescription(`\*\*\*Obecnie urzywane filtry:\*\*\* \n${filters}`)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                    ], 
                })
                break;

            case "list": //========================================================================= get
                filters = await Queue.FilterManager.list()
                interaction.editReply({ 
                    embeds: [ new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                        .setColor('#000FFF')
                        .setDescription(`\*\*\*dostępne filtry:\*\*\* \n${filters}\nmożesz takrze stwożyć swój customowy filter ffmpeg`)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                    ], 
                })
                break;
        }



        return;
        await Queue.FilterManager.add(filters)
        await Queue.FilterManager.del(filters)
        await Queue.FilterManager.set(filters)
        await Queue.FilterManager.clear()
        await Queue.FilterManager.get()
        await Queue.FilterManager.getFormatted()
        interaction.editReply({ 
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