/*
 * AFK Bot
 * Albert Tang - 6/18/2018
 */

const fs = require("fs-extra");
const start = new Date(); // credit to Adam Gincel, using to ignore old messages
const discord = require("discord.js");
const tokenFile = './discordToken.txt';
let afkUsers = {};

(async () => {
	let discordBot = new discord.Client();
	const token = (await fs.readFile(tokenFile, "utf8")).replace('\n','');

	console.log("Logging in");
	await discordBot.login(token);
	discordBot.on("message", async msg => {
		const argsAFK = [msg.slice(4), msg.slice(5, msg.length)];
		if(args[0] === "/afk" && new Date(msg.createdTimestamp) > start) {
			await msg.member.setVoiceChannel(msg.guild.afkChannel);
			afkUsers[msg.author.username] = [msg.author, argsAFK[1]];
		} else {
			for(let username in afkUsers) {
				if(msg.isMentioned(username)) {
					await msg.channel.send(afkUsers.username[1]);
					break;
				}
			}
		}
	});
	
	discordBot.on("voiceStateUpdate", async (oldUsr, newUsr) => {
		if(afkUsers[oldUsr.user.username]) {
			delete afkUsers[oldUsr.user.username];
		}
	});
})().catch((err) => { console.error(err); });

