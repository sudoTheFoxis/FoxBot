const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "mute",
    description: "zpraw aby inni zaniemówili...",
    help: "",
    perms: ["Administrator"],
    options: [
        {
            name: "urzytkownik",
            description: "wybierz obiekt działania twego",
            type: 6,
            required: "true",
        },
        {
            name: "powód",
            description: "czym ci podpadł owy nieszczęśnik?",
            type: 3,
            required: "false",
        },
        {
            name: "czas",
            description: "jak długo ma trwać twa decyzja?",
            type: 3,
            required: "false",
        },
    ],
    async run(client, interaction) {
        let user = interaction.options.getUser("urzytkownik");
        let powód = interaction.options.getString("powód");
        let czas = interaction.options.getString("czas");
    }
}