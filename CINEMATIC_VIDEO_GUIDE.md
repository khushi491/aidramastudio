# 🎬 Cinematic Video Generation Guide

This guide explains the enhanced video generation system that creates movie-like content using Freepik, voice synthesis, and professional video effects.

## 🚀 Features

### **Freepik Integration**
- **Cinematic Frame Generation**: Uses Freepik AI to generate high-quality cinematic frames
- **Movie-Style Prompts**: Creates detailed prompts for professional cinematography
- **Ultra Quality**: 4K movie-like results with dramatic lighting and composition
- **Vertical Format**: Optimized for mobile viewing (9:21 aspect ratio)

### **Voice Generation**
- **Freepik Priority**: Uses Freepik AI for voice synthesis (primary)
- **Multi-Provider Support**: ElevenLabs, Azure Speech, Google Cloud TTS (fallback)
- **Emotional Voice Options**: Dramatic, mysterious, excited, neutral tones
- **Voice Customization**: Speed, pitch, and emotion control
- **Fallback System**: Graceful degradation if Freepik isn't available

### **Background Music**
- **Tone-Based Selection**: Different tracks for fantasy, comedy, epic themes
- **Professional Mixing**: Voice at 100%, background music at 25%
- **Audio Quality**: 192k AAC encoding with 48kHz sample rate

### **Cinematic Effects**
- **Smooth Transitions**: Crossfade effects between frames
- **Professional Color Grading**: Unsharp mask for enhanced clarity
- **High-Quality Encoding**: CRF 16 for excellent quality
- **Mobile Optimization**: Perfect for Instagram stories and social media

### **Subtitle Support**
- **ASS Format**: Advanced SubStation Alpha subtitles
- **Cinematic Styling**: White text with black outline
- **Accessibility**: Full subtitle support for better accessibility
- **Timing**: 4 seconds per caption with smooth transitions

## 🛠️ Setup

### **Environment Variables**

Add these to your `.env` file:

```bash
# Freepik API (Required for cinematic frames)
FREEPIK_API_KEY=your_freepik_api_key_here
FREEPIK_BASE_URL=https://api.freepik.com/v1/ai
FREEPIK_MAX_WAIT_TIME=10000
FREEPIK_MAX_ATTEMPTS=30
FREEPIK_BACKOFF_MULTIPLIER=1.5

# Voice Generation (Freepik is prioritized, others are fallback)
# Freepik handles both images and voice generation
# Alternative TTS services (optional fallback)
# ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
# AZURE_SPEECH_KEY=your_azure_speech_key_here
# AZURE_REGION=your_azure_region
# GOOGLE_TTS_KEY=your_google_tts_key_here
```

### **Audio Files**

Place your audio files in `public/audio/`:

- `theme.mp3` - Default background music
- `fantasy-theme.mp3` - Fantasy tone music
- `comedy-theme.mp3` - Comedy tone music
- `epic-theme.mp3` - Epic tone music

**Audio Requirements:**
- Format: MP3
- Duration: 15-30 seconds
- Quality: 128kbps or higher
- Channels: Stereo

## 🎥 Video Generation Process

### **1. Cinematic Frame Generation**
```typescript
// Generates cinematic frames using Freepik
const cinematicFrames = await generateCinematicFrames(episodeId, panelPaths, scriptData);
```

**Features:**
- Uses Freepik's 'cinematic' style
- 'ultra' quality setting
- Film vertical format (9:21)
- Dramatic lighting and composition

### **2. Voice Generation**
```typescript
// Generates voice narration
const voicePath = await generateVoiceNarration(episodeId, hook);
```

**Options:**
- Voice: narrator, female, male, dramatic, mysterious
- Emotion: neutral, excited, dramatic, mysterious
- Speed: 0.5 - 2.0 (default: 0.9)
- Pitch: -50 to +50 (default: 5)

### **3. Background Music**
```typescript
// Selects music based on tone
const musicPath = await generateBackgroundMusic(episodeId, scriptData);
```

**Tone Mapping:**
- `fantasy` → `fantasy-theme.mp3`
- `comedy` → `comedy-theme.mp3`
- `epic` → `epic-theme.mp3`
- `default` → `theme.mp3`

### **4. Subtitle Generation**
```typescript
// Generates ASS subtitles
const subtitlePath = await generateSubtitles(episodeId, scriptData);
```

**Styling:**
- Font: Arial, 28px
- Color: White with black outline
- Position: Bottom
- Background: Semi-transparent black

### **5. Video Rendering**
```typescript
// Renders final cinematic video
const videoUrl = await renderCinematicVideo(episodeId, frames, audioTracks, subtitlePath, outputPath);
```

