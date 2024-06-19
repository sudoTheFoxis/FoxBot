const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "connect",
    description: "zaproś bota na kanał głosowy",
    perms: [],
    help: "",
    options: [
        {
            name: "vc",
            description: "podaj kanał na jaki ma wejść bot",
            type: 7,
            required: "false",
        },
    ], 
    async run(client, interaction) {
        let VC = interaction.options.getChannel("vc");
        if(!VC) VC = interaction;
        client.FMP.connect(VC);

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Wykonano`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}

