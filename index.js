const { Client, Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { exec } = require('child_process');
const fs = require("fs");
const config = require("./config.json");

const client = new Client({ intents: 36401 });
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));
const commands = [];

client.commands = new Collection();

// Get all commands
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

// On ready script
client.once("ready", async () => {
  console.log("The bot is online!");

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

// Slash interaction
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


// Proxy chat if userId is in swap.json
client.on("messageCreate", async (message) => {
  if (message.author.bot || message.webhookId) return;

  const swapJson = JSON.parse(fs.readFileSync(`./swap.json`));
  const userSwapJson = Object.entries(swapJson).find(u => u[0] == message.author.id);

  if (userSwapJson == undefined) return;

  await message.channel.fetchWebhooks().then((webhook) => {
    if (!webhook.find(wh => wh.owner.id == client.user.id)) message.channel.createWebhook({ name: "GSBot" });
  });
  const webhook = await message.channel.fetchWebhooks().then(webhook => webhook.find(wh => wh.owner.id == client.user.id));
  await message.delete();

  webhook.send({
    username: userSwapJson.name,
    avatarURL: userSwapJson.avatar,
    content: message.content,
    files: message.attachments.map(file => file.attachment)
  });

  return
});

// ACtivate bot
(async () => {
  try {
    client.login(config['DISCORD_TOKEN']);
  } catch (err) {
    exec("kill 1");
  }
})();