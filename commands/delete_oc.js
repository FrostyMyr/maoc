const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("delete_oc")
    .setDescription("Delete your OC.")
    .addStringOption((option) => 
      option.setName("prefix")
        .setDescription("OC prefix you want to delete.")
        .setRequired(true)
    ),
  async execute(interaction) {
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

    interaction.reply({
      content: `**${searchUserOcs[1][prefix]["name"]}**'s data has been deleted.`,
      ephemeral: true
    });

    interaction.channel.send({
      content: `> **${searchUserOcs[1][prefix]["name"]}**'s has been banished.`,
      ephemeral: false
    });

    delete searchUserOcs[1][prefix];
    if (!!userOcs[user.id].length == 0) delete userOcs[user.id];

    await fs.writeFileSync(`./user_ocs.json`, JSON.stringify(userOcs, null, 2));
  }
}