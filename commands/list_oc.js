const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("list_oc")
    .setDescription("Show list of your OCs."),
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

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setAuthor({ name: client.user.username, iconURL: client.user.defaultAvatarURL })
      .setDescription("Press the button to show OC's detail.")
      .setFooter({ text: "=-=-=-=-=-=-=-=-=- showing  list -=-=-=-=-=-=-=-=-=" });

    let ocList = [];
    Object.entries(searchUserOcs[1]).forEach((oc, index) => {
      ocList = ocList.concat({ name: `${index+1}. ${oc[0]}`, value: oc[1]["name"], inline: true });
    });
    embed.addFields(ocList);

    const buttons = new ActionRowBuilder();
    Object.entries(searchUserOcs[1]).forEach((oc) => {
      buttons.addComponents(
        new ButtonBuilder()
          .setCustomId(`${interaction.commandName}[-]${oc[0]}`)
          .setLabel(oc[1]["name"])
          .setStyle(ButtonStyle.Primary),
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

    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setAuthor({ name: client.user.username, iconURL: client.user.defaultAvatarURL })
      .setThumbnail(userOc.avatar || client.user.defaultAvatarURL)
      .setFooter({ text: "=-=-=-=-=-=-| showing detail |-=-=-=-=-=-=" });
    embed.addFields([
      { name: "Prefix", value: prefix, inline: true },
      { name: "Name", value: userOc.name, inline: true },
      { name: "Description", value: userOc.description || "Empty", inline: false }, 
    ]);

    await interaction.update({
      embeds: [embed]
    });
  }
}