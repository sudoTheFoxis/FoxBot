const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "stop",
    description: "wyłącz odtwarzacz",
    perms: [],
    help: "",
    options: [], 
    async run(client, interaction) {
        
        client.FMP.stop(interaction)

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Wykonano`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}

