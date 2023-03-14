// Загрузить необходимые классы discord.js.
const fs = require('node:fs');
const path = require('node:path');
const { Client, Events, GatewayIntentBits, Collection } = require('discord.js');
const { token } = require('./config.json');
const registerCommand = require('./deploy-commands');

// Создай клиента
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Обновляет команды на серверах
registerCommand();

client.commands = new Collection();

// Проверяет папку ./commands на наличие файлов команд в формате .js
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Установить новый элемент в коллекцию, используя имя команды в качестве ключа и экспортированный модуль в качестве значения.
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[ПРЕДУПРЕЖДЕНИЕ] Команда в ${filePath} не имеет обязательного свойства "data" или "execute".`);
	}
}

// Проверяет папку ./events на наличие файлов событий в формате .js
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Срабатывай каждый раз когда бот получает интеракцию (или же слэш команду)
client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

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
			await interaction.reply({ content: '[ПРЕДУПРЕЖДЕНИЕ] Команда в ${filePath} не имеет обязательного свойства "data" или "execute".', ephemeral: true });
		}
	}
});

// Токен для логина бота
client.login(token).then(() => {
    console.log(`Бот успешно подключен к Discord!`);
  }).catch((err) => {
    console.error(`Ошибка подключения к Discord: ${err}`);
  });