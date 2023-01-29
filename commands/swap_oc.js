const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { Client } = require('unb-api');
const unbClient = new Client(require("../config.json")['UNB_TOKEN']);
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("swap_oc")
    .setDescription("Swap your OC with others.")
    .addUserOption((option) => 
      option.setName("member")
        .setDescription("The one you wanna swap with.")
        .setRequired(true)
    )
    .addBooleanOption((option) => 
      option.setName("use_item")
        .setDescription("Use Swap Remote to force swap (default is *false*).")
        .setRequired(false)
    ),
  async execute(interaction) {
    let target, user, useItem;
    const { page, totalPages, items } = await unbClient.getInventoryItems(interaction.guild.id, interaction.user.id, { 
      sort: ['item_id'], page: 1 
    });
    const swapRemote = items.find(item => item.name == 'Throwing Knife');

    if (interaction.isButton()) {
      const swappers = interaction.message.content.split('<@').map(id => id.split('>')[0]).filter(id => id != '');
      target = { id: swappers[0] };
      user = { id: swappers[1] };
      useItem = false;
    } else {
      target = interaction.options.getUser("member");
      user = interaction.user;
      useItem = interaction.options.getBoolean("use_item") || false;
    }

    const userOcs = JSON.parse(fs.readFileSync(`./user_ocs.json`));
    const searchUserOcs = Object.entries(userOcs).find(u => u[0] == user.id);
    const searchTargetOcs = Object.entries(userOcs).find(u => u[0] == target.id);

    if (interaction.isButton() || useItem) {
      if (useItem && !swapRemote) {
        interaction.reply({
          content: "You don't have Swap Remote.",
          ephemeral: true
        });
        return
      }
      this.startSwap(interaction, userOcs, searchUserOcs, searchTargetOcs);
      return;
    }

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
      content: `${target}, it looks like ${user} want to swap character with you, will you allow it?`,
      components: [confirmButton],
      ephemeral: false
    });
  },
  async startSwap(interaction, userOcs, searchUserOcs, searchTargetOcs) {
    if (interaction.isButton()) {
      if (!interaction.customId.endsWith(interaction.user.id)) {
        interaction.reply({
          content: "This button isn't for you.",
          ephemeral: true
        });
        return;
      }

      if (interaction.customId.split("[-]")[1].split(interaction.user.id)[0] == 'n') {
        interaction.reply({
          content: `Looks like <@${searchTargetOcs[0]}> don't want to swap :(`,
          ephemeral: false
        });
        await interaction.message.delete();
        return;
      }

      await interaction.message.delete();
    }

    const newUserOcs = Object.assign({}, userOcs, {
      [searchUserOcs[0]]: {
        ...searchTargetOcs[1]
      },
      [searchTargetOcs[0]]: {
        ...searchUserOcs[1]
      },
    });
    await fs.writeFileSync(`./user_ocs.json`, JSON.stringify(newUserOcs, null, 2));

    interaction.reply({
      content: `Congrats <@${searchUserOcs[0]}>'s and <@${searchTargetOcs[0]}>'s character is swapped :)`,
      ephemeral: false
    });
  }
}