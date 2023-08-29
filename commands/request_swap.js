const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("request_swap")
    .setDescription("Request swap with someone.")
    .addUserOption((option) => 
      option.setName("member")
        .setDescription("The one you wanna swap with.")
        .setRequired(true)
    ),
  async execute(interaction, client) {
    let target, user;

    if (interaction.isButton()) {
      const swappers = interaction.message.content.split('<@').map(id => id.split('>')[0]).filter(id => id != '');
      target = swappers[0];
      user = swappers[1];
      this.startSwap(client, interaction, target, user);
      return;
    } else {
      target = interaction.options.getUser("member");
      user = interaction.user;
    }

    const swapJson = JSON.parse(fs.readFileSync(`./swap.json`));
    const newSwapJson = Object.assign({}, swapJson, {
      [user.id]: {
        "name": user.globalName,
        "avatar": user.displayAvatarURL()
      },
      [target.id]: {
        "name": target.globalName,
        "avatar": target.displayAvatarURL()
      }
    });
    await fs.writeFileSync(`./swap.json`, JSON.stringify(newSwapJson, null, 2));

    const confirmButton = new ActionRowBuilder();
    confirmButton.addComponents(
        new ButtonBuilder()
          .setCustomId(`${interaction.commandName}[-]y${target.id}`)
          .setLabel("Yes")
          .setStyle(ButtonStyle.Primary)
      );
    confirmButton.addComponents(
        new ButtonBuilder()
          .setCustomId(`${interaction.commandName}[-]n${target.id}`)
          .setLabel("No")
          .setStyle(ButtonStyle.Danger)
      );

    interaction.reply({
      components: [confirmButton],
      content: `${target}, ${user} want to swap with you.`,
    });
  },
  async startSwap(client, interaction, target, user) {
    if (interaction.isButton()) {
      if (!interaction.customId.endsWith(interaction.user.id)) {
        interaction.reply({
          content: "This button isn't for you.",
          ephemeral: true
        });
        return;
      }

      if (interaction.customId.split("[-]")[1].split(interaction.user.id)[0] == 'n') {
        const swapJson = JSON.parse(fs.readFileSync(`./swap.json`));
        delete swapJson[user];
        delete swapJson[target];
        await fs.writeFileSync(`./swap.json`, JSON.stringify(swapJson, null, 2));

        interaction.reply({
          content: `Swapped cancelled.`,
        });
        return;
      }
    }

    const swapJson = JSON.parse(fs.readFileSync(`./swap.json`));
    const userJson = Object.entries(swapJson).find(u => u[0] == user);
    const targetJson = Object.entries(swapJson).find(u => u[0] == target);
    const newSwapJson = Object.assign({}, swapJson, {
      [user]: {
        "name": targetJson[1].name,
        "avatar": targetJson[1].avatar
      },
      [target]: {
        "name": userJson[1].name,
        "avatar": userJson[1].avatar
      }
    });
    await fs.writeFileSync(`./swap.json`, JSON.stringify(newSwapJson, null, 2));

    await interaction.channel.fetchWebhooks().then((webhook) => {
      if (!webhook.find(wh => wh.owner.id == client.user.id)) message.channel.createWebhook({ name: "GSBot" });
    });

    interaction.reply({
      content: `They both are swapped now.`,
    });
  }
}