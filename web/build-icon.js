// Simple script to create a basic icon for Electron
const fs = require('fs');
const path = require('path');

console.log('Creating icon placeholder...');
console.log('Note: For production, replace public/icon.png with a proper 512x512 PNG icon');

// For now, just copy the existing icon or create a note
const iconPath = path.join(__dirname, 'public', 'icon.png');
if (!fs.existsSync(iconPath)) {
  console.log('Icon not found. Please add a 512x512 PNG icon at public/icon.png');
  console.log('You can use an online tool to convert your SVG to PNG');
}
