const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "ban",
    description: "zbanuj urzytkownika",
    help: `\`<czas>Y/M/D/h/m/s\` - \`Y - lata\`, \`M - miesiące\`, \`D - dni\`, \`h - godziny\`, \`m - minuty\`, \`s - sekundy\`, 
    **przykład:** \`21D3h7m\`   (21 dni 3 godziny i 7 minut)`,
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
        if (!powód) powód = "gniew administracji cię dopadł!";
        let czas_message
        if (czas) {
            let tags = czas.split(/[^YMDhms]/g).filter(n => n);
            let numbers = czas.split(/[^0-9]/g).filter(n => n);
            let timeInSecs = 0
            numbers.forEach(t => {
                let tag = tags.shift()
                if(tag == "s" || !tag) return timeInSecs += 4; //sekundy
                if(tag == "m") return timeInSecs += (t*60); //minuty (60sek)
                if(tag == "h") return timeInSecs += (t*60*60); //godziny (3600sek)
                if(tag == "D") return timeInSecs += (t*60*60*24); //dni (86400sek)
                if(tag == "M") return timeInSecs += (t*60*60*24*30); //miesiące (2629743sek)
                if(tag == "Y") return timeInSecs += (t*60*60*24*365); //lata (31556926sek)
            })
            czas_message = `${czas} - ${timeInSecs} sek.`
        } else {
            czas_message = "czas nieokreślony"
        }
        await interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'ban', iconURL: 'https://i.imgur.com/cjrsd2B.png' })
                .setColor('#FFFFFF')
                .setDescription(`***urzytkownik*** ${user} ***został zbanowany przez:*** ${interaction.user}
                **na:** \`${czas_message}\`
                **powód:** \`\`\`${powód}\`\`\``)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
    }
}