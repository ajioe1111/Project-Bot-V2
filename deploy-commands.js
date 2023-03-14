const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Получите все файлы команд из ранее созданного вами каталога команд
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

// Получите выходные данные JSON от метода SlashCommandBuilder#toJSON() для каждой команды перед развертыванием
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	commands.push(command.data.toJSON());
}

// Создайте и подготовьте экземпляр модуля REST
const rest = new REST({ version: '10' }).setToken(token);

// и разверните ваши команды!
async function discordRegisterCommand() {
    try {
        console.log(`Начато обновление ${commands.length} (/) команд.`);

        await rest.put(Routes.applicationCommands(clientId), { body: commands });

        console.log(`Выполнено обновление ${commands.length} (/) команд.`);
    } catch (error) {
        console.error(error);
    }
};


module.exports = discordRegisterCommand;