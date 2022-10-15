const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('comandos')
      .setDescription('Dúvidas de meus comandos? Veja agora'),
    async execute(interaction, client) {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setDescription('・ **/add** - Esta função serve para você adicionar alguém a um ticket já aberto. \n・ **/ban** - De um banimento permanente em alguém aqui no Discord. \n・ **/kick** - De um kick em alguém aqui no Discord. \n・ **/botinfo** - Serve para você ver quem é o criador do Bot.')
        .setFooter(client.config.footerText, client.user.avatarURL())
        .setTimestamp();
  
      await interaction.reply({
        embeds: [embed]
      });
    },
  };