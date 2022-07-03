const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("oc")
    .setDescription("Send message as your OC.")
    .addStringOption((option) => 
      option
        .setName("prefix")
        .setDescription("Your OC's prefix.")
        .setRequired(true)
    )
    .addStringOption((option) => 
      option.setName("message")
        .setDescription("Your message.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    await interaction.channel.fetchWebhooks().then((webhook) => {
      if (!webhook.find(wh => wh.owner.id == client.user.id)) interaction.channel.createWebhook("MaOC");
    });

    const user = interaction.user || interaction.author;
    const userOcs = JSON.parse(fs.readFileSync("./user_ocs.json"));
    const webhook = await interaction.channel.fetchWebhooks().then(webhook => webhook.find(wh => wh.owner.id == client.user.id));
    let prefix, message, repliedInteraction;

    if (interaction.content) {
      prefix = interaction.content.split(":")[0];
      if ([prefix].length) return;
      message = interaction.content.slice(interaction.content.indexOf(":") + 1).trim();
      repliedInteraction = await interaction.fetchReference(interaction.reference).then((referencedInteraction) => {
          return referencedInteraction;
        }).catch((err) => {
          return null;
        });
    } else if (interaction.options) {
      prefix = interaction.options.getString("prefix");
      message = interaction.options.getString("message");
    }

    const userOc = Object.entries(userOcs).find(u => u[0] == user.id);
    const interactionContent = repliedInteraction != null ? 
      `> **${repliedInteraction.author.username}** ${truncate(repliedInteraction.content, 20)} [Jump](${repliedInteraction.url})\n ${message}`
      : message;

    if (!!userOc && !!userOc[1][prefix]) {
      if (interaction.content) {
        await interaction.delete();
      } else {
        await interaction.deferReply();
        await interaction.deleteReply();
      }

      webhook.send({
        username: userOc[1][prefix]["name"],
        avatarURL: userOc[1][prefix]["avatar"],
        content: interactionContent
      });
    } else if (interaction.options) {
      await interaction.reply({
        content: "There is no OC with that prefix.",
        ephemeral: true
      });
    }

    function truncate(text, size) {
      return text.length > size ? text.slice(0, size).concat("...") : text;
    }
  }
}