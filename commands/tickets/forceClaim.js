const { CommandInteraction, MessageEmbed } = require("discord.js");
const { isTicket } = require("../../controllers/ticketChecks");

module.exports = {
	name: "forceclaim",
	description: "Claim a ticket",
	type: 'CHAT_INPUT',
	/**
	 *
	 * @param {import("../..").Bot} client
	 * @param {CommandInteraction} interaction
	 * @param {String[]} args
	 */
	run: async (client, interaction, args) => {
		const ticketData = await isTicket(interaction);
		if (!ticketData) {
			return interaction.reply({embeds: [
				new MessageEmbed()
					.setTitle("Ticket System \❌")
					.setDescription(client.languages.__("errors.channel_without_ticket"))
					.setColor("RED")
			], ephemeral: true});
		}
     function CheckStaff(interaction) {
        switch (interaction.user.id) {
            case interaction.guild.ownerId: // Owner / Robbie
                return true
               
                break;
        
            case "1190271775649562658": // Julian
            return true
            
            break;

            default:
                return false

                break;
        }
       }
       if (!CheckStaff(interaction)) {
        return interaction.reply({embeds: [
            new MessageEmbed()
                .setTitle("Ticket System \❌")
                .setDescription(client.languages.__("commands.forceClaim.tolow"))
                .setColor("RED")
        ], ephemeral: true});
       }

		// if (ticketData.isClaimed) {
		// 	return interaction.reply({embeds: [
		// 		new MessageEmbed()
		// 			.setTitle("Ticket System \❌")
		// 			.setDescription(client.languages.__mf("commands.claim.already_claimed", {
		// 				user_mention: `<@!${ticketData.staffClaimed}>`
		// 			}))
		// 			.setColor("RED")
		// 	], ephemeral: true});
		// }

		// ticketData.staffRoles.forEach((role) => {
		// 	const staffRole = interaction.guild.roles.cache.get(role);
		// 	if (staffRole) {
		// 		interaction.channel.permissionOverwrites.edit(role, {
		// 			VIEW_CHANNEL: false
		// 		});
		// 	}
		// });

		ticketData.staffClaimed = interaction.user.id;
		ticketData.isClaimed = true;
		await ticketData.save();

		interaction.reply({embeds: [
			new MessageEmbed()
				.setTitle("Ticket System \✅")
				.setDescription(client.languages.__mf("commands.claim.claimed", {
					user_mention: `<@!${interaction.user.id}>`,
					user_tag: interaction.user.tag
				}))
				.setColor("GREEN")
		], ephemeral: false});
	},
};