const Discord = require("discord.js")
const math = require('mathjs')

module.exports = {
    status: "ON",
    name: "calculator",
    description: "urzyj kalkulatora",
    help: "",
    perms: [],
    options: [],

    async run(client, interaction) {
        //return interaction.editReply(`ta komenda nie jest jeszcze skończona`)
        let S = Discord.ButtonStyle
        let memory = " "
        let value = " "
        let ButtonsText = [ // 5 x 5 (Max for one message), new format
            {n: "(", s: S.Primary, d: false }, {n: ")", s: S.Primary, d: false }, 
            {n: "^", s: S.Primary, d: false }, {n: "%", s: S.Primary, d: false }, 
            {n: "AC", s: S.Danger, d: false }, //

            {n: "7", s: S.Secondary, d: false }, {n: "8", s: S.Secondary, d: false }, 
            {n: "9", s: S.Secondary, d: false }, {n: "÷", s: S.Primary, d: false }, 
            {n: "DC", s: S.Danger, d: false }, //

            {n: "4", s: S.Secondary, d: false }, {n: "5", s: S.Secondary, d: false }, 
            {n: "6", s: S.Secondary, d: false }, {n: "x", s: S.Primary, d: false }, 
            {n: "⌫", s: S.Danger, d: false }, //

            {n: "1", s: S.Secondary, d: false }, {n: "2", s: S.Secondary, d: false }, 
            {n: "3", s: S.Secondary, d: false }, {n: "-", s: S.Primary, d: false }, 
            {n: "\u200b", s: S.Secondary, d: true }, //

            {n: ".", s: S.Secondary, d: false }, {n: "0", s: S.Secondary, d: false }, 
            {n: "=", s: S.Success, d: false }, {n: "+", s: S.Primary, d: false }, 
            {n: "\u200b", s: S.Secondary, d: true }, //
        ]
        /* let text = [ //old format
            "(", ")", "^", "%", "AC",
            "7", "8", "9", "÷", "DC",
            "4", "5", "6", "x", "⌫",
            "1", "2", "3", "-", "\u200b",
            ".", "0", "=", "+", "\u200b",
        ];*/
        let ComponentsRow = await createButtonsRow(ButtonsText);
        let Embed = new Discord.EmbedBuilder()
            .setAuthor({
                name: "calculator",
                iconURL: "https://i.imgur.com/R0ms8Dw.png"
            })
            .setColor("F93CCA")
            .setDescription("```                                     \n" + memory + "\n>" + value + "```") //99999999999999999999999999999999999999999999999999999999
        let CalculatorEmbed = await interaction.editReply({
            embeds: [ Embed ],
            components: ComponentsRow
        })
        let collector = CalculatorEmbed.createMessageComponentCollector({
            componentType: Discord.ComponentType.Button, 
            time: 240000,
        })
        collector.on("collect", async button => {
            if (!button.customId.startsWith('FBI:calc.')) return;
            let buttonText = button.customId.replace('FBI:calc.', '')
            button.deferUpdate()

            //if(['0','1','2','3','4','5','6','7','8','9','(',')','^','%'].includes(buttonText)) 
            //if (['+','-','x','÷'].includes(buttonText)) {

            if (buttonText == "AC") {
                memory = " "
                value = " "
                await CalculatorEmbed.edit({
                    embeds: [ Embed.setDescription("```                                     \n" + memory + "\n>" + value + "```") ]
                })
                
            } else if (buttonText == "DC") {
                collector.stop()
                await CalculatorEmbed.delete()
            } else if (buttonText == "=") {
                memory = value
                let result 
                try {
                    result = await math.evaluate(value.replaceAll('x', '*').replaceAll('÷', '/'))
                } catch(e) {
                    result = "ERROR"
                }  
                value = " " + result
                await CalculatorEmbed.edit({
                    embeds: [ Embed.setDescription("```                                     \n" + memory + "\n>" + value + "```") ]
                })
            } else if (buttonText == "⌫") {
                if (value === ' ' || value === '' || value === null || value === undefined) return;
                value = value.slice(0, -1)
                await CalculatorEmbed.edit({
                    embeds: [ Embed.setDescription("```                                     \n" + memory + "\n>" + value + "```") ]
                })

            } else {
                value += buttonText
                await CalculatorEmbed.edit({
                    embeds: [ Embed.setDescription("```                                     \n" + memory + "\n>" + value + "```") ]
                })

            }
        })


        //funkcje
        async function createButtonsRow(ButtonsText) {
            let createButton = (ButtonsText) => {
                let button = new Discord.ButtonBuilder()
                    .setLabel(ButtonsText.n)
                    .setStyle(ButtonsText.s)
                    .setCustomId('FBI:calc.' + ButtonsText.n)
                    .setDisabled(ButtonsText.d)

                if ( ButtonsText.n === '\u200b' ) button.setCustomId(`${random(4)}`);
                return button;    
            }

            let ComponentsRow = []
            let ButtonsRows = new Array([], [], [], [], []) // [] = 5 
            let currentRow = 0
            for (let i = 0; i < ButtonsText.length; i++) {
                if (ButtonsRows[currentRow].length === 5) currentRow++;
                ButtonsRows[currentRow].push(await createButton(ButtonsText[i]))
            }
            for(let Buttons of ButtonsRows) { //rozdziela grupy przycisków
                ComponentsRow.push(new Discord.ActionRowBuilder().addComponents(Buttons))
            }
            return ComponentsRow;
        }
        function random(length = 8) {
            return Math.random().toString(16).substr(2, length);
        };


    }   
}
/*
        let button = new Array([], [], [], [], []) //[] = 5
        let row = []
        let text = [
            "clear", "(", ")", "/", 
            "7", "8", "9", "*", 
            "4", "5", "6", "-", 
            "1", "2", "3", "+", 
            ".", "0", "⌫", "="];
        let current = 0;

        for(let i = 0; i < text.length; i++) {
            if (button[current].length === 4) current++;
            button[current].push(createButton(text[i]));
            if (i === text.length - 1 ) {
                for(let btn of button) row.push(addRow(btn))
            }
        }


        function addRow(btns) {
            let row1 = new Discord.MessageActionRow()
            for(let btn of btns) {
                row1.addComponents(btn)
            }
            return row1;
        }
        function createButton(label, style = "SECONDARY") {
            if (label === "clear") style = "DANGER"
            else if (label === "." || label === "⌫") style = "SECONDARY"
            else if (label === "=") style = "SUCCESS"
            else if (isNaN(label)) style = "PRIMARY"

            let btn = new Discord.MessageButton()
                .setLabel(label)
                .setStyle(style)
                .setCustomId("calculator" + label);

            return btn;
        }
        function mathEval(input) {
            try {
                let res = math.evaluate(input)
                return res;
            } catch(error) {
                return "Wrong input!";
            }
        }
*/