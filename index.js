/*
 * AFK Bot
 * Albert Tang - 6/18/2018
 */

const start = new Date(); // credit to Adam Gincel, using to ignore old messages
const discord = require("discord.js");
const { token } = require('./discordToken.json');

async function updateUsers(username, author, message, afkUsers) {
  afkUsers[username] = [author, message];
}

async function deleteUser(username, afkUsers) {
  console.log(`${username} is no longer AFK`);
	delete afkUsers[username];
}

async function checkAFKs(msg, afkUsers) {
  console.log(`Checking for usernames`);
	for(let username in afkUsers) {
    console.log(`Checking ${username}`);
    let afkUser = afkUsers[username];
		if(msg.isMemberMentioned(afkUser[0])) {
			await msg.channel.send(`${username}: ${afkUser[1]}`);
      console.log(`Sent afk message for ${username}`);
  	}
  }
}

async function handleMessage(msg, afkUsers) {
  const content = msg.content;
	const argsAFK = [content.slice(0, 4), content.slice(5), content.slice(4)];
	if(argsAFK[0] === "/afk") {
		await msg.member.setVoiceChannel(msg.guild.afkChannel);
    console.log(`Moving ${msg.author.username}`);
    let afkMsg = "";
    if(parseInt(argsAFK[2])) {
      afkMsg = `AFK for ${parseInt(argsAFK[2])} minutes from ${msg.createdAt}`;
    } else {
      afkMsg = argsAFK[1];
    }
    await updateUsers(msg.author.username, msg.author, afkMsg, afkUsers);
    console.log(`Added ${msg.author.username} to list`);
	} else {
    await checkAFKs(msg, afkUsers);
    console.log(`Finished checking for usernames`);
	}
}

async function main() { 
  let discordBot = new discord.Client();
  let afkUsers = {};

	console.log("Logging in");
	await discordBot.login(token.toString('utf8'));
	console.log("Logged in");
	discordBot.on("message", async msg => {
    await handleMessage(msg, afkUsers);
	});
	
	discordBot.on("voiceStateUpdate", async (oldUsr, newUsr) => {
    if(newUsr.guild.afkChannel !== newUsr.voiceChannel && afkUsers[oldUsr.user.username]) {
      await deleteUser(oldUsr.user.username, afkUsers);
    }
	});

	discordBot.on("error", (e) => {
		console.error(e);
	});
}

main().catch((err) => { console.error(err); });

