import { Events, GuildMember } from "discord.js";
import { nameGenator } from "../otherFunctions.js";

export default {
	name: Events.GuildMemberAdd,
	on: true,
    /**
     * 
     * @param {GuildMember} member 
     */
	execute(member) {
        if (member) {
            const welcomeMsg = `Добро пожаловать на ${member.guild.name}, мы очень рады что вы зашли к нам! Сейчас я приведу список каналов которые могут вас заинтересовать!`;
            member.send(welcomeMsg);
            const newName = nameGenator();
            member.setNickname(newName, 'Рандомный никнейм при входе');
        }
	},
};