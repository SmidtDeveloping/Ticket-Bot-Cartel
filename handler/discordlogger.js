const client = require("../index")
const config = require("../config/config.json")
const { MessageEmbed } = require("discord.js")

async function sendLog(type, message) {
    const guild = await client.guilds.fetch(config["GUILD-ID"])
const channel = guild.channels.cache.get("1282353385739128936")
    let embed = new MessageEmbed()
    switch (type) {
        case "goed":
            embed.setColor("GREEN")
            break;
            case "tussenin":
                embed.setColor("ORANGE")
            break
        case "fout":
            embed.setColor("RED")
            break;
        default:
            break;
    }


    embed.setTitle("Logger")
    embed.setDescription(`${message}`)
    
    channel.send({embeds: [embed]})
}



module.exports = sendLog