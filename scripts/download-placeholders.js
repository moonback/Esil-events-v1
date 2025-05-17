const https = require('https');
const fs = require('fs');
const path = require('path');

const UNSPLASH_ACCESS_KEY = 'YOUR_UNSPLASH_ACCESS_KEY'; // À remplacer par votre clé API Unsplash

const downloadImage = (url, filepath) => {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        const writeStream = fs.createWriteStream(filepath);
        response.pipe(writeStream);
        writeStream.on('finish', () => {
          writeStream.close();
          resolve();
        });
      } else {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
    }).on('error', reject);
  });
};

const downloadPlaceholders = async () => {
  const baseUrl = 'https://api.unsplash.com/photos/random';
  const headers = {
    'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
  };

  // Créer les dossiers s'ils n'existent pas
  const dirs = [
    'public/images/products',
    'public/images/moodboards',
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  // Télécharger les images de produits
  for (let i = 1; i <= 5; i++) {
    const url = `${baseUrl}?query=event+equipment&orientation=landscape`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    await downloadImage(
      data.urls.regular,
      path.join('public/images/products', `placeholder-${i}.jpg`)
    );
    console.log(`Downloaded product image ${i}`);
  }

  // Télécharger les images de moodboards
  const categories = ['wedding', 'corporate', 'birthday'];
  for (const category of categories) {
    for (let i = 1; i <= 4; i++) {
      const url = `${baseUrl}?query=${category}+event&orientation=landscape`;
      const response = await fetch(url, { headers });
      const data = await response.json();
      await downloadImage(
        data.urls.regular,
        path.join('public/images/moodboards', `${category}-${i}.jpg`)
      );
      console.log(`Downloaded ${category} moodboard image ${i}`);
    }
  }

  // Télécharger les images par défaut
  const defaultImages = {
    'products/default.jpg': 'event+equipment',
    'moodboards/default.jpg': 'event+decoration',
  };

  for (const [path, query] of Object.entries(defaultImages)) {
    const url = `${baseUrl}?query=${query}&orientation=landscape`;
    const response = await fetch(url, { headers });
    const data = await response.json();
    await downloadImage(data.urls.regular, path.join('public/images', path));
    console.log(`Downloaded default image: ${path}`);
  }
};

downloadPlaceholders().catch(console.error); 