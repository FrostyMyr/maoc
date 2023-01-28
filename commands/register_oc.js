const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("register_oc")
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
  async execute(interaction, client) {
    const name = interaction.options.getString("name");
    const prefix = interaction.options.getString("prefix");

    const user = interaction.user;
    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const searchUserOcs = Object.entries(userOcs).find(u => u[0] == user.id) || [user.id, {}];

    if (searchUserOcs.length > 1) {
      interaction.reply({
        content: "You already have a character.",
        ephemeral: true
      });

      return;
    }

    if (searchUserOcs[1][prefix]) {
      interaction.reply({
        content: `Prefix **${prefix}** is already exist.`,
        ephemeral: true
      });

      return;
    }

    const newUserOcs = Object.assign({}, userOcs, {
      [searchUserOcs[0]]: {
        ...searchUserOcs[1],
        [prefix]: {
          "name": name,
          "avatar": client.user.defaultAvatarURL,
          "description": "Empty"
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