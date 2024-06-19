const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "resume",
    description: "wznów odtwarzacz",
    perms: [],
    help: "",
    options: [], 
    async run(client, interaction) {

        client.FMP.resume(interaction)

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Wykonano`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}

