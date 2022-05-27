const { MessageActionRow, MessageButton, MessageEmbed } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list_oc")
    .setDescription("Edit your OC data such as avatar."),
  async execute(interaction, client) {
    if (interaction.isButton()) {
      this.showDetail(interaction, client);

      return;
    }

    const user = interaction.user;
    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const searchUserOcs = Object.entries(userOcs).find(u => u[0] == user.id);

    if (!searchUserOcs) {
      interaction.reply({
        content: `You haven't registered any OC yet.`,
        ephemeral: true
      });

      return;
    }

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setAuthor({ name: client.user.username, iconURL: client.user.defaultAvatarURL })
      .setDescription("Press the button to show OC's detail.")
      .setFooter({ text: "=-=-=-=-=-=-=-=-=- showing  list -=-=-=-=-=-=-=-=-=" });
    Object.entries(searchUserOcs[1]).forEach((o) => {
      embed.addField(o[0], o[1]["name"], true);
    });
    const buttons = new MessageActionRow();
    Object.entries(searchUserOcs[1]).forEach((o) => {
      buttons.addComponents(
        new MessageButton()
          .setCustomId(`${interaction.commandName}[-]${o[0]}`)
          .setLabel(o[1]["name"])
          .setStyle("PRIMARY")
      );
    });

    interaction.reply({
      embeds: [embed],
      components: [buttons],
      ephemeral: true
    });
  },
  async showDetail(interaction, client) {
    const prefix = interaction.customId.split("[-]")[1];

    const user = interaction.user;
    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const userOc = Object.entries(userOcs).find(u => u[0] == user.id)[1][prefix];

    const embed = new MessageEmbed()
      .setColor('#0099ff')
      .setAuthor({ name: client.user.username, iconURL: client.user.defaultAvatarURL })
      .setThumbnail(userOc.avatar || client.user.defaultAvatarURL)
      .setFooter({ text: "=-=-=-=-=-=-| showing detail |-=-=-=-=-=-=" });
    embed.addField("Prefix", prefix, true);
    embed.addField("Name", userOc.name, true);
    embed.addField("Description", userOc.description || "Empty", false);

    await interaction.update({
      embeds: [embed]
    });
  }
}