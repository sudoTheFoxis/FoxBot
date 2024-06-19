const Discord = require('discord.js')
module.exports = {
    bindEvent(client) { 
        client.on('interactionCreate', this.execute.bind(null, client))
    },
    async execute(client, interaction) {
        let PermsTable = { // Discord Permissions Table
            "AddReactions": Discord.PermissionsBitField.Flags.AddReactions,
            "Administrator": Discord.PermissionsBitField.Flags.Administrator,
            "AttachFiles": Discord.PermissionsBitField.Flags.AttachFiles,
            "BanMembers": Discord.PermissionsBitField.Flags.BanMembers,
            "ChangeNickname": Discord.PermissionsBitField.Flags.ChangeNickname,
            "Connect": Discord.PermissionsBitField.Flags.Connect,
            "CreateInstantInvite": Discord.PermissionsBitField.Flags.CreateInstantInvite,
            "CreatePrivateThreads": Discord.PermissionsBitField.Flags.CreatePrivateThreads,
            "CreatePublicThreads": Discord.PermissionsBitField.Flags.CreatePublicThreads,
            "DeafenMembers": Discord.PermissionsBitField.Flags.DeafenMembers,
            "EmbedLinks": Discord.PermissionsBitField.Flags.EmbedLinks,
            "KickMembers": Discord.PermissionsBitField.Flags.KickMembers,
            "ManageChannels": Discord.PermissionsBitField.Flags.ManageChannels,
            "ManageEvents": Discord.PermissionsBitField.Flags.ManageEvents,
            "ManageGuild": Discord.PermissionsBitField.Flags.ManageGuild,
            "ManageGuildExpressions": Discord.PermissionsBitField.Flags.ManageGuildExpressions,
            "ManageMessages": Discord.PermissionsBitField.Flags.ManageMessages,
            "ManageNicknames": Discord.PermissionsBitField.Flags.ManageNicknames,
            "ManageRoles": Discord.PermissionsBitField.Flags.ManageRoles,
            "ManageThreads": Discord.PermissionsBitField.Flags.ManageThreads,
            "ManageWebhooks": Discord.PermissionsBitField.Flags.ManageWebhooks,
            "MentionEveryone": Discord.PermissionsBitField.Flags.MentionEveryone,
            "ModerateMembers": Discord.PermissionsBitField.Flags.ModerateMembers,
            "MoveMembers": Discord.PermissionsBitField.Flags.MoveMembers,
            "MuteMembers": Discord.PermissionsBitField.Flags.MuteMembers,
            "PrioritySpeaker": Discord.PermissionsBitField.Flags.PrioritySpeaker,
            "ReadMessageHistory": Discord.PermissionsBitField.Flags.ReadMessageHistory,
            "RequestToSpeak": Discord.PermissionsBitField.Flags.RequestToSpeak,
            "SendMessages": Discord.PermissionsBitField.Flags.SendMessages,
            "SendMessagesInThreads": Discord.PermissionsBitField.Flags.SendMessagesInThreads,
            "SendTTSMessages": Discord.PermissionsBitField.Flags.SendTTSMessages,
            "SendVoiceMessages": Discord.PermissionsBitField.Flags.SendVoiceMessages,
            "Speak": Discord.PermissionsBitField.Flags.Speak,
            "Stream": Discord.PermissionsBitField.Flags.Stream,
            "UseApplicationCommands": Discord.PermissionsBitField.Flags.UseApplicationCommands,
            "UseEmbeddedActivities": Discord.PermissionsBitField.Flags.UseEmbeddedActivities,
            "UseExternalEmojis": Discord.PermissionsBitField.Flags.UseExternalEmojis,
            "UseExternalSounds": Discord.PermissionsBitField.Flags.UseExternalSounds,
            "UseExternalStickers": Discord.PermissionsBitField.Flags.UseExternalStickers,
            "UseSoundboard": Discord.PermissionsBitField.Flags.UseSoundboard,
            "UseVAD": Discord.PermissionsBitField.Flags.UseVAD,
            "ViewAuditLog": Discord.PermissionsBitField.Flags.ViewAuditLog,
            "ViewChannel": Discord.PermissionsBitField.Flags.ViewChannel,
            "ViewCreatorMonetizationAnalytics": Discord.PermissionsBitField.Flags.ViewCreatorMonetizationAnalytics,
            "ViewGuildInsights": Discord.PermissionsBitField.Flags.ViewGuildInsights
        }
        // ======================================================================================================= slash command
        if (interaction.isCommand()) {
            //------------------------------------------- check if command exists
            await interaction.deferReply({ ephemeral: false });
            let cmd = client.Commands.get(interaction.commandName)
            if (!cmd) {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
                    .setAuthor({name: '[Command Handler ERROR]', iconURL: 'https://i.imgur.com/hfTfhIk.png',})
                    .setColor("E10000")
                    .setDescription("ta komenda została wyłączona lub nie została wczytana poprawnie" + " ‍ ‍ ‍ ‍" + ":x:")
                ]})
            }
            //------------------------------------------- perms check
            if (cmd.perms && cmd.perms.length) {
                if (cmd.perms.includes("BotAdmin")) { 
                    if (client.config.BotAdminID) {
                        if (interaction.member.id != client.config.BotAdminID) {
                            return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
                                .setAuthor({name: 'Command permissions', iconURL: 'https://i.imgur.com/55WaNWc.png',})
                                .setColor("E10000")
                                .setDescription(`ta komenda jest przeznaczona dla administratora bota, a ty nim nie jesteś` + " ‍ ‍ ‍ ‍" + ":x:")
                            ]})
                        }
                    } else {
                        return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
                            .setAuthor({name: 'Command permissions', iconURL: 'https://i.imgur.com/55WaNWc.png',})
                            .setColor("E10000")
                            .setDescription(`ID administratora nie jest zdefiniowanie, awięc komendy przeznaczone dla administratora są niedostępne.` + " ‍ ‍ ‍ ‍" + ":x:")
                        ]})
                    }
                } else {
                    let code = []
                    cmd.perms.forEach(p => {
                        let x = PermsTable[p]
                        code.push(x?x:p)
                    })
                    if (!interaction.member.permissions.has(code) || interaction.member.id != client.config.BotAdminID)
                    return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
                        .setAuthor({name: 'Command permissions', iconURL: 'https://i.imgur.com/ToK2QvB.png',})
                        .setColor("E10000")
                        .setDescription(`nie masz wymaganych uprawnień: \`${cmd.perms.join("`,`")}\`` + " ‍ ‍ ‍ ‍" + ":x:") //.join(`\`\``)
                    ]})
                }
            }
            //------------------------------------------- command execute
            try {
                await cmd.run(client, interaction)
            } catch (error) {
                let now = client.utils.getNow()
                console.log(`\x1b[31m[${now.time}] [System Anti Crash] command\x1b[0m: \x1b[33m${cmd.name}\x1b[0m \n${error} \n `)
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
                    .setAuthor({name: 'System Anti Crash', iconURL: 'https://i.imgur.com/hfTfhIk.png',})
                    .setColor("FF0000")
                    .setDescription("Próba uruchomienia tej komendy się nie powiodła..." + " ‍ ‍ ‍ ‍" + ":x:")
                ]})
            }
        };
        // ======================================================================================================= buttons
        // FB:<Command>.<InnerID> lub FBI:<command>.<InnerID>
        // FB = FoxBot, FBI = FoxBot Internal 
        if (interaction.isButton()) {
            if(!interaction.customId.startsWith("FB:")) return;
            let ID = interaction.customId.replace("FB:", "").split(".")
            let cmd = client.Commands.get(ID[0])
            if (!cmd) {
                return interaction.reply({ embeds: [new Discord.EmbedBuilder()
                    .setAuthor({name: '[Command Handler ERROR]', iconURL: 'https://i.imgur.com/hfTfhIk.png',})
                    .setColor("E10000")
                    .setDescription("ta komenda została wyłączona lub nie została wczytana poprawnie" + " ‍ ‍ ‍ ‍" + ":x:")
                ]})
            }
            try {
                await cmd.innerRun(client, interaction, ID[1])
            } catch (error) {
                let now = client.time.getNow()
                console.log(`\x1b[31m[${now.time}] [System Anti Crash] command function\x1b[0m: \x1b[33m${ID.join(".")}\x1b[0m \n${error} \n `)
                return interaction.reply({ embeds: [new Discord.EmbedBuilder()
                    .setAuthor({name: 'System Anti Crash', iconURL: 'https://i.imgur.com/hfTfhIk.png',})
                    .setColor("FF0000")
                    .setDescription("Próba uruchomienia tej funkcji się nie powiodła..." + " ‍ ‍ ‍ ‍" + ":x:")
                ]})
            }
        }
        // ======================================================================================================= dropdownmenu
        if (interaction.isStringSelectMenu()) {
            if(!interaction.customId.startsWith("FB:")) return;
            let ID = interaction.customId.replace("FB:", "").split(".")
        }
    }
}