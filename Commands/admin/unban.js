const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "unban",
    description: "odbanuj urzytkownika",
    help: "",
    perms: ["Administrator"],
    options: [
        {
            name: "urzytkownik",
            description: "wybierz obiekt działania twego",
            type: 6,
            required: "true",
        }
    ],
    async run(client, interaction) {
        let user = interaction.options.getUser("urzytkownik");
    }
}