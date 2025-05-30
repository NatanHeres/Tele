const bot = require('node-telegram-bot-api');
const { exec } = require('child_process');
const token = "7496093857:AAGD08QQXClklFROb39LVB-strLFAGKdUf8";
const op = {
  polling: true,
};
const Fumi = new bot(token, op);
const client = require('./scrape.js');
const pict = require('./lib/pickRandom.js');
const { run } = require("./message.js");
const fs = require("fs") 
const path = require("path")

const commands = {};
const featurePath = path.join(__dirname, 'features');

fs.readdirSync(featurePath).forEach(file => {
    if (file.endsWith('.js')) {
        const commandName = file.replace('.js', '');
        commands[commandName] = require(path.join(featurePath, file));
    }
});


const regexp = new RegExp(`^[./](${Object.keys(commands).join('|')})\\s*(.*)$`);


const prefixOwner = ['$', '>', '=>'];
const prefixRegex = new RegExp(`^(${prefixOwner.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`);

const OWNER_ID = 7409627999;

Fumi.on("message", async (fumi) => {
  const ID = fumi.chat.id;
  const userName = fumi.from.first_name;
  const kata = fumi.text;

  if (regexp.test(kata)) {
    return;
  }

  if (prefixRegex.test(kata)) {
    if (fumi.from.id !== OWNER_ID) {
      await Fumi.sendMessage(ID, 'Not Authorized');
      return;
    }

    const prefix = kata.match(prefixRegex)[0];
    const messageContent = kata.slice(prefix.length).trim();

    switch (prefix) {
      case '$':
        
        exec(messageContent, (err, stdout, stderr) => {
          if (err) {
            Fumi.sendMessage(ID, `Error: ${stderr}`);
          } else {
            Fumi.sendMessage(ID, stdout || 'Execution completed with no output.');
          }
        });
        break;

      case '>':
      case '=>':
        let result;
        try {
          result = /await/i.test(messageContent)
            ? await eval(`(async() => { ${messageContent} })()`)
            : eval(messageContent);
        } catch (error) {
          result = error;
        }

        new Promise((resolve, reject) => {
          try {
            resolve(result);
          } catch (err) {
            reject(err);
          }
        })
          .then((res) => Fumi.sendMessage(ID, `${res}`))
          .catch((err) => Fumi.sendMessage(ID, `${err}`));
        break;

      default:
        console.log(`Unhandled prefix: ${kata}`);
    }
    return;
  }

  const blush = /fumi/i;

  if (blush.test(kata)) {
    const imageUrl = await pict.blushy();
    const res = await run(kata);
    await Fumi.sendPhoto(ID, imageUrl, { caption: res });
  } else {
    const res = await run(kata);
    let mess = `
    [ New Message!! ]
    UserName: ${userName}
    ID_client: ${ID}
    Text: ${kata}
    Result: ${res}
    `;
    console.log(mess);
    await Fumi.sendMessage(ID, res);
  }
});



Fumi.onText(regexp, async (msg, match) => {
    const command = match[1];
    const args = match[2]?.trim();

    const commandModule = commands[command];
    if (commandModule) {
        try {
            await commandModule.execute(Fumi, msg, args);
        } catch (err) {
            console.error(`Error in command ${command}:`, err);
            await Fumi.sendMessage(msg.chat.id, "Terjadi kesalahan saat menjalankan perintah.");
        }
    } else {
        await Fumi.sendMessage(msg.chat.id, `Command tidak dikenal: ${command}`);
    }
});

Fumi.on("callback_query", async (callbackQuery) => {
    const data = callbackQuery.data;
    const command = Object.keys(commands).find(cmd => commands[cmd].callback);
    
    if (command && commands[command].callback) {
        try {
            await commands[command].callback(Fumi, callbackQuery);
        } catch (err) {
            console.error(`Error in callback for ${command}:`, err);
            await Fumi.answerCallbackQuery(callbackQuery.id, { text: "Terjadi kesalahan." });
        }
    } else {
        console.error("No matching callback command found.");
        await Fumi.answerCallbackQuery(callbackQuery.id, { text: "Invalid action.", show_alert: true });
    }
});
async function handleStartWithText(chatId, text) {
  await Fumi.sendMessage(chatId, text);
}


