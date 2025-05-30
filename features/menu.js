const fs = require('fs');
const path = require('path');

module.exports = {
    command: ["menu"],
    alias: ["help", "list"],
    category: "main",
    async execute(Fumi, msg) {
        const featurePath = path.join(__dirname); // Path folder fitur
        const features = fs.readdirSync(featurePath)
            .filter(file => file.endsWith('.js')) // Ambil semua file, termasuk menu.js sendiri
            .map(file => {
                const feature = require(path.join(featurePath, file)); // Load setiap modul
                const commands = feature.command?.join(', ') || 'Tidak ada command';
                const aliases = feature.alias?.join(', ') || 'Tidak ada alias';
                const category = feature.category || 'Uncategorized';
                return { category, content: `${commands} [ ${aliases} ]` };
            });

        // Kelompokkan berdasarkan kategori
        const groupedByCategory = features.reduce((acc, feature) => {
            if (!acc[feature.category]) {
                acc[feature.category] = [];
            }
            acc[feature.category].push(feature.content);
            return acc;
        }, {});

        // Format pesan
        const menuMessage = Object.entries(groupedByCategory)
            .map(([category, commands], idx) => {
                const commandList = commands
                    .map((command, i) => `    ${i + 1}. ${command}`)
                    .join('\n');
                return `${category}: \n${commandList}`;
            })
            .join('\n\n');

        // Kirim daftar fitur ke pengguna
        await Fumi.sendPhoto(msg.chat.id, "https://storage.netorare.codes/f/2a2077568b8075a2c8fd4e8161b52382.jpg", {
            caption: `Halo!, aku adalah Fumi. Bot Yang Di Kembangkan Oleh Xyro. Aku Siap Membantu Mu🍓.\n\nAvailable Menu\n\=\=\=\=\=\=\=\=\=\=\=\=\=\=\=\=\n${menuMessage}\n\=\=\=\=\=\=\=\=\=\=\=\=\=\=\=\=`
        });
    }
};