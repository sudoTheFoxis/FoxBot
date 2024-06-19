const Discord = require('discord.js')
const fs = require('fs')

module.exports = {
    status: "ON",
    name: "help",
    description: "wyświetla komendy",
    help: "***Just do it, i know you can...***",
    perms: [],
    options: [
        {
            name: "komenda",
            description: "wpisz nazwe komendy aby wyświelić zposób jej urzycia",
            type: 3,
            required: "false",
        },
    ],
    async run(client, interaction) {
        let komenda = interaction.options.getString("komenda")
        if (!komenda) {
            let categories = []
            let CommandsDir = "./Commands"
            fs.readdirSync(`${CommandsDir}/`).forEach(dir => {
                let category_info = require(`../${dir}/category_info.json`)
                if (category_info) {
                    let info = {}
                    info.label = (typeof category_info.name == "string" && category_info.name.length > 0) ? category_info.name : dir;
                    info.description = (typeof category_info.description == "string" && category_info.description.length > 0) ? category_info.description : "undefined";
                    info.emoji = (typeof category_info.emoji == "string" && category_info.emoji.length == 2) ? category_info.emoji : "📁";
                    info.value = dir
                    categories.push(info)
                }
            })
            let SelectMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId('FBI:HelpMenu')
                .setPlaceholder('kategoria komend')
                .addOptions(categories)
            let HelpEmbed = await interaction.editReply({ 
                embeds: [ new Discord.EmbedBuilder()
                    .setAuthor({ name: 'Help', iconURL: 'https://i.imgur.com/2stegPd.png' })
                    .setColor('#000FFF')
                    .addFields(
                        { 
                        name: 'Wybierz kategorie aby wyświetlić komendy z ich opisem, lub urzyj \`/help <nazwa-komendy>\` aby wyświetlić sposób użycia.', 
                        value: 'komendy zostały podzielone na kategorie ponieważ jest ich zbyt wiele na jedną liste...', 
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
                ]
            })
            let collector = interaction.channel.createMessageComponentCollector({
                componentType: Discord.ComponentType.StringSelect,
                max: 10,
                time: 60000,
            })
            collector.on("collect", async collected => {
                if(collected.customId !== "FBI:HelpMenu") return;
                collected.deferUpdate()
                let category = collected.values[0]
                let commands_info = await getCategoryCommands(category, client).join('\n')
                await HelpEmbed.edit({ embeds: [
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Help', iconURL: 'https://i.imgur.com/2stegPd.png' })
                        .setColor('#000FFF')
                        .setTitle(`komendy kategorji: ${category}`)
                        .setDescription(commands_info ? commands_info : 'brak komend do wyświetlenia')
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                ]})
            })
            collector.on('end', collected => {
                HelpEmbed.edit({ components: [new Discord.ActionRowBuilder().addComponents(SelectMenu.setDisabled(true))] })
            })
            function getCategoryCommands(category, client) {
                let commands_info = []
                fs.readdirSync(`./Commands/${category}/`).filter(file => file.endsWith('.js')).forEach(file => {
                    let commandFile = require(`../${category}/${file}`)
                    if(!client.Commands.get(commandFile.name)) return;
                    commands_info.push(`• **/${commandFile.name}** - \`${commandFile.description}\``)
                })
                return commands_info
            }
            return;
        } else {
            let cmd = client.Commands.get(komenda)
            if(!cmd || !cmd?.help) {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
                    .setAuthor({name: 'Help', iconURL: 'https://i.imgur.com/2stegPd.png',})
                    .setColor("000FFF")
                    .setDescription(`komenda o podanej nazwie: \`${komenda}\` nie istnieje, bądź nie posiada instrukcji obsługi.`)
                ]})
            } else {
                return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
                    .setAuthor({name: 'Help', iconURL: 'https://i.imgur.com/2stegPd.png',})
                    .setColor("000FFF")
                    .addFields(
                        { 
                            name: `> sposób użycia komendy: \`${komenda}\``, 
                            value: `${cmd.help}`, 
                            inline: true 
                        },
                    )
                ]})
            }
        }
    }
}
