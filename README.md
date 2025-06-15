
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9b5c6c3e-06bb-429f-b957-8fb719504fd0

## 🚀 Quick Start

### Option 1: Docker Deployment (Recommended for Production)

```bash
# Clone repository
git clone <repository-url>
cd attendance-system

# Start with Docker
chmod +x docker-scripts.sh
./docker-scripts.sh prod

# Or for development
./docker-scripts.sh dev
```

Aplikasi akan tersedia di:
- Production: http://localhost
- Development: http://localhost:3000

### Option 2: Local Development

```bash
# Clone repository
git clone <repository-url>
cd attendance-system

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📖 Documentation

- [Docker Deployment Guide](./DOCKER_DEPLOYMENT.md) - Panduan lengkap deployment dengan Docker
- [Setup Guide](#setup-guide) - Panduan setup untuk first-time deployment

## 🔧 Setup Guide

### First Time Setup

1. **Access Application**: Buka aplikasi di browser
2. **Automatic Redirect**: Sistem akan otomatis redirect ke `/setup` 
3. **Follow Setup Wizard**:
   - Configure Supabase connection
   - Setup database schema
   - Create first admin account
4. **Complete**: Sistem siap digunakan!

### Supabase Configuration

Anda memerlukan Supabase instance untuk backend:

1. Buat project di [supabase.com](https://supabase.com)
2. Dapatkan Project URL dan Anon Key
3. Masukkan saat setup wizard
4. Database schema akan otomatis dibuat

## 🛠️ Development

### Local Development

```bash
npm install
npm run dev
```

### Docker Development

```bash
./docker-scripts.sh dev
```

### Production Build

```bash
# Local build
npm run build

# Docker build
./docker-scripts.sh build
```

## 🐳 Docker Commands

```bash
./docker-scripts.sh dev      # Development mode
./docker-scripts.sh prod     # Production mode
./docker-scripts.sh build    # Build image
./docker-scripts.sh stop     # Stop services
./docker-scripts.sh logs     # View logs
./docker-scripts.sh clean    # Clean up
```

## 📁 Project Structure

```
attendance-system/
├── src/
│   ├── components/          # React components
│   ├── pages/              # Page components
│   ├── hooks/              # Custom hooks
│   ├── integrations/       # External integrations
│   └── lib/                # Utility functions
├── Dockerfile              # Production Docker image
├── Dockerfile.dev          # Development Docker image
├── docker-compose.yml      # Docker Compose configuration
├── nginx.conf              # Nginx configuration
└── docker-scripts.sh       # Docker management scripts
```

## 🔧 Technologies

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Build Tool**: Vite
- **Deployment**: Docker, Nginx

## 📱 Features

- ✅ QR Code based attendance
- ✅ Admin dashboard
- ✅ Participant management
- ✅ Session management
- ✅ Attendance history
- ✅ Real-time updates
- ✅ Responsive design
- ✅ Docker support
- ✅ Open source ready

## 🔒 Security

- Authentication via Supabase Auth
- Row Level Security (RLS) policies
- Role-based access control
- Secure environment variables
- HTTPS support (with reverse proxy)

## 🚀 Deployment Options

### 1. Docker (Recommended)
- Production ready
- Easy scaling
- Includes Nginx
- Health checks included

### 2. Lovable Platform
- Click "Publish" in Lovable editor
- Automatic deployment
- Custom domain support

### 3. Manual Deployment
- Build: `npm run build`
- Serve `dist/` folder with any web server

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support & Troubleshooting

- Check [Docker Deployment Guide](./DOCKER_DEPLOYMENT.md)
- Review container logs: `./docker-scripts.sh logs`
- Ensure Supabase configuration is correct
- Verify ports are not in use

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9b5c6c3e-06bb-429f-b957-8fb719504fd0) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
