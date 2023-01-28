// Keep alive
// const express = require('express');
// const app = express();
// const port = 3000;

// app.get('/', (req, res) => res.send('Hello World!'));
// app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));

const { Client, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { exec } = require('child_process');
const fs = require("fs");
const config = require("./config.json");

const client = new Client({ intents: 34609 });
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.once("ready", async () => {
  console.log("MaOC is online!");

  const clientId = client.user.id;
  const rest = new REST({
    version: "9"
  }).setToken(config["DISCORD_TOKEN"]);

  try {
    await rest.put(Routes.applicationCommands(clientId), {
      body: commands
    });
    console.log("Successfully registered commands globally!");
  } catch (err) {
    console.error(err);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!(interaction.isCommand() || interaction.isButton())) return;

  let command;

  if (interaction.isCommand()) {
    command = client.commands.get(interaction.commandName);
  } else if (interaction.isButton()) {
    command = client.commands.get(interaction.customId.split("[-]")[0]);
  }

  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    if (err) console.error(err);
    await interaction.reply({
      content: "There is something wrong with your input.",
      ephemeral: true
    });
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot || message.webhookId) return;
  const command = client.commands.get("oc");
  await command.execute(message, client);
});

(async () => {
  try {
    client.login(config['DISCORD_TOKEN']);
  } catch (err) {
    exec("kill 1");
  }
})();