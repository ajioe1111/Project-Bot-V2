
import { Events } from 'discord.js';
import { initAppCommands } from '../bot.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(`Запустился! Подключился как ${client.user.tag}`);
		client.guilds.cache.forEach(async guild => {
			await initAppCommands(guild.id);
		});
	},
};
