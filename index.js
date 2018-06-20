/*
 * AFK Bot
 * Albert Tang - 6/18/2018
 */

const fs = require("fs-extra");
const start = new Date(); // credit to Adam Gincel, using to ignore old messages
const discord = require("discord.js");
const tokenFile = './discordToken.txt';

async function updateUsers(username, author, message, afkUsers) {
  afkUsers[username] = [author, message];
  console.log(afkUsers);
}

async function deleteUser(oldUsr, afkUsers) {
	if(afkUsers[oldUsr.user.username]) {
		delete afkUsers[oldUsr.user.username];
	}
}

async function checkAFKs(msg, afkUsers) {
  console.log(`Checking for usernames`);
  console.log(afkUsers);
	for(let username in afkUsers) {
    console.log(`Checking ${username}`);
    let afkUser = afkUsers[username];
		if(msg.isMemberMentioned(afkUser[0])) {
			await msg.channel.send(`${username}: ${afkUser[1]}`);
      console.log(`Sent msg ${afkUser[1]}`);
  	}
  }
}

async function handleMessage(msg, afkUsers) {
  const content = msg.content;
	const argsAFK = [content.slice(0, 4), content.slice(5, content.length)];
	if(argsAFK[0] === "/afk" && new Date(msg.createdTimestamp) > start) {
		await msg.member.setVoiceChannel(msg.guild.afkChannel);
    console.log(`Moving ${msg.author.username}`);
    await updateUsers(msg.author.username, msg.author, argsAFK[1], afkUsers);
    console.log(afkUsers);
    console.log(`Added ${msg.author.username} to list`);
	} else {
    await checkAFKs(msg, afkUsers);
    console.log(`Finished checking for usernames`);
	}
}

async function main() { 
  let discordBot = new discord.Client();
	const token = (await fs.readFile(tokenFile, "utf8")).replace('\n','');
  let afkUsers = {};

	console.log("Logging in");
	await discordBot.login(token);
	console.log("Logged in");
	discordBot.on("message", async msg => {
    await handleMessage(msg, afkUsers);
	});
	
	discordBot.on("voiceStateUpdate", async (oldUsr, newUsr) => {
    if(oldUsr.voiceChannel && oldUsr.guild.afkChannel === oldUsr.voiceChannel) {
      await deleteUser(oldUsr, afkUsers);
    }
	});
}

main().catch((err) => { console.error(err); });

