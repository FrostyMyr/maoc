const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client } = require('unb-api');
const unbClient = new Client(require("../config.json")['UNB_TOKEN']);
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit_oc")
    .setDescription("Edit your OC data such as avatar.")
    .addStringOption((option) => 
      option.setName("prefix")
        .setDescription("OC prefix you want to edit.")
        .setRequired(true)
    )
    .addStringOption((option) => 
      option.setName("name")
        .setDescription("OC's name.")
        .setRequired(false)
    )
    .addStringOption((option) => 
      option.setName("avatar")
        .setDescription("OC's avatar.")
        .setRequired(false)
    )
    .addStringOption((option) => 
      option.setName("description")
        .setDescription("OC's description.")
        .setRequired(false)
    ),
  async execute(interaction) {
    const { page, totalPages, items } = await unbClient.getInventoryItems(interaction.guild.id, interaction.user.id, { 
      sort: ['item_id'], page: 1 
    });
    const magicPen = items.find(item => item.name == 'Magic Pen');
    if (!magicPen) {
      interaction.reply({
        content: `You need **Magic Pen** to edit your character.`,
        ephemeral: true
      });

      return;
    };

    const prefix = interaction.options.getString("prefix");
    const user = interaction.user;
    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const searchUserOcs = Object.entries(userOcs).find(u => u[0] == user.id);
    
    if (!searchUserOcs || !searchUserOcs[1][prefix]) {
      interaction.reply({
        content: `There is no OC with **${prefix}** as prefix.`,
        ephemeral: true
      });

      return;
    }

    const name = interaction.options.getString("name") || searchUserOcs[1][prefix]["name"];
    const avatar = interaction.options.getString("avatar") || searchUserOcs[1][prefix]["avatar"];
    const description = interaction.options.getString("description") || searchUserOcs[1][prefix]["description"];

    const newUserOcs = Object.assign({}, userOcs, {
      [searchUserOcs[0]]: {
        ...searchUserOcs[1],
        [prefix]: {
          "name": name,
          "avatar": avatar,
          "description": description
        }
      }
    });

    await fs.writeFileSync(`./user_ocs.json`, JSON.stringify(newUserOcs, null, 2));
    await unbClient.removeInventoryItem(interaction.guild.id, interaction.user.id, magicPen.itemId, 1);

    interaction.reply({
      content: `**${name}**'s data has been updated.\n1 **Magic Pen** has been used.`,
      ephemeral: true
    });
  }
}