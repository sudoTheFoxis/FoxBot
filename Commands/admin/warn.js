const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "warn",
    description: "upomnij urzytkownika",
    help: "HH:MM:SS",
    perms: ["Administrator"],
    options: [
        {
            name: "urzytkownik",
            description: "wybierz ofiare swojego działania",
            type: 6,
            required: "true",
        },
        {
            name: "powód",
            description: "powód upomnienia",
            type: 3,
            required: "false",
        },
        {
            name: "czas",
            description: "za jaki czas upomnienie wygaśnie",
            type: 3,
            required: "false",
        },
    ],
    async run(client, interaction) {
        let user = interaction.options.getUser("urzytkownik");
        let powód = interaction.options.getString("powód");
        let czas = interaction.options.getString("czas");

        if (!powód) powód = "gniew administracji cię dopadł!";
        if (!czas) czas = "24h"; // "<czas>Y/M/h/m/s" lub "nigdy"

        let format_time = (input) => {
            let tags = input.split(/[^LMDhms]/g).filter(n => n);
            let numbers = input.split(/[^0-9]/g).filter(n => n);
            let timeInSecs = 0
            numbers.forEach(t => {
                let tag = tags.shift()
                if(tag == "s" || !tag) return timeInSecs += 4; //sekundy
                if(tag == "m") return timeInSecs += (t*60); //minuty (60sek)
                if(tag == "h") return timeInSecs += (t*60*60); //godziny (3600sek)
                if(tag == "D") return timeInSecs += (t*60*60*24); //dni (86400sek)
                if(tag == "M") return timeInSecs += (t*60*60*24*30); //miesiące (2629743sek)
                if(tag == "L") return timeInSecs += (t*60*60*24*365); //lata (31556926sek)
            })
            return timeInSecs
        }

        let czas_formatted = format_time(czas)
        let warn_count = 1

        await interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'ban', iconURL: 'https://i.imgur.com/cjrsd2B.png' })
                .setColor('#FFFFFF')
                .setDescription(`***urzytkownik*** ${user} ***otrzymał upomnienie od:*** ${interaction.user}
                **za:** \`\`\`${powód}\`\`\`
                **wygasa po:** \`${czas}\` - \`${czas_formatted}\` sek.
                **jest to jego:** \`${warn_count}\` **upomnienie**`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
    }
}