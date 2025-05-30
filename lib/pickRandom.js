async function blushy() {
   const images = [
      'https://pomf2.lain.la/f/tza0hsp.jpg',
      'https://pomf2.lain.la/f/13uvk40t.jpg',
      'https://pomf2.lain.la/f/hb5jljqn.jpg',
      'https://pomf2.lain.la/f/crjmvk54.jpg',
      'https://pomf2.lain.la/f/uupam5up.jpg'
   ];
   const random = Math.floor(Math.random() * images.length);
   return images[random];
}

module.exports = {
   blushy
}