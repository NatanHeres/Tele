const axios = require('axios')

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/** Fumi **/
async function fumi(content) {
  return new Promise(async (resolve, reject) => {
    const url = 'https://api.blackbox.ai/api/chat';
    const headers = {
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36',
      'Referer': 'https://www.blackbox.ai/agent/Charlotte-EvansbOm9UO8'
    };

    const body = {
      messages: [
        {
          id: generateId(),
          content,
          role: "user"
        }
      ],
      id: generateId(),
      previewToken: null,
      userId: null,
      codeModelMode: true,
      agentMode: {
        mode: true,
        id: "Charlotte-EvansbOm9UO8",
        name: "Xyro"
      },
      trendingAgentMode: {},
      isMicMode: false,
      maxTokens: 1024,
      isChromeExt: false,
      githubToken: null,
      clickedAnswer2: false,
      clickedAnswer3: false,
      clickedForceWebSearch: false,
      visitFromDelta: false,
      mobileClient: false
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(body),
        compress: true
      });

      let data = await response.text(); 
      data = data.replace(/^\$@\$.+?\$@\$/, '');

      resolve(data);
    } catch (error) {
      reject('Error:', error);
    }
  });
}

/** gempa **/
async function gempa() {
   const url = 'https://data.bmkg.go.id/DataMKG/TEWS/'
   const res = await axios.get( url + 'autogempa.json' );
   const msg = res.data.Infogempa.gempa
   const gambar = url + msg.Shakemap
   const teksNya = `
   \[ Kejadian Gempa Terbaru \]
   
Wilayah: ${msg.Wilayah}
Kedalaman: ${msg.Kedalaman}
Waktu: ${msg.Tanggal} \| ${msg.Jam}
Potensi: ${msg.Potensi}
Daerah yang Merasakan: ${msg.Dirasakan}
`
return {
   teksNya,
   gambar
  }
}

module.exports = {
  fumi,
  gempa
}