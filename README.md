 # 🚀 Uniclub - University Club Community Platform

[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.15.1-orange.svg)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-ISC-yellow.svg)](LICENSE)

## 🚀 Local Development

- **Frontend:** http://localhost:8081
- **Backend:** http://localhost:5000

> A modern tech news platform for university clubs, featuring **AI-curated content**, **student discussions**, and **community engagement**. Built with cutting-edge AI technology and modern web frameworks.

## ✨ Key Features

- 🤖 **AI-Powered News Curation** - Daily automated content selection using Claude 3.5 Haiku
- 📱 **Progressive Web App** - Mobile-first design with Capacitor for iOS/Android deployment
- 🔐 **Secure Authentication** - UTD email-based registration with JWT tokens
- 💬 **Social Networking** - Posts, comments, likes, follows, and group management
- 📅 **Event Management** - Create, RSVP, and manage university club events
- 📚 **Resource Sharing** - Upload and share educational materials
- 📊 **Engagement Analytics** - Universal like/save/share system across all content
- 🔔 **Notification System** - Real-time notifications for comments, likes, and mentions
- 🔄 **Club Switcher** - Seamlessly switch between multiple club memberships
- 🌐 **Real-time Updates** - Live content updates and notifications

## 🛠️ Technology Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **TypeScript 5.5.3** - Type-safe development
- **Vite 5.4.1** - Fast build tool and dev server
- **Tailwind CSS 3.4.11** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible component library
- **React Router DOM 6.26.2** - Client-side routing
- **React Query 5.56.2** - Server state management
- **Capacitor 7.2.0** - Cross-platform mobile deployment

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.1.0** - Web application framework
- **MongoDB 8.15.1** - NoSQL database
- **Mongoose 8.15.1** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Multer 2.0.1** - File upload handling
- **Node-cron 3.0.3** - Scheduled task management

### AI & External Services
- **Anthropic Claude 3.5 Haiku** - News curation and summarization
- **News API** - Tech news content source
- **Mozilla Readability** - Article content extraction

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** (LTS version recommended)
- **MongoDB** (Atlas cloud or local installation)
- **npm** or **yarn** package manager

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd uniclub
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Configuration**
Create `.env` file in `uniclub-backend/` directory:
```bash
# MongoDB Connection
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/uniclub

# JWT Secret
JWT_SECRET=your-secret-key

# Server Configuration
PORT=5000

# News API Key (Get from https://newsapi.org/)
NEWS_API_KEY=your-news-api-key

# Anthropic API Key (Get from https://console.anthropic.com/)
ANTHROPIC_API_KEY=your-anthropic-api-key
```

4. **Start the application**

**For Windows (Recommended):**
```powershell
npm run start:win
```

**For Linux/Mac:**
```bash
npm start
```

The application will automatically start both servers:
- **Frontend:** http://localhost:8081
- **Backend API:** http://localhost:5000

> **💻 Windows Users:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for detailed Windows-specific instructions and troubleshooting.

## 📋 Available Scripts

### Root Package.json
| Command | Description |
|---------|-------------|
| `npm start` | Starts both servers concurrently (Linux/Mac) |
| `npm run dev` | Starts both servers concurrently (Linux/Mac) |
| `npm run backend` | Starts only backend server |
| `npm run frontend` | Starts only frontend server |
| `npm run build` | Builds frontend for production |
| `npm run build:dev` | Builds frontend in development mode |
| `npm run lint` | Runs ESLint code quality check |
| `npm run preview` | Previews production build |
| `npm run curate:win` | 🪟 **Run news curation (Windows)** - One-time run |
| `npm run curate:news` | Run news curation (Linux/Mac) - One-time run |
| `npm run daily-curator` | ⚠️ Background daemon (runs forever) |
| `npm run install-all` | Installs dependencies for both frontend and backend |

### Windows-Specific Scripts
| Command | Description |
|---------|-------------|
| `npm run start:win` | 🪟 **Start both servers (Windows)** - Recommended! |
| `npm run stop:win` | 🛑 Stop all development servers |
| `npm run check:ports` | 🔍 Check server status and health |
| `npm run kill:all` | ⚠️ Emergency: Kill all Node.js processes |

> **💡 Windows Users:** Use `npm run start:win` for the best development experience with automatic port cleanup and status checking.

### Backend Package.json
| Command | Description |
|---------|-------------|
| `npm start` | Production server start |
| `npm run dev` | Development server with nodemon |
| `npm run daily-curator` | Manual news curation |
| `npm run curation` | Manual curation script |
| `npm run curation:verbose` | Verbose curation output |
| `npm run import` | Import CSV data |

## 🔌 API Documentation

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/signup-step1` | Validate UTD email | No |
| `POST` | `/api/auth/signup-step2` | Verify unique club ID | No |
| `POST` | `/api/auth/signup-step3` | Complete registration | No |
| `POST` | `/api/auth/login` | User login | No |
| `GET` | `/api/auth/validate` | Validate JWT token | Yes |
| `GET` | `/api/auth/me` | Get current user profile | Yes |

### News Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/news` | Get all approved news | No |
| `GET` | `/api/news/:id` | Get single news article | No |
| `POST` | `/api/news/:id/comment` | Add comment to news | Yes |
| `GET` | `/api/news/:id/comments` | Get comments for news | No |

### User Management
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/users` | List users with pagination | No |
| `GET` | `/api/users/me` | Get current user profile | Yes |
| `PUT` | `/api/users/profile` | Update profile | Yes |
| `POST` | `/api/users/avatar` | Upload avatar | Yes |
| `GET` | `/api/users/avatar/:userId` | Get user avatar | No |

### Events
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/events` | Get all events with filtering | No |
| `GET` | `/api/events/:id` | Get specific event | No |
| `POST` | `/api/events/:id/rsvp` | RSVP to event | Yes |
| `GET` | `/api/events/:id/rsvps` | Get event RSVPs | No |

### Social Features
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/social` | Get social posts | No |
| `POST` | `/api/social` | Create social post | Yes |
| `POST` | `/api/social/:id/comment` | Comment on post | Yes |
| `GET` | `/api/social/:id/comments` | Get post comments | No |

### Engagement System
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/engagement/like/:contentType/:contentId` | Like content | Yes |
| `POST` | `/api/engagement/save/:contentType/:contentId` | Save content | Yes |
| `POST` | `/api/engagement/share/:contentType/:contentId` | Share content | Yes |
| `POST` | `/api/engagement/view/:contentType/:contentId` | Record view | Yes |

### Notifications
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/notifications` | Get user notifications | Yes |
| `GET` | `/api/notifications/unread-count` | Get unread count | Yes |
| `PUT` | `/api/notifications/:id/read` | Mark as read | Yes |
| `PUT` | `/api/notifications/read-all` | Mark all as read | Yes |

### Resources
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/resources` | Get all resources | No |
| `GET` | `/api/resources/:id` | Get specific resource | No |
| `POST` | `/api/resources` | Upload resource | Yes (Admin) |

### Groups
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/api/groups` | Get all groups | No |
| `GET` | `/api/groups/:id` | Get specific group | No |
| `POST` | `/api/groups/:id/join` | Join group | Yes |

## 🤖 News Curation System

### Automated Process
The news curation system runs **automatically every day at midnight (Dallas time)** and includes:

1. **Content Fetching** - Retrieves fresh tech articles from News API
2. **AI Selection** - Claude 3.5 Haiku selects the best 20 articles (prioritizing AI/ML)
3. **Content Processing** - Full article scraping and AI-powered summarization
4. **Quality Control** - Positive/negative keyword filtering
5. **Fallback System** - Previous high-engagement articles if insufficient new content

### Manual Triggers (Development)

**Windows:**
```powershell
npm run curate:win           # Run curation once
npm run curate:win:verbose   # Run with detailed logs
```

**Linux/Mac:**
```bash
npm run curate:news          # Run curation once
npm run curate:news:verbose  # Run with detailed logs
```

**Backend Scripts:**
```bash
cd uniclub-backend
npm run curation             # One-time run
npm run curation:verbose     # Verbose output
```

### Production Daemon
```bash
npm run curate:daemon  # Background job - runs forever at midnight daily
```

> **📚 Detailed Guide:** See [NEWS_CURATION_GUIDE.md](NEWS_CURATION_GUIDE.md) for complete documentation.

### Curation Features
- **AI-Powered Selection** - Intelligent article filtering
- **Content Summarization** - AI-generated article summaries
- **Engagement Optimization** - Prioritizes high-performing content
- **Category Management** - Organized content by tech topics
- **Trending Detection** - Identifies and promotes viral content

## 📁 Project Structure

```
uniclub/
├── 📱 src/                    # Frontend React source
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── cards/            # Content card components
│   │   ├── chat/             # Chat functionality
│   │   └── icons/            # Custom icon components
│   ├── pages/                # Page components
│   │   ├── Homepage.tsx      # Main dashboard
│   │   ├── NewsPage.tsx      # News feed
│   │   ├── EventsPage.tsx    # Event management
│   │   ├── SocialPage.tsx    # Social networking
│   │   ├── ResourcesPage.tsx # Resource sharing
│   │   └── AuthPage.tsx      # Authentication
│   ├── hooks/                # Custom React hooks
│   ├── context/              # React context providers
│   ├── lib/                  # Utility libraries
│   └── routes.tsx            # Application routing
├── 🔧 uniclub-backend/       # Backend Node.js/Express
│   ├── routes/               # API route handlers
│   │   ├── newsRouter.js     # News endpoints
│   │   ├── userRouter.js     # User management
│   │   ├── eventRouter.js    # Event handling
│   │   ├── socialRouter.js   # Social features
│   │   ├── commentRouter.js  # Comment system
│   │   └── engagementRouter.js # Engagement tracking
│   ├── models/               # MongoDB schemas
│   │   ├── User.js          # User model
│   │   ├── News.js          # News articles
│   │   ├── Event.js         # Events
│   │   ├── SocialPost.js    # Social posts
│   │   └── Comment.js       # Comments
│   ├── middleware/           # Express middleware
│   │   ├── auth.js          # Authentication
│   │   ├── rateLimit.js     # Rate limiting
│   │   └── privacy.js       # Privacy controls
│   ├── services/             # Business logic
│   │   ├── NewsCurationService.js    # AI curation
│   │   ├── AISummaryService.js       # Content summarization
│   │   ├── EngagementService.js      # User engagement
│   │   └── EventService.js           # Event management
│   ├── jobs/                 # Scheduled tasks
│   │   └── midnightCuration.js      # Daily news curation
│   └── utils/                # Utility functions
├── 📱 public/                # Static assets
│   ├── Assets/               # Images and logos
│   ├── manifest.json         # PWA configuration
│   └── icon-*.png            # App icons
├── 📱 android/               # Android app build
├── 📄 Configuration Files
│   ├── package.json          # Frontend dependencies
│   ├── vite.config.ts        # Vite configuration
│   ├── tailwind.config.ts    # Tailwind CSS config
│   ├── capacitor.config.ts   # Mobile app config
│   └── tsconfig.json         # TypeScript config
└── 📚 Documentation
    ├── README.md                  # This file
    ├── CUSTOMIZATION_GUIDE.md     # Branding & customization guide
    ├── API_DOCUMENTATION.md       # Detailed API docs
    ├── WINDOWS_SETUP.md           # Windows setup guide
    ├── NEWS_CURATION_GUIDE.md     # News curation documentation
    └── ENV_SAFETY_GUIDE.md        # Environment file safety
```

## 🌍 Environment Setup

### Required Environment Variables

Create a `.env` file in the `uniclub-backend/` directory:

```bash
# MongoDB Connection (Required)
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/uniclub

# JWT Secret (Required)
JWT_SECRET=your-super-secret-jwt-key

# Server Configuration (Optional - defaults to 5000)
PORT=5000

# News API Key (Required for news curation)
NEWS_API_KEY=your-news-api-key-from-newsapi.org

# Anthropic API Key (Required for AI curation)
ANTHROPIC_API_KEY=your-anthropic-api-key-from-console.anthropic.com
```

### External Service Setup

1. **News API** - [Get API key](https://newsapi.org/)
2. **Anthropic** - [Get API key](https://console.anthropic.com/)
3. **MongoDB Atlas** - [Create cluster](https://mongodb.com/atlas)

## 🎯 Features Overview

### Core Functionality
- **📰 News Feed** - AI-curated tech articles with intelligent categorization
- **👥 User Management** - UTD email-based registration and profile management
- **💬 Social Networking** - Posts, comments, likes, follows, and group creation
- **📅 Event System** - Event creation, RSVP management, and calendar integration
- **📚 Resource Library** - File uploads, sharing, and educational content
- **🔐 Authentication** - Secure JWT-based user authentication
- **📱 Mobile App** - Cross-platform mobile deployment with Capacitor

### Advanced Features
- **🤖 AI Curation** - Daily automated content selection and summarization
- **📊 Analytics** - Comprehensive engagement tracking and user insights
- **🔍 Search** - Advanced content search and filtering across all content
- **📱 PWA** - Progressive web app with offline capabilities
- **🔔 Notifications** - Real-time notifications for comments, likes, and mentions
- **🔄 Club Switcher** - Easy switching between multiple club memberships
- **🎨 Portfolio Demo** - Auto-login mode for portfolio demonstrations

### User Experience
- **🎨 Modern UI** - Beautiful, responsive design with Tailwind CSS
- **📱 Mobile-First** - Optimized for mobile devices
- **♿ Accessibility** - WCAG compliant components
- **🌙 Dark Mode** - Theme switching support
- **⚡ Performance** - Fast loading and smooth interactions

## 🚀 Development Information

### Development Requirements
- **Node.js:** 18+ LTS version
- **npm:** 8.0+ or yarn
- **MongoDB:** 5.0+ (local or Atlas)
- **Memory:** 4GB+ RAM recommended
- **Storage:** 2GB+ free space

### Build Processes
- **Frontend Development:** `npm run frontend` (Vite dev server)
- **Backend Development:** `npm run backend` (Nodemon auto-reload)
- **Production Build:** `npm run build` (Vite production build)
- **Mobile Build:** `npx cap build` (Capacitor mobile build)

### Code Quality
- **TypeScript** - Full type safety
- **ESLint** - Code quality enforcement
- **Prettier** - Code formatting
- **Husky** - Git hooks for quality checks

### Testing
- **Frontend Testing** - React Testing Library (configured)
- **Backend Testing** - Jest testing framework
- **API Testing** - Built-in test endpoints

## 📱 Mobile Deployment

### Capacitor Configuration
The app is configured for mobile deployment using Capacitor:

```bash
# Build for mobile
npm run build
npx cap sync
npx cap build android
npx cap build ios
```

### Mobile Features
- **Native Performance** - Hardware-accelerated animations
- **Push Notifications** - Native notification support
- **Splash Screen** - Custom app launch experience
- **Status Bar** - Native status bar integration
- **Haptics** - Touch feedback and vibrations

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Verify MONGODB_URI in .env file
   - Check network connectivity
   - Ensure MongoDB service is running

2. **Port Already in Use**
   
   **Windows:**
   ```powershell
   # Check what's running
   npm run check:ports
   
   # Stop servers properly
   npm run stop:win
   
   # Or emergency kill all
   npm run kill:all
   ```
   
   **Linux/Mac:**
   ```bash
   # Kill process on port 5000
   lsof -ti:5000 | xargs kill -9
   
   # Kill process on port 8081
   lsof -ti:8081 | xargs kill -9
   ```

3. **API Keys Invalid**
   - Verify NEWS_API_KEY and ANTHROPIC_API_KEY
   - Check API key permissions and quotas

4. **Build Failures**
   - Clear node_modules and reinstall
   - Update Node.js to LTS version
   - Check TypeScript compilation errors

5. **Servers Start but Not Accessible (Windows)**
   ```powershell
   # Full reset
   npm run kill:all
   Start-Sleep -Seconds 3
   npm run start:win
   ```

### Debug Commands

**Windows:**
```powershell
# Check backend health
Invoke-WebRequest http://localhost:5000/api/health

# Check server status
npm run check:ports

# View logs (check separate terminal windows)
# - BACKEND SERVER window
# - FRONTEND SERVER window

# Test news curation
npm run daily-curator
```

**Linux/Mac:**
```bash
# Check backend health
curl http://localhost:5000/api/health

# View backend logs
npm run backend

# Test news curation
npm run daily-curator
```

> **📚 Detailed Windows Help:** See [WINDOWS_SETUP.md](WINDOWS_SETUP.md) for comprehensive Windows troubleshooting.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style

## 📄 License

This project is licensed under the **ISC License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UTD AI Club** - For the vision and requirements
- **Anthropic** - For AI-powered content curation
- **News API** - For reliable tech news content
- **Open Source Community** - For the amazing tools and libraries

## 📚 Additional Documentation

- **🎨 Customization Guide:** [CUSTOMIZATION_GUIDE.md](CUSTOMIZATION_GUIDE.md) - Logo, branding, and theming
- **🪟 Windows Setup:** [WINDOWS_SETUP.md](WINDOWS_SETUP.md) - Windows development guide
- **📰 News Curation:** [NEWS_CURATION_GUIDE.md](NEWS_CURATION_GUIDE.md) - AI curation system
- **🔐 Environment Safety:** [ENV_SAFETY_GUIDE.md](ENV_SAFETY_GUIDE.md) - Credential management
- **📡 API Documentation:** [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - Complete API reference

## 📞 Support

- **Documentation:** See guides above
- **Issues:** [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-repo/discussions)

---

**Made with ❤️ for the AI Club Community**

*Built with modern web technologies and powered by artificial intelligence*
