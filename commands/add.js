const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('add')
      .setDescription('Adicionar alguém a um ticket')
      .addUserOption(option =>
        option.setName('usuário')
        .setDescription('Membro adicionado ao ticket')
        .setRequired(true)),
    async execute(interaction, client) {
      const chan = client.channels.cache.get(interaction.channelId);
      const user = interaction.options.getUser('usuário');
  
      if (chan.name.includes('ticket')) {
        chan.edit({
          permissionOverwrites: [{
            id: user,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
            {
              id: client.config.roleSupport,
              allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
            },
        ],
        }).then(async () => {
          interaction.reply({
            content: `<@${user.id}> foi adicionado ao ticket !`
          });
        });
      } else {
        interaction.reply({
          content: 'Você n\'não esta em um ticket !',
          ephemeral: true
        });
      };
    },
  };