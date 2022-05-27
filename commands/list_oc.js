const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list_oc")
    .setDescription("Edit your OC data such as avatar."),
  async execute(interaction, client) {
    const user = interaction.user;
    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const searchUserOcs = Object.entries(userOcs).find(u => u[0] == user.id);

    const embed = new MessageEmbed()
      .setAuthor({ name: client.user.username, iconURL: client.user.defaultAvatarURL })
      .setDescription("Press the button to show OC's detail.");
    Object.entries(searchUserOcs[1]).forEach((o) => {
      embed.addField(o[0], o[1]["name"], true);
    });
    const buttons = new MessageActionRow();
    Object.entries(searchUserOcs[1]).forEach((o) => {
      buttons.addComponents(
        new MessageButton()
          .setCustomId(o[0])
          .setLabel(o[1]["name"])
          .setStyle("PRIMARY")
      );
    });

    interaction.reply({
      content: `Test`,
      embeds: [embed],
      components: [buttons],
      ephemeral: true
    });
  }
}