**Technical Specs:**
- Codec: H.264 (libx264)
- Quality: CRF 16 (high quality)
- Resolution: 1080x1920 (vertical)
- Frame Rate: 30fps
- Audio: AAC 192k, 48kHz stereo

## 🎨 Cinematic Effects

### **Video Filters**
- **Unsharp Mask**: `unsharp=5:5:0.8:3:3:0.4` for enhanced clarity
- **Crossfade Transitions**: Smooth 0.5s transitions between frames
- **Color Grading**: Professional cinematic color correction
- **Padding**: Black padding for consistent aspect ratio

### **Audio Filters**
- **High Pass**: `highpass=f=80` for voice, `highpass=f=200` for music
- **Low Pass**: `lowpass=f=8000` for voice, `lowpass=f=5000` for music
- **Volume Control**: Voice at 100%, music at 25%
- **Professional Mixing**: Advanced audio processing

### **Subtitle Effects**
- **Outline**: Black outline for better readability
- **Background**: Semi-transparent black background
- **Positioning**: Bottom placement with proper margins
- **Timing**: Synchronized with video content

## 📱 Mobile Optimization

### **Instagram Stories**
- **Aspect Ratio**: 9:16 (1080x1920)
- **Duration**: 4 seconds per frame
- **Quality**: High resolution with fast start
- **Audio**: Optimized for mobile speakers

### **Social Media**
- **Fast Start**: Optimized for immediate playback
- **Compression**: Efficient encoding for streaming
- **Compatibility**: Works on all major platforms

## 🔧 Troubleshooting

### **Common Issues**

**1. Freepik API Errors**
```bash
# Check API key and quota
curl -H "x-freepik-api-key: YOUR_KEY" https://api.freepik.com/v1/ai/mystic
```

**2. Voice Generation Fails**
- Check TTS service API keys
- Verify audio file permissions
- Ensure fallback audio exists

**3. Video Rendering Errors**
- Check FFmpeg installation
- Verify input file formats
- Ensure sufficient disk space

**4. Subtitle Issues**
- Check ASS file format
- Verify timing synchronization
- Ensure proper encoding

### **Performance Optimization**

**1. Memory Usage**
- Process frames in batches
- Clean up temporary files
- Monitor memory usage

**2. Processing Time**
- Use parallel processing where possible
- Optimize image sizes
- Cache generated content

**3. Quality vs Speed**
- Adjust CRF value (lower = better quality, slower)
- Use faster presets for development
- Optimize for target platform

## 🎯 Best Practices

### **Content Creation**
1. **High-Quality Prompts**: Use detailed, descriptive prompts for Freepik
2. **Consistent Tone**: Match voice and music to story tone
3. **Proper Timing**: 4 seconds per frame for optimal pacing
4. **Audio Balance**: Keep voice prominent, music subtle

### **Technical Setup**
1. **API Keys**: Use production-ready API keys
2. **Audio Files**: Use royalty-free or licensed music
3. **File Formats**: Ensure consistent input formats
4. **Error Handling**: Implement proper fallback systems

### **Performance**
1. **Caching**: Cache generated content when possible
2. **Parallel Processing**: Use multiple workers for generation
3. **Resource Management**: Monitor CPU and memory usage
4. **Cleanup**: Remove temporary files after processing

## 📊 Monitoring

### **Metrics to Track**
- Generation time per episode
- API usage and costs
- Video quality metrics
- User engagement with generated content

### **Logging**
```typescript
console.log(`Generated cinematic frame ${i + 1}`);
console.log(`Voice narration generated for episode ${episodeId}`);
console.log(`Using ${tone} background music`);
console.log(`Generated subtitles for episode ${episodeId}`);
```

## 🚀 Future Enhancements

### **Planned Features**
- **AI Music Generation**: Generate custom background music
- **Advanced Effects**: Zoom, pan, and color grading
- **Multiple Languages**: International subtitle support
- **Real-time Processing**: Live video generation
- **Cloud Integration**: AWS/Azure media processing

### **API Integrations**
- **Music AI**: AIVA, Amper Music, Mubert
- **Voice AI**: More TTS providers
- **Video AI**: Advanced video generation services
- **Analytics**: Content performance tracking

---

**🎬 Ready to create cinematic drama series content!**

The system now generates professional-quality videos with:
- ✅ Cinematic visual quality from Freepik
- ✅ Professional voice narration
- ✅ Dynamic background music
- ✅ Smooth transitions and effects
- ✅ Full subtitle support
- ✅ Mobile optimization

Perfect for creating engaging, movie-like drama series content! 🎭✨
