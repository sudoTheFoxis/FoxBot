const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "volume",
    description: "zmień głośność odtwarzania",
    perms: [],
    help: "",
    options: [
        {
            name: "lvl",
            description: "podaj poziom głośności",
            type: 10,
            required: "true",
        },
    ], 
    async run(client, interaction) {
        let lvl = interaction.options.getNumber("lvl")

        client.FMP.volume(interaction, lvl)

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Wykonano`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}

