let hastebin = require('hastebin');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (!interaction.isButton()) return;
    if (interaction.customId == "abrir-ticket") {
      if (client.guilds.cache.get(interaction.guildId).channels.cache.find(c => c.topic == interaction.user.id)) {
        return interaction.reply({
          content: 'Você já criou um ticket.',
          ephemeral: true
        });
      };

      interaction.guild.channels.create(`ticket-${interaction.user.username}`, {
        parent: client.config.parentOpened,
        topic: interaction.user.id,
        permissionOverwrites: [{
            id: interaction.user.id,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: client.config.roleSupport,
            allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
          },
          {
            id: interaction.guild.roles.everyone,
            deny: ['VIEW_CHANNEL'],
          },
        ],
        type: 'text',
      }).then(async c => {
        interaction.reply({
          content: `Ticket Criado! <#${c.id}>`,
          ephemeral: true
        });

        const embed = new client.discord.MessageEmbed()
          .setColor('6d6ee8')
          .setAuthor('GN | BOT - Demonstração', '')
          .setDescription('Selecione a categoria do seu ticket')
          .setFooter('GN | BOT - Demonstração - Todos os direitos reservados.', '')
          .setTimestamp();

        const row = new client.discord.MessageActionRow()
          .addComponents(
            new client.discord.MessageSelectMenu()
            .setCustomId('category')
            .setPlaceholder('Sobre oque é seu ticket?')
            .addOptions([{
                label: 'Compras',
                value: 'compras',
                emoji: '🛒',
              },
              {
                label: 'Dúvidas Gerais',
                value: 'duvidas',
                emoji: '❓',
              }
            ]),
          );

        msg = await c.send({
          content: `<@!${interaction.user.id}>`,
          embeds: [embed],
          components: [row]
        });

        const collector = msg.createMessageComponentCollector({
          componentType: 'SELECT_MENU',
          time: 20000
        });

        collector.on('collect', i => {
          if (i.user.id === interaction.user.id) {
            if (msg.deletable) {
              msg.delete().then(async () => {
                const embed = new client.discord.MessageEmbed()
                  .setColor('6d6ee8')
                  .setAuthor('Ticket', '')
                  .setDescription(`<@!${interaction.user.id}> Criou um ticket ${i.values[0]}, aguarde para ser atendido!`)
                  .setFooter('GN | BOT - Demonstração', '')
                  .setTimestamp();

                const row = new client.discord.MessageActionRow()
                  .addComponents(
                    new client.discord.MessageButton()
                    .setCustomId('fecha-ticket')
                    .setLabel('Fechar ticket')
                    .setEmoji('899745362137477181')
                    .setStyle('DANGER'),
                  );

                const opened = await c.send({
                  content: `<@&${client.config.roleSupport}>`,
                  embeds: [embed],
                  components: [row]
                });

                opened.pin().then(() => {
                  opened.channel.bulkDelete(1);
                });
              });
            };
            if (i.values[0] == 'compras') {
              c.edit({
                parent: client.config.parentCompras
              });
            };
            if (i.values[0] == 'duvidas') {
              c.edit({
                parent: client.config.parentDuvidas
              });
            };
          };
        });

        collector.on('end', collected => {
          if (collected.size < 1) {
            c.send(`Nenhuma categoria selecionada. Fechando o ticket...`).then(() => {
              setTimeout(() => {
                if (c.deletable) {
                  c.delete();
                };
              }, 5000);
            });
          };
        });
      });
    };

    if (interaction.customId == "fecha-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      const row = new client.discord.MessageActionRow()
        .addComponents(
          new client.discord.MessageButton()
          .setCustomId('confirma-fecha')
          .setLabel('Fechar o ticket')
          .setStyle('DANGER'),
          new client.discord.MessageButton()
          .setCustomId('nao')
          .setLabel('Cancelar fechamento')
          .setStyle('SECONDARY'),
        );

      const verif = await interaction.reply({
        content: 'Tem certeza de que deseja fechar o ticket?',
        components: [row]
      });

      const collector = interaction.channel.createMessageComponentCollector({
        componentType: 'BUTTON',
        time: 10000
      });

      collector.on('collect', i => {
        if (i.customId == 'confirma-fecha') {
          interaction.editReply({
            content: `Ticket fechado por <@!${interaction.user.id}>`,
            components: []
          });

          chan.edit({
              name: `fechado-${chan.name}`,
              permissionOverwrites: [
                {
                  id: client.users.cache.get(chan.topic),
                  deny: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: client.config.roleSupport,
                  allow: ['SEND_MESSAGES', 'VIEW_CHANNEL'],
                },
                {
                  id: interaction.guild.roles.everyone,
                  deny: ['VIEW_CHANNEL'],
                },
              ],
            })
            .then(async () => {
              const embed = new client.discord.MessageEmbed()
                .setColor('6d6ee8')
                .setAuthor('Ticket', '')
                .setDescription('```Controle de Ticket```')
                .setFooter('GN | BOT - Demonstração', '')
                .setTimestamp();

              const row = new client.discord.MessageActionRow()
                .addComponents(
                  new client.discord.MessageButton()
                  .setCustomId('delete-ticket')
                  .setLabel('Excluir Ticket')
                  .setEmoji('🗑️')
                  .setStyle('DANGER'),
                );

              chan.send({
                embeds: [embed],
                components: [row]
              });
            });

          collector.stop();
        };
        if (i.customId == 'nao') {
          interaction.editReply({
            content: 'Fechando o ticket cancelado !',
            components: []
          });
          collector.stop();
        };
      });

      collector.on('end', (i) => {
        if (i.size < 1) {
          interaction.editReply({
            content: 'Fechando o ticket cancelado !',
            components: []
          });
        };
      });
    };

    if (interaction.customId == "delete-ticket") {
      const guild = client.guilds.cache.get(interaction.guildId);
      const chan = guild.channels.cache.get(interaction.channelId);

      interaction.reply({
        content: 'Salvando mensagens...'
      });

      chan.messages.fetch().then(async (messages) => {
        let a = messages.filter(m => m.author.bot !== true).map(m =>
          `${new Date(m.createdTimestamp).toLocaleString('pt-BR')} - ${m.author.username}#${m.author.discriminator}: ${m.attachments.size > 0 ? m.attachments.first().proxyURL : m.content}`
        ).reverse().join('\n');
        if (a.length < 1) a = "Nada foi encontrado no ticket."
        hastebin.createPaste(a, {
            contentType: 'texto/plain',
            server: 'https://hastebin.com/'
          }, {})
          .then(function (urlToPaste) {
            const embed = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', '')
              .setDescription(`📰 Logs do ticket \`${chan.id}\` criado por <@!${chan.topic}> e deletado por <@!${interaction.user.id}>\n\nLogs: [**Clique aqui para ver os registros**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            const embed2 = new client.discord.MessageEmbed()
              .setAuthor('Logs Ticket', '')
              .setDescription(`📰 Registros do seu ticket \`${chan.id}\`: [**Clique aqui para ver os registros**](${urlToPaste})`)
              .setColor('2f3136')
              .setTimestamp();

            client.channels.cache.get(client.config.logsTicket).send({
              embeds: [embed]
            });
            client.users.cache.get(chan.topic).send({
              embeds: [embed2]
            }).catch(() => {console.log('Eu posso\'mande uma mensagem para ele :(')});
            chan.send('Excluindo o canal...');

            setTimeout(() => {
              chan.delete();
            }, 5000);
          });
      });
    };
  },
};