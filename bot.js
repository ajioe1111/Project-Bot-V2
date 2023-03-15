// Load necessary discord.js classes.
import { Client, Events, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import config from "./config.json" assert { type: "json" };
const client = new Client({ intents: [GatewayIntentBits.Guilds] })
import fs from 'fs';

client.commands = new Collection();

// Получите все файлы команд из ранее созданного вами каталога команд
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
const importPromises = [];

for (const file of commandFiles) {
	const fileName = `./commands/${file}`;
	importPromises.push(import(fileName)
		.then(module => client.commands.set(module.default.data.name, module.default))
		.catch(console.error));
}

for (const file of eventFiles) {
	const fileName = `./events/${file}`;
	importPromises.push(import(fileName)
		.then(module => {
			if (module.default.once) {
				client.once(module.default.name, (...args) => module.default.execute(...args, client));
			} else {
				client.on(module.default.name, (...args) => module.default.execute(...args, client));
			}
		})
		.catch(console.error));
}
// Создайте и подготовьте экземпляр модуля REST
const rest = new REST({ version: '10' }).setToken(config.token);

// и разверните ваши команды!
export async function initAppCommands(guildId) {
	const commandsInfo = client.commands.map(module => {
		if (module.data) { module.data.defaultPermission = false }
		return module.data;

	});
	try {
		console.log('Началось обновление (/) команд.');

		await rest.put(
			Routes.applicationGuildCommands(config.clientId, config.guildId), // Если убрать guildId то команды будут обновлятся глобально.
			{ body: commandsInfo },
		);

		console.log('Успешно обновлены (/) команды.');
	} catch (error) {
		console.error(error);
	}
};



client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) {
    console.error(`Не найдена ни одна команда, соответствующая ${interaction.commandName}.`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: 'Произошла ошибка при выполнении этой команды!', ephemeral: true });
    } else {
      await interaction.reply({ content: `[ПРЕДУПРЕЖДЕНИЕ] Команда в ${filePath} не имеет обязательного свойства "data" или "execute".`, ephemeral: true });
    }
  }
});


initAppCommands()
Promise.all(importPromises)
	.then(() => client.login(config.token))
	.catch(console.error);