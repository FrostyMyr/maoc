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
    const user = interaction.user || interaction.author;
    const userOcs = JSON.parse(fs.readFileSync("./user_ocs.json"));
    const webhooks = await interaction.channel.fetchWebhooks();
    const webhook = webhooks.find(wh => wh.owner.id == client.user.id) || interaction.channel.createWebhook("MaOC", {
      avatar: "https://i.imgur.com/AfFp7pu.png"
    });
    let prefix, message, repliedInteraction;

    if (interaction.content) {
      prefix = interaction.content.split(":")[0];
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

    const userOc = Object.entries(userOcs).find(oc => oc[1].prefix == prefix && oc[1].creator == user.id);
    const interactionContent = repliedInteraction != null ? 
      `> **${repliedInteraction.author.username}** ${truncate(repliedInteraction.content, 20)} [Jump](${repliedInteraction.url})\n ${message}`
      : message;

    if (userOc) {
      if (interaction.content) {
        await interaction.delete();
      } else {
        await interaction.deferReply();
        await interaction.deleteReply();
      }

      webhook.send({
        username: userOc[0],
        avatarUrl: webhook.avatarUrl,
        content: interactionContent
      });
    }

    function truncate(text, size) {
      return text.length > size ? text.slice(0, size).concat("...") : text;
    }
  }
}