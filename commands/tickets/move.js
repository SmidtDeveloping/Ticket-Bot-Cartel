const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { isTicket } = require("../../controllers/ticketChecks");


module.exports = {

	name: "move",
	description: "Move de ticket naar een andere category",
	type: 'CHAT_INPUT',
    options: [
        {
            name: 'category',
            description: 'Select a category',
            type: 3,
            required: true
        }
    ]
,
	/**
	 *
	 * @param {import("../..").Bot} client
	 * @param {CommandInteraction} interaction
	 * @param {String[]} args
	 */
	run: async (client, interaction, args) => {
		const user = interaction.options.getString('category');
		const ticketData = await isTicket(interaction);
		if (!ticketData) {
			return interaction.reply({embeds: [
				new MessageEmbed()
					.setTitle("Ticket System \❌")
					.setDescription(client.languages.__("errors.channel_without_ticket"))
					.setColor("RED")
			], ephemeral: true});
		}

		if (ticketData.staffClaimed !== interaction.user.id) {
			return interaction.reply({embeds: [
				new MessageEmbed()
					.setTitle("Ticket System \❌")
					.setDescription(client.languages.__("commands.giveto.ticket_not_claimed_by_you"))
					.setColor("RED")
			], ephemeral: true});
		}

		

		interaction.reply({embeds: [
			new MessageEmbed()
				.setTitle("Ticket System \✅")
				.setDescription(client.languages.__mf("commands.move.ticket_moved_to", {
					user_mention: `<@${interaction.user.id}>`,
					cat: `<#${user}>`
				}))
				.setColor("GREEN")
		]})
	},
};