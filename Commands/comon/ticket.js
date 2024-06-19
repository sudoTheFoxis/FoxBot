const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "ticket",
    description: "uzyskaj pomoc od administracji",
    help: "stwórz prywatny kanał textowy w którym będziesz mógł na spokojnie poprosić o pomoc",
    perms: [],
    async run(client, interaction) {
        if (!client.ticketID) {
            client.ticketID = 0;
        }
        let categories = [
            {
                label: `przykładowy tytuł 1`,
                description: `przykładowy opis 1`,
                emoji: `🎫`,
                value: `1`, 
            }
        ]
        let SelectMenu = new Discord.StringSelectMenuBuilder()
            .setCustomId('FBI:Ticket')
            .setPlaceholder('kategoria zgłoszenia')
            .addOptions(categories)
        let TicketEmbed = await interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'ticket', iconURL: 'https://i.imgur.com/pfkuiXZ.png' })
                .setColor('#000FFF')
                .addFields(
                    { 
                    name: 'Wybierz kategorie swojego zgłoszenia', 
                    value: 'aby uzyskać pomoc od administracji najpierw wybierz kategorjię swojego zgłoszenia\n wiadomośc ma tylko 1 urzycie i będzie ona aktywna przez 60 sekund', 
                    inline: true 
                    },
                )
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
            components: [ new Discord.ActionRowBuilder()
                .addComponents(
                    SelectMenu
                ) 
            ], 
        })
        let collector = interaction.channel.createMessageComponentCollector({
            componentType: Discord.ComponentType.StringSelect,
            filter: collected => collected.user.id === interaction.user.id,
            max: 1,
            time: 60000,
        })

        collector.on("collect", async collected => {
            if(collected.customId !== "FBI:Ticket") return;
            collected.deferUpdate()
            let category = collected.values[0]
            let customMessage
            switch(category) {
                case "1":
                    customMessage = { 
                        name: 'przykładowy tytół 1', 
                        value: 'przykładowy zestaw poleceń 1',  
                        inline: true 
                    }
                    break;
            }


            // ============================================================================================ stwórz kategorię ticket
            let ticketCategory = await interaction.guild.channels.cache.find(channel => channel.name === "tickets" && channel.type === Discord.ChannelType.GuildCategory)
            if (!ticketCategory) {
                ticketCategory = await interaction.guild.channels.create({ name: "tickets", type: Discord.ChannelType.GuildCategory })
            }
            // ============================================================================================ pobranie obecnej liczby ticketów z bazy danych
            let ID
            let GDB = await client.DataHandler.get(interaction.guild.id)
            if (!GDB?.ticketCount) {
                ID = 1
                await client.DataHandler.create("Data", interaction.guild.id, { ticketCount: ID })
            } else {
                ID = GDB.ticketCount + 1
                await client.DataHandler.create("Data", interaction.guild.id, { ticketCount: ID })
            }
            // ============================================================================================ stwórz prywatny kanał ticket
            let TicketHelperRole = await interaction.guild.roles.cache.find(role => role.name === "TicketHelper")
            let newTicketChannel = await interaction.guild.channels.create({
                name: `ticket-${ID}`,
                type: Discord.ChannelType.GuildText,
                parent: ticketCategory.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id, // @everyone
                        deny: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages], 
                    },
                    {
                        id: TicketHelperRole.id, // ranga admina
                        allow: [Discord.PermissionFlagsBits.ReadMessageHistory, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: interaction.user.id, // urzytkownik
                        allow: [Discord.PermissionFlagsBits.ReadMessageHistory, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.ViewChannel]
                    },
                ],
            });
            // ============================================================================================ informacja o utworzeniu kanału
            await interaction.followUp({ 
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'ticket', iconURL: 'https://i.imgur.com/pfkuiXZ.png' })
                    .setColor('#000FFF')
                    .addFields(
                        { 
                        name: 'utworzono ticketa', 
                        value: `kliknij tutaj: ${newTicketChannel}, aby przenieść się na swój ticket`,  
                        inline: true 
                        },
                    )
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setTimestamp()
                ], 
                ephemeral: true, 
            })
            // ============================================================================================ wiadomość powitalna
            await newTicketChannel.send({ 
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'ticket', iconURL: 'https://i.imgur.com/pfkuiXZ.png' })
                    .setColor('#000FFF')
                    .setTitle(`Witaj ${interaction.user.username}!`)
                    .addFields(customMessage)
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setTimestamp()
                ], 
                components: [ new Discord.ActionRowBuilder().addComponents([
                    new Discord.ButtonBuilder()
                        .setLabel('🔒 Zamknij')
                        .setStyle(Discord.ButtonStyle.Primary)
                        .setCustomId('FB:ticket.close')
                    ])
                ], 
            })
        })
        collector.on('end', collected => {
            TicketEmbed.edit({ components: [new Discord.ActionRowBuilder().addComponents(SelectMenu.setDisabled(true))] })
        })
        return;
    },
    async innerRun(client, interaction, innerID) {
        if (innerID == 'close') {
            if(!interaction.channel.name.startsWith("ticket")) return;
            await interaction.deferReply({ ephemeral: false });
            let TicketHelperRole = interaction.guild.roles.cache.find(role => role.name === "TicketHelper")
            //if (!interaction.member.roles.cache.has(TicketHelperRole.id)) return;

            let archiwumCategory = interaction.guild.channels.cache.find(channel => channel.name === "archiwum" && channel.type === Discord.ChannelType.GuildCategory )
            if (!archiwumCategory) {
                archiwumCategory = await interaction.guild.channels.create({ name: "archiwum", type: Discord.ChannelType.GuildCategory });
            }
            await interaction.channel.setName(interaction.channel.name.replace("ticket", "closed"))
            await interaction.channel.setParent(archiwumCategory.id)
            await interaction.channel.permissionOverwrites.set([
                {
                    id: interaction.guild.id, // @everyone
                    deny: [Discord.PermissionFlagsBits.ViewChannel, Discord.PermissionFlagsBits.SendMessages], 
                },
                {
                    id: TicketHelperRole.id, // ranga admina
                    allow: [Discord.PermissionFlagsBits.ReadMessageHistory, Discord.PermissionFlagsBits.SendMessages, Discord.PermissionFlagsBits.ViewChannel]
                }
            ])
            interaction.editReply({ 
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'ticket', iconURL: 'https://i.imgur.com/pfkuiXZ.png' })
                    .setColor('#000FFF')
                    .addFields({ 
                        name: 'zamknięto Ticket', 
                        value: `ticket został zamknięty i zarchiwizowany na polecenie: **\`${interaction.user.username}\`**`,  
                        inline: true 
                    })
                    .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                    .setTimestamp()
                ], 
            })
        }
        return;
    }
}



/*
{ 
    name: 'oto twój ticket gdzie możesz zadać swoje pytania lub uzyskać pomoc od administracji.', 
    value: 'najpierw opisz swój problem lub pytanie.',  
    inline: true 
}
*/