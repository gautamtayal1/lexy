# T3.Chat Clone 🤖💬

A modern, feature-rich AI chat application built for the t3.chat clonethon. This project replicates and extends the functionality of t3.chat with support for multiple AI models, real-time conversations, and advanced features.

![T3.Chat Clone](public/logo.svg)

## ✨ Features

### 🎯 Core Features

- **Multi-Model AI Support**: GPT-4, Claude, Gemini, Llama, and more
- **Real-time Chat**: Instant messaging with AI models
- **Thread Management**: Organize conversations with automatic titles
- **Image Generation**: Create images with OpenAI ImageGen and Vertex
- **File Attachments**: Upload and share files in conversations
- **Share Conversations**: Public sharing of chat threads
- **Dark/Light Theme**: Beautiful, responsive UI with theme switching

### 🔑 Authentication & Security

- **Clerk Authentication**: Secure user management and authentication
- **API Key Management**: Bring Your Own Key (BYOK) support
- **Encrypted Storage**: Client-side API key encryption
- **Role-based Access**: User-specific data isolation

### 🚀 Advanced Features

- **Theo Mode**: Special assistant mode with enhanced capabilities
- **Attachment Processing**: Handle various file types and images
- **Conversation History**: Persistent chat storage and retrieval
- **Mobile Responsive**: Optimized for all device sizes
- **Progressive Web App**: Installable web application

## 🛠️ Tech Stack

### Frontend

- **Next.js 15.3** - React framework with App Router
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe development
- **Tailwind CSS 4.1** - Utility-first styling
- **Redux Toolkit** - State management

### Backend & Database

- **Convex** - Real-time backend and database
- **Clerk** - Authentication and user management
- **DigitalOcean Spaces** - File storage (S3-compatible)

### AI & APIs

- **Vercel AI SDK** - AI model integration
- **OpenRouter** - Access to multiple AI models
- **Groq** - Fast inference for Llama models
- **OpenAI API** - GPT models and DALL-E
- **Google Gemini** - Google's AI models

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Convex account
- Clerk account

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd t0.chat
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

4. **Configure Convex**

   ```bash
   npx convex dev
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

Visit `http://localhost:3000` to see your application running!

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```env
# Convex
NEXT_PUBLIC_CONVEX_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_convex_deploy_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_FRONTEND_API_URL=your_clerk_frontend_api
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# AI APIs (Optional - users can add their own)
GROQ_API_KEY=your_groq_api_key
OPENROUTER_API_KEY=your_openrouter_api_key

# File Storage
DO_SPACES_KEY=your_digitalocean_spaces_key
DO_SPACES_SECRET=your_digitalocean_spaces_secret
DO_SPACES_REGION=your_digitalocean_spaces_region
DO_SPACES_BUCKET=your_digitalocean_spaces_bucket
```

## 🎮 Usage

### Basic Chat

1. Sign up or log in using Clerk authentication
2. Select an AI model from the dropdown
3. Start chatting with your chosen AI assistant

### API Key Configuration

1. Go to Settings → API Keys
2. Add your API keys for different providers:
   - **OpenRouter**: Access to GPT-4, Claude, and more premium models
   - **OpenAI**: Direct access to GPT models and DALL-E
   - **Gemini**: Google's AI models and image generation

### Image Generation

1. Select an image generation model (GPT ImageGen or Gemini ImageGen)
2. Describe the image you want to create
3. The AI will generate and display the image

### File Attachments

1. Click the attachment button in the chat input
2. Upload files (images, documents, etc.)
3. The AI can analyze and discuss the uploaded content

### Sharing Conversations

1. Click the share button in any conversation
2. Generate a public link to share your chat
3. Others can view (but not edit) the shared conversation

## 📁 Project Structure

```
t0.chat/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── store/            # Redux store
│   └── types/            # TypeScript types
├── convex/               # Convex backend functions
├── public/              # Static assets
└── ...config files
```

### Key Components

- `components/chat/` - Chat interface components
- `components/settings/` - Settings and configuration
- `api/chat/` - Main chat API endpoint
- `api/thread/` - Thread management
- `convex/` - Database schema and functions

## 🔌 API Endpoints

### Chat API

- `POST /api/chat` - Send messages and get AI responses
- `POST /api/thread/title` - Generate thread titles
- `POST /api/upload` - Handle file uploads

### Supported Models

- **Groq**: Llama 3.3 70B (Free)
- **OpenRouter**: GPT-4, Claude, Gemini Pro
- **OpenAI Direct**: GPT-4, GPT-4 Turbo, DALL-E
- **Gemini Direct**: Gemini 2.0, Gemini 2.5 Pro

## 🎨 Customization

### Adding New Models

1. Update `components/ModelDropdown.tsx`
2. Add model handling in `api/chat/route.ts`
3. Configure API keys in settings

### Styling

- Modify `globals.css` for global styles
- Update `tailwind.config.js` for theme customization
- Components use Tailwind utility classes

### Database Schema

- Modify `convex/schema.ts` for data structure changes
- Update corresponding functions in `convex/` directory

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables
4. Deploy with `pnpm deploy`

### Manual Build

```bash
pnpm build
pnpm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Write meaningful commit messages
- Test your changes thoroughly

## 📝 Scripts

```bash
# Development
pnpm dev              # Start development server
pnpm convex:dev       # Start Convex development

# Building
pnpm build           # Build for production
pnpm start           # Start production server

# Code Quality
pnpm lint            # Run ESLint
pnpm check-types     # TypeScript type checking
pnpm format          # Format code with Prettier

# Deployment
pnpm convex:deploy   # Deploy Convex functions
pnpm deploy          # Full deployment
```

## 🐛 Troubleshooting

### Common Issues

**500 Error on Thread Title**

- Check Convex connection and API keys
- Verify thread exists in database

**API Key Issues**

- Ensure keys are properly formatted
- Check environment variables
- Verify API key permissions

**File Upload Problems**

- Check DigitalOcean Spaces configuration
- Verify file size limits
- Ensure proper CORS settings

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for the t3.chat clonethon
- Inspired by the original t3.chat
- Thanks to all the open-source libraries and APIs used

## 📞 Support

For support and questions:

- Open an issue on GitHub
- Check the troubleshooting section
- Review Convex and Clerk documentation

---

**Built with ❤️ for the t3.chat clonethon**
