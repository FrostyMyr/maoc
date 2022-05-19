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
        .setDescription("Your OC prefix to use this OC.")
        .setRequired(true)
    ),
  async execute(interaction) {
    const name = interaction.options.getString("name");
    const prefix = interaction.options.getString("prefix");

    const user = interaction.user;
    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const newUserOcs = Object.assign({}, userOcs, {
      [name]: {
        "prefix": prefix,
        "creator": user.id
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