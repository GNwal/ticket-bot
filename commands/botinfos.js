const {
    SlashCommandBuilder
  } = require('@discordjs/builders');
  
  module.exports = {
    data: new SlashCommandBuilder()
      .setName('botinfo')
      .setDescription('Creditos do Bot'),
    async execute(interaction, client) {
      const embed = new client.discord.MessageEmbed()
        .setColor('6d6ee8')
        .setDescription('Desenvolvido com <:heart:900636756376961034> de <@900636756376961034>')
        .setFooter(client.config.footerText, client.user.avatarURL())
        .setTimestamp();
  
      await interaction.reply({
        embeds: [embed]
      });
    },
  };