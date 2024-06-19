const Discord = require('discord.js')
const math = require('mathjs')

module.exports = {
    status: "ON",
    name: "moneta",
    description: "orzeł czy reszka?",
    help: "",
    perms: [],

    async run(client, interaction) {
        let result = Boolean(math.round(math.random())) ? "orzeł" : "reszka";
        return interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'moneta'})
            .setColor("3498DB")
            .setDescription(`Moneta została rzucona: \`${result}\`.`)
        ]})
    }
}
