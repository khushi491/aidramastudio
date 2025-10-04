# drama-studio Setup Guide

## 🚀 Quick Start

### 1. Environment Setup

Copy the environment template and add your API keys:

```bash
cp env-template.txt .env.local
```

### 2. Required: OpenAI API Key

To use real AI generation (not mock data), you need an OpenAI API key:

1. Go to [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Edit `.env.local` and replace `your_openai_api_key_here` with your actual key:

```bash
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. Optional: Instagram Publishing

For real Instagram publishing (instead of mock mode):

1. Go to [https://developers.facebook.com/](https://developers.facebook.com/)
2. Create a new app
3. Get your App ID, App Secret, and Access Token
4. Update `.env.local`:

```bash
INSTAGRAM_APP_ID=your_instagram_app_id
INSTAGRAM_APP_SECRET=your_instagram_app_secret
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
MOCK_MODE=false
```

### 4. Start the Application

```bash
pnpm dev
```

Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## 🔧 Configuration Options

### Mock Mode vs Real AI

- **Mock Mode** (`MOCK_MODE=true`): Uses predetermined content, no API key needed
- **Real AI** (`MOCK_MODE=false`): Uses OpenAI GPT-4 for dynamic content generation

### Current Status

- ✅ **Mock Mode**: Currently disabled (`MOCK_MODE=false`)
- ❌ **OpenAI Key**: Required for AI generation
- ❌ **Instagram Keys**: Optional for publishing

## 🎯 Next Steps

1. **Add OpenAI API Key** to `.env.local` for real AI generation
2. **Test the workflow**: Generate → Render → Publish
3. **Add Instagram keys** (optional) for real publishing

## 🚨 Error Messages

- **"OPENAI_API_KEY is required"**: Add your OpenAI API key to `.env.local`
- **"Render failed"**: Check that ffmpeg is installed (`brew install ffmpeg`)
- **"Publish failed"**: Check Instagram API credentials or enable mock mode
