# Freepik Integration Setup

This guide will help you set up Freepik's AI Image Generation API for high-quality image generation in your drama-studio.

## 🎨 What is Freepik?

Freepik offers an AI Image Generation API that can create professional-quality images from text prompts. This integration will replace the placeholder images with actual AI-generated visuals based on your episode content.

## 🔑 Getting Your Freepik API Key

1. **Visit Freepik API Page**: https://www.freepik.com/api/
2. **Sign up or Log in** to your Freepik account
3. **Navigate to API section** and create a new API key
4. **Copy your API key** (keep it secure!)

## ⚙️ Configuration

### 1. Add API Key to Environment

Add your Freepik API key to your `.env.local` file:

```bash
# Freepik API Key (optional - for high-quality image generation)
FREEPIK_API_KEY=your_actual_freepik_api_key_here
```

### 2. Update Environment Template

Copy the new template:
```bash
cp env-template-freepik.txt .env.local
```

Then edit `.env.local` with your actual API keys.

## 🚀 How It Works

### Automatic Fallback System
- **With Freepik API**: Generates high-quality comic book style images
- **Without Freepik API**: Falls back to placeholder images
- **On API Failure**: Gracefully falls back to placeholders

### Image Generation Process
1. **Analyzes episode content** (characters, setting, tone, captions)
2. **Creates detailed prompts** for each panel
3. **Generates images** using Freepik's Mystic model
4. **Adds episode branding** overlay
5. **Saves high-quality images** ready for Instagram

### Prompt Engineering
The system creates intelligent prompts like:
```
Comic book panel: A key goes missing, set in NYC Subway Kingdom, 
featuring Lena and Mako, comic book art style, fantasy comic, bold lines, 
vibrant colors, magical atmosphere, high quality, detailed, professional comic art, 
Instagram story format, vertical composition
```

## 🎯 Benefits

- **Professional Quality**: Real AI-generated images instead of placeholders
- **Contextual Content**: Images match your episode's theme, characters, and setting
- **Comic Book Style**: Optimized for social media storytelling
- **Automatic Branding**: Episode numbers and studio branding added automatically
- **Graceful Fallback**: Works even without Freepik API configured

## 💰 Pricing

Freepik offers flexible pricing:
- **Free tier**: Limited requests per month
- **Paid plans**: Higher limits and priority processing
- **Pay-per-use**: Pay only for what you generate

Check current pricing at: https://www.freepik.com/api/image-generation

## 🧪 Testing

### Test Without API Key
The system will automatically use placeholder images if no Freepik API key is provided.

### Test With API Key
1. Add your Freepik API key to `.env.local`
2. Generate a new episode
3. Click "Render" to see Freepik-generated images
4. Check the console for any API errors

## 🔧 Troubleshooting

### Common Issues

**"Freepik API key not configured"**
- Add `FREEPIK_API_KEY=your_key_here` to `.env.local`
- Restart the development server

**"Image generation failed"**
- Check your API key is valid
- Verify you have sufficient API credits
- Check network connectivity

**"Generation timed out"**
- Freepik API can take 30-60 seconds per image
- The system will retry automatically
- Consider upgrading to a paid plan for faster processing

### Debug Mode
Check the server logs for detailed error messages:
```bash
# Look for Freepik-related logs
tail -f logs/app.log | grep -i freepik
```

## 🎬 Example Results

With Freepik integration, your episodes will have:
- **Comic book panels** that match your story's mood
- **Character-appropriate visuals** based on your cast
- **Setting-specific backgrounds** (subway, forest, etc.)
- **Professional quality** ready for Instagram

## 📚 API Documentation

For advanced configuration, see:
- [Freepik API Docs](https://docs.freepik.com/api-reference)
- [Image Generation Guide](https://docs.freepik.com/api-reference?utm_source=openai)
- [Pricing Information](https://www.freepik.com/api/image-generation)

---

**Ready to create stunning visual stories?** Add your Freepik API key and start generating professional-quality images for your drama episodes! 🎨✨
