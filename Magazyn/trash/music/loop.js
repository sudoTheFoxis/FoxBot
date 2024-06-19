const Discord = require('discord.js')

module.exports = {
    status: "ON",
    name: "loop",
    description: "zapętl pojedyńczą muzyke lub całą liste",
    perms: [],
    async run(client, interaction) {
        return interaction.editReply({ 
            embeds: [ new Discord.EmbedBuilder()
                .setAuthor({ name: 'Plyer', iconURL: 'https://i.imgur.com/b3UrfPm.png' })
                .setColor('#000FFF')
                .setDescription(`System Muzyczny jest niedostępny...`)
                .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
                .setTimestamp()
            ], 
        })
        let Queue = await client.FMP.getQueue(interaction)
        if(!Queue) return 1;
        //Queue.loop = "queue" // possible inputs: "none",0,"song",1,"queue",2, not recommended
        //Queue.loop // returns current loop mode
        await Queue.loop("queue")
    }
}