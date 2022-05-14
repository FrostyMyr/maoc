const { Client, Collection, WebhookClient } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const config = require("./config.json");

const client = new Client({ intents: 33315 });
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const commands = [];

client.commands = new Collection();

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  commands.push(command.data.toJSON());
  client.commands.set(command.data.name, command);
}

client.once("ready", () => {
  console.log("MaOC is online!");

  const clientId = client.user.id;
  const rest = new REST({
    version: "9"
  }).setToken(config["DISCORD_TOKEN"]);

  (async () => {
    try {
      if (config["ENVIRONMENT"] == "production") {
        await rest.put(Routes.applicationCommands(clientId), {
          body: commands
        });
        console.log("Successfully registered commands globally!");
      } else {
        await rest.put(Routes.applicationGuildCommands(clientId, config["GUILD_ID"]), {
          body: commands
        });
        console.log("Successfully registered commands locally!");
      }
    } catch (err) {
      console.error(err);
    }
  })();
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);

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

  const repliedMessage = await message.fetchReference(message.reference).then((referencedMessage) => {
      return referencedMessage;
    }).catch((err) => {
      return null;
    });
  const webhooks = await message.channel.fetchWebhooks();
  const webhook = webhooks.find(wh => wh.token);
  const messageContent = repliedMessage != null ? 
    `> **${repliedMessage.author.username}** ${truncate(repliedMessage.content, 20)} [Jump](${repliedMessage.url})\n ${message.content}`
    : message.content;

  await message.delete();
  webhook.send({
    username: webhook.username,
    avatarUrl: webhook.avatarUrl,
    content: messageContent,
    embeds: []
  });

  function truncate(text, size) {
    return text.length > size ? text.slice(0, size).concat("...") : text;
  }
});

client.login(config["DISCORD_TOKEN"]);