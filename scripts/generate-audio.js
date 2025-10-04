#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Create audio directory if it doesn't exist
const audioDir = path.join(__dirname, '..', 'public', 'audio');

if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

// Create placeholder audio files for different tones
const audioFiles = [
  {
    name: 'theme.mp3',
    description: 'Default theme music',
    tone: 'neutral'
  },
  {
    name: 'fantasy-theme.mp3',
    description: 'Fantasy theme music',
    tone: 'fantasy'
  },
  {
    name: 'comedy-theme.mp3',
    description: 'Comedy theme music',
    tone: 'comedy'
  },
  {
    name: 'epic-theme.mp3',
    description: 'Epic theme music',
    tone: 'epic'
  }
];

console.log('🎵 Creating placeholder audio files...');

audioFiles.forEach(audioFile => {
  const filePath = path.join(audioDir, audioFile.name);
  
  if (!fs.existsSync(filePath)) {
    // Create a simple text file as placeholder
    const placeholderContent = `# ${audioFile.description}
# Tone: ${audioFile.tone}
# 
# This is a placeholder file. In a production environment,
# you would replace this with actual audio files.
# 
# For development, you can:
# 1. Download royalty-free music from sites like:
#    - Freesound.org
#    - Zapsplat.com
#    - YouTube Audio Library
# 2. Use AI music generation services like:
#    - AIVA
#    - Amper Music
#    - Mubert
# 3. Create your own music with tools like:
#    - GarageBand
#    - FL Studio
#    - Ableton Live
#
# Recommended duration: 15-30 seconds
# Format: MP3, 128kbps, stereo
# 
# File created: ${new Date().toISOString()}
`;
    
    fs.writeFileSync(filePath, placeholderContent);
    console.log(`✅ Created placeholder: ${audioFile.name}`);
  } else {
    console.log(`⏭️  Already exists: ${audioFile.name}`);
  }
});

console.log('\n🎬 Audio setup complete!');
console.log('\n📝 Next steps:');
console.log('1. Replace placeholder files with actual audio');
console.log('2. Ensure files are in MP3 format');
console.log('3. Keep files under 30 seconds for optimal performance');
console.log('4. Use royalty-free or licensed music only');
