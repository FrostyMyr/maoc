const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oc_register")
    .setDescription("Register your OC so you can use it.")
    .addStringOption((option) => 
      option
        .setName("name")
        .setDescription("Your OC name.")
        .setRequired(true)
    )
    .addStringOption((option) => 
      option.setName("prefix")
        .setDescription("Your OC prefix used to call this OC.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString("name");
    const prefix = interaction.options.getString("prefix");

    const user = interaction.user;
    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const searchUserOcs = Object.entries(userOcs).find(u => user.id) || [user.id, {}];

    if (Object.entries(searchUserOcs[1]).filter(o => o[0] == prefix).length > 0) {
      interaction.reply({
        content: `Prefix **${prefix}** is already exist`,
        ephemeral: true
      });

      return;
    }

    const newUserOcs = Object.assign({}, userOcs, {
      [searchUserOcs[0]]: {
        ...searchUserOcs[1],
        [prefix]: {
          "name": name,
          "image": "",
          "description": "",
          "personality": ""
        }
      }
    });

    await fs.writeFileSync(`./user_ocs.json`, JSON.stringify(newUserOcs, null, 2));

    interaction.reply({
      content: `**${name}** has successfully saved to database.`,
      ephemeral: true
    });

    interaction.channel.send({
      content: `> **${name}** has summoned to this world.`,
      ephemeral: false
    });
  }
}