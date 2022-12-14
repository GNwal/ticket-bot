const fs = require('fs');
const {
  Client,
  Collection,
  Intents
} = require('discord.js');
const config = require('./config.json');

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MEMBERS],
});

const Discord = require('discord.js');
client.discord = Discord;
client.config = config;

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.data.name, command);
};

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const event = require(`./events/${file}`);
    client.on(event.name, (...args) => event.execute(...args, client));
};

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client, config);
  } catch (error) {
    console.error(error);
    return interaction.reply({
      content: 'Ocorreu um erro ao executar este comando!',
      ephemeral: true
    });
  };
});

client.on("ready", () => {
  const statuses = [
      "GN | BOT - Precisa de ajuda? Crie um ticket.",
      "GN | BOT - Demonstração - Online 24HRs!"
  ]
  let index = 0
  setInterval(() => {
      if (index === statuses.length) index = 0
      const status = statuses[index]
      client.user.setActivity(`${status}`, {
          type: "PLAYING"
      })
      index++
  }, 10000)
})

client.login(require('./token.json').token);