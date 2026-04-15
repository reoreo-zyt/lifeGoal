const path = require('path');
const fs = require('fs');

console.log('Current working directory:', process.cwd());

const imagePath = path.join(process.cwd(), 'public', 'images', 'ancient_character_men.webp');
console.log('Image path:', imagePath);
console.log('File exists:', fs.existsSync(imagePath));
