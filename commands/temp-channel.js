import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

export default {
    data: new SlashCommandBuilder()
        .setName('temp-channel')
        .setDescription('Создать временный канал')
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Название временного канала')
                .setRequired(true))
        .addIntegerOption(option =>
            option
                .setName('time')
                .setDescription('Время жизни канала в минутах (максимум 1440)')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const time = interaction.options.getInteger('time');

        // Проверяем, что время жизни канала не больше 1440 минут (24 часа)
        if (time > 1440) {
            return interaction.reply('Максимальное время жизни канала - 1440 минут (24 часа)');
        }

        // Создаем новый текстовый канал
        const channel = await interaction.guild.channels.create({
            name: name,
            type: 0,
            parent: interaction.channel.parent,
            permissionOverwrites: [
                {
                    id: interaction.guild.roles.everyone.id,
                    deny: [PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel],
                },
            ],
        });

        // Добавляем права на просмотр и отправку сообщений только для создателя канала
        await channel.permissionOverwrites.create(interaction.user.id, {
			ViewChannel: true,
			SendMessages: true,
			ManageChannels: true,
        });

        // Создаем сообщение с инструкциями
        const inviteEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Временный канал "${name}" создан`)
            .setDescription(`Пользователи могут присоединиться по ссылке ниже в течение ${time} минут`)
            .addFields(
                {name: 'Ссылка на канал', value: `https://discord.gg/${channel.id}`},
                )

        // Отправляем сообщение с инструкциями
        await interaction.reply({ embeds: [inviteEmbed] });

        // Удаляем канал после заданного времени
        setTimeout(async () => {
            await channel.delete();
        }, time * 60000);
    },
};
