const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "nowplaying",
    description: "sprawdź jaka muzyka obecnie jest odtwarzana",
    perms: [],
    help: "",
    options: [], 
    async run(client, interaction) {

        let song = client.FMP.nowPlaying(interaction)
        console.log(song)

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Wykonano`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}
