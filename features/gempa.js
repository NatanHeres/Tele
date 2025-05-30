const client = require('../scrape.js');

module.exports = {
    command: ["gempa"],
    alias: ["cek gempa"],
    category: "main",
    async execute(Fumi, msg, args) {
        const res = await client.gempa();
    await Fumi.sendPhoto(msg.chat.id, res.gambar, { caption: res.teksNya });
    }
};