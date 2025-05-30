const axios = require("axios");

// Variabel API dan Cache
const API_KEY = "Xy-admkey"; // Ganti dengan API key Anda
const BASE_URL = "https://api.xyro.tech/api";
const doujinCache = new Map(); // Penyimpanan sementara untuk URL doujin

module.exports = {
    command: ["doujindesu"],
    alias: ["doujin", "ds"],
    category: "Doujindesu",
    async execute(Fumi, msg, args) {
        const chatId = msg.chat.id;

        if (!args) {
            // Kirim pesan loading
            const loadingMessage = await Fumi.sendMessage(chatId, "⏳ Fetching latest doujin...");

            try {
                // Fetch doujin terbaru
                const { data } = await axios.get(`${BASE_URL}/doujinlatest`, {
                    params: { apikey: API_KEY },
                });

                if (data.status !== "Success") {
                    throw new Error("Failed to fetch doujin data.");
                }

                // Ambil maksimal 3 hasil
                const results = data.result.slice(0, 3);

                // Simpan data ke cache dan buat keyboard
                const keyboard = results.map((item, index) => {
                    const cacheKey = `doujin_${Date.now()}_${index}`; // ID unik
                    doujinCache.set(cacheKey, item.Url); // Simpan URL ke cache
                    return [
                        {
                            text: `${index + 1}. ${item.Title}`,
                            callback_data: cacheKey, // Gunakan ID unik
                        },
                    ];
                });

                // Edit pesan loading menjadi list dengan inline keyboard
                await Fumi.editMessageText("📚 *Choose a Doujin:*", {
                    chat_id: chatId,
                    message_id: loadingMessage.message_id,
                    parse_mode: "Markdown",
                    reply_markup: { inline_keyboard: keyboard },
                });
            } catch (error) {
                console.error(error);
                await Fumi.editMessageText("❌ Failed to fetch doujin data. Please try again later.", {
                    chat_id: chatId,
                    message_id: loadingMessage.message_id,
                });
            }

            return;
        }
    },

    // Callback handler untuk tombol detail
    async callback(Fumi, callbackQuery) {
        const data = callbackQuery.data;

        // Validasi data dari callback
        if (doujinCache.has(data)) {
            const chatId = callbackQuery.message.chat.id;
            const messageId = callbackQuery.message.message_id;
            const doujinUrl = doujinCache.get(data);

            // Kirim pesan loading untuk detail
            await Fumi.answerCallbackQuery(callbackQuery.id, { text: "⏳ Fetching detail..." });

            try {
                // Fetch detail doujin
                const { data: detailData } = await axios.get(`${BASE_URL}/doujindetail`, {
                    params: { url: doujinUrl, apikey: API_KEY },
                });

                if (detailData.status !== "Success") {
                    throw new Error("Failed to fetch doujin detail.");
                }

                const detail = detailData.result;

                // Format pesan detail
                const detailMessage = `
📖 *${detail.title}*
👨‍🎨 Author: ${detail.author || "Unknown"}
📜 Status: ${detail.status}
📅 Created Date: ${detail.createdDate}
🎭 Tags: ${detail.tags.join(", ")}

🔗 [Read Chapters](${detail.chapters[0]?.link || "#"})`;

                // Edit pesan dengan detail
                await Fumi.editMessageText(detailMessage, {
                    chat_id: chatId,
                    message_id: messageId,
                    parse_mode: "Markdown",
                });
            } catch (error) {
                console.error(error);
                await Fumi.editMessageText("❌ Failed to fetch doujin detail. Please try again later.", {
                    chat_id: chatId,
                    message_id: messageId,
                });
            }
        } else {
            await Fumi.answerCallbackQuery(callbackQuery.id, {
                text: "❌ Invalid data. Please try again.",
                show_alert: true,
            });
        }
    },
};