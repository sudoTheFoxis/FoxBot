const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "play",
    description: "niechaj zabrzmi muzyka",
    perms: [],
    help: "",
    options: [
        {
            name: "query",
            description: "podaj tytuł lub url audio",
            type: 3,
            required: "true",
        },
    ], 
    async run(client, interaction) {
        let query = interaction.options.getString("query")

        client.FMP.play(query, interaction)

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Pobieranie zasobu...`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}

