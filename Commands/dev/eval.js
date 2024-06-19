const Discord = require('discord.js')
module.exports = {
    status: "ON",
    name: "eval",
    description: "wykonaj kawałek kodu z poziomu bota",
    perms: ["BotAdmin"],
    options: [
        {
            name: "kod",
            description: "tu wpisz kod który ma zostać wykonany...",
            type: 3,
            required: "true",
        },
    ],
    async run(client, interaction) {
        let util = require("util")
        let code = interaction.options.getString("kod")

        try {
            let evaled = await eval(code)
            if(typeof(evaled) !== "string") evaled = util.inspect(evaled);
            await interaction.editReply({ 
                embeds: [ 
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: 'eval', iconURL: 'https://i.imgur.com/PSyukAX.png' })
                        .setColor('#000FFF')
                        .setDescription(`**Podany kod został wykonany:**\n\`\`\`js\n                                     \n${code.substring(0, 3750)}\`\`\``),
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Wyjście:' })
                        .setColor('#000FFF')
                        .setDescription(`\`\`\`js\n                                     \n${evaled.substring(0, 3800)}\`\`\``)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                ], 
            })
        } catch(error) {
            await interaction.editReply({ 
                embeds: [ 
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: 'eval', iconURL: 'https://i.imgur.com/iwTyPFG.png' })
                        .setColor('#000FFF')
                        .setDescription(`**Wystąpił błąd podczas wykonywania następującego kodu:**\n\`\`\`js\n                                     \n${code.substring(0, 3750)}\`\`\``),
                    new Discord.EmbedBuilder()
                        .setAuthor({ name: 'Error:' })
                        .setColor('#000FFF')
                        .setDescription(`\`\`\`js\n                                     \n${util.inspect(error).substring(0, 3750)}\`\`\``)
                        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                        .setTimestamp()
                ], 
            })
        }
    }
}
/* 
Dori me\n
Interimo, adapare\n
Dori me\n
Ameno, Ameno\n
Latire\n
Latiremo\n
Dori me\n
Ameno\n
Omenare imperavi ameno\n
Dimere, dimere matiro\n
Matiremo\n
Ameno\n
Omenare imperavi emulari, ameno\n
Omenare imperavi emulari, ameno\n
Ameno dore\n
Ameno dori me\n
Ameno dori me\n
Ameno dom\n
Dori me reo\n
Ameno dori me\n
Ameno dori me\n
Dori me am\n
Ameno\n
Omenare imperavi ameno\n
Dimere dimere matiro\n
Matiremo\n
Ameno\n
Omenare imperavi emulari, ameno\n
Omenare imperavi emulari, ameno\n
Ameno dore\n
Ameno dori me\n
Ameno dori me\n
Ameno dom\n
Dori me reo\n
Ameno dori me\n
Ameno dori me\n
Dori me\n
Ameno dori me\n
Ameno dori me\n
Dori me (dori me, dori me, dori me)\n
(Dori me, dori me, dori me)\n
Ameno\n
Ameno dore\n
Ameno dori me\n
Ameno dori me\n
Ameno dom\n
Dori me reo\n
Ameno dori me\n
Ameno dori me\n
Dori me dom\n
Ameno dore\n
Ameno dori me\n
Ameno dori me\n
Ameno dom\n
Dori me reo\n
Ameno dori me\n
https://www.youtube.com/watch?v=RkZkekS8NQU
*/