const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "pause",
    description: "zatrzymaj odtwarzacz",
    perms: [],
    help: "",
    options: [], 
    async run(client, interaction) {

        client.FMP.pause(interaction)

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Wykonano`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}

