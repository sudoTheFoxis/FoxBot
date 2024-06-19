const Discord = require("discord.js");

module.exports = {
    status: "ON",
    name: "seek",
    description: "przewiń muzyke",
    perms: [],
    help: `umożliwia przewijanie muzyki
    wprowadź czas w formacie:
    • \`HH:MM:SS\` lub \`MM:SS\` aby przenieść się w konkretny momęt muzyki.
    • \`SS\` aby przewinąć muzyke do tyłu lub do przodu.
    Przykłady:
    • \`/seek 20\` - przewija muzyke o 20 sekund do przodu.
    • \`/seek -5\` - przewija muzyke o 5 sekund do tyłu.
    • \`/seek 00:30\` - ustawia czas odtwarzania muzyki na 30 sekundę.
    • \`/seek 03:50\` - ustawia czas odtwarzania muzyki na 3 minuty i 50 sekund.
    przeniesienie się w moment poniżej 0 odtworzy muzyke od początku,
    przeniesienie się w momęt wykraczający poza czas trwania obecnie odtwarzanej muzyki spowoduje pominięcie utworu.`,
    options: [
        {
            name: "time",
            description: "przewiń muzyke o konkretny czas lub przenieś się do wybranego momętu",
            type: 3,
            required: "true",
        },
    ], 
    async run(client, interaction) {
        let time = interaction.options.getString("time")

        client.FMP.seek(interaction, time)

        interaction.editReply({ embeds: [new Discord.EmbedBuilder()
            .setAuthor({name: 'Fox Music Player'})
            .setColor("3498DB")
            .setDescription(`Wykonano`)
            //.setDescription(`Moduł muzyczny jest niedostepny`)
        ]})
    }
}

