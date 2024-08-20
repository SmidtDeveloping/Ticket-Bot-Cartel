const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const { isTicket } = require("../../controllers/ticketChecks");
const { debug, error } = require("../../controllers/logger");
const staffInfo = [
	{ name: "Julian", categoryId: "1274082388124897361", linkedUserId: "1190271775649562658" },
	{ name: "Robbie", categoryId: "1274729411089924179", linkedUserId: "1190271775649562658" },
	{ name: "Snowy", categoryId: "1274739860539703358", linkedUserId: "1011703782058512497" },
	{ name: "Dylan", categoryId: "1274741260955156580", linkedUserId: "1219722155370221699" },
	{ name: "Milo", categoryId: "1274741325530402959", linkedUserId: "1065684651261300816" },
	{ name: "Ruben", categoryId: "1274741506703364138", linkedUserId: "1237140885293236294" },

];
module.exports = {
	name: "move",
	description: "Move the ticket to another category",
	type: 'CHAT_INPUT',
	options: [
		{
			name: 'category',
			description: 'Select a category',
			type: "STRING",
			required: true,
			choices: staffInfo.map(info => ({
                name: info.name, // The name displayed to the user
                value: info.categoryId   // The value sent with the command
            }))
		}
	],
	/**
	 * @param {import("../..").Bot} client
	 * @param {CommandInteraction} interaction
	 * @param {String[]} args
	 */
	run: async (client, interaction, args) => {
		const category = interaction.options.getString('category');
		const CheckCat = interaction.guild.channels.cache.get(category);
		debug(CheckCat);

		if (!CheckCat) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("commands.move.nocat"))
						.setColor("RED")
				], 
				ephemeral: true
			});
		}

		const ticketData = await isTicket(interaction);
		if (!ticketData) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("errors.channel_without_ticket"))
						.setColor("RED")
				], 
				ephemeral: true
			});
		}

		if (ticketData.staffClaimed !== interaction.user.id) {
			return interaction.reply({
				embeds: [
					new MessageEmbed()
						.setTitle("Ticket System \❌")
						.setDescription(client.languages.__("commands.giveto.ticket_not_claimed_by_you"))
						.setColor("RED")
				], 
				ephemeral: true
			});
		}

		let removedUsers = [];
		let addedUsers = [];

		try {
            // Fetch the channel from ticketData
            const ticketChannel = await interaction.guild.channels.fetch(ticketData.channelID);
            debug(`Fetched Channel ID: ${ticketChannel.id}, Name: ${ticketChannel.name}`);
            await ticketChannel.setParent(category);
            ticketData.parentID = category
            debug(`Channel moved to category ID: ${category}`);
            

            // Log current permission overwrites
            const currentPermissions = ticketChannel.permissionOverwrites.cache.map((overwrite) => ({
                id: overwrite.id,
                allow: overwrite.allow.toArray(),
                deny: overwrite.deny.toArray()
            }));

            // Fetch owner user object
            const owner = await interaction.guild.members.fetch(ticketData.ownerID);

            // Set permission to view channel
            await ticketChannel.permissionOverwrites.create(owner.id, {
                VIEW_CHANNEL: true
            }).then(() => {
                debug(`Updated permission for ${owner.user.username} to VIEW_CHANNEL: true`);
            })
            await ticketChannel.permissionOverwrites.create(interaction.guild.id, {
                VIEW_CHANNEL: false
            }).then(() => {
                debug(`Updated permission for everyone to VIEW_CHANNEL: false`);
            })

            // Log permissions after setting

            addedUsers.push(owner.user.username);

            // Remove permissions for all users in the ticketData.usersInTicket
            for (const id of ticketData.usersInTicket) {
                const member = await interaction.guild.members.fetch(id);

                // Log current permissions before changing
    
                await ticketChannel.permissionOverwrites.delete(member.id, {
                    VIEW_CHANNEL: false
                }).then(() => {
                    debug(`Updated permission for ${member.user.username} to VIEW_CHANNEL: false`);
                })
                ticketData.usersInTicket.remove(member.id);
		        ticketData.save();

                // Log permissions after setting

                removedUsers.push(member.user.username);
            }

            

            const staffMember = staffInfo.find(staff => staff.categoryId === category);
            console.log(staffMember);
            
            if (staffMember) {
                const staffUser = await interaction.guild.members.fetch(staffMember.linkedUserId);

                // Log current permissions before changing

                await ticketChannel.permissionOverwrites.create(staffUser.id, {
                    VIEW_CHANNEL: true
                }).then(() => {
                    debug(`Updated permission for ${staffUser.user.username} to VIEW_CHANNEL: true`);
                })

                // Log permissions after setting

                addedUsers.push(staffUser.user.username);
            } else {
                debug("No matching staff member found for this category.");
            }

            const NewPerms = ticketChannel.permissionOverwrites.cache.map((overwrite) => ({
                id: overwrite.id,
                allow: overwrite.allow.toArray(),
                deny: overwrite.deny.toArray()
            }));
            debug(`Current Permissions: ${JSON.stringify(NewPerms)}`);

            // Move the channel to the selected category
            
            // Reply with an embed containing the removed and added users
            const embed = new MessageEmbed()
                .setTitle("Ticket System \✅")
                .setDescription(client.languages.__mf("commands.move.ticket_moved_to", {
                    user_mention: `${interaction.user.username}`,
                    cat: `${staffMember.name}`
                }))
                .setColor("GREEN")
                .addField("Removed Users", removedUsers.length ? removedUsers.join('\n') : "None", true)
                .addField("Added Users", addedUsers.length ? addedUsers.join('\n') : "None", true);

            removedUsers.length = 0; // Clear removedUsers array
            addedUsers.length = 0;   // Clear addedUsers array

            return interaction.reply({ embeds: [embed], content: `<@${staffMember.linkedUserId}>` });

        } catch (error) {
            debug(`Error moving ticket: ${error.message}`);
            return interaction.reply({
                embeds: [
                    new MessageEmbed()
                        .setTitle("Ticket System \❌")
                        .setDescription(`An error occurred: ${error.message}`)
                        .setColor("RED")
                ],
                ephemeral: true
            });
        }
    },
};