
# Docker Deployment Guide

## Panduan Deployment dengan Docker

### Prerequisites
- Docker dan Docker Compose terinstall
- Supabase instance (bisa dibuat gratis di supabase.com)

### Quick Start

#### 1. Clone Repository
```bash
git clone <repository-url>
cd attendance-system
```

#### 2. Setup Environment
```bash
# Copy environment template
cp .env.example .env

# Edit .env file dengan konfigurasi Anda (opsional)
# Supabase akan dikonfigurasi melalui setup wizard
```

#### 3. Development Mode
```bash
# Start development server dengan hot reload
chmod +x docker-scripts.sh
./docker-scripts.sh dev

# Atau menggunakan docker-compose langsung
docker-compose --profile dev up --build
```

Aplikasi akan tersedia di http://localhost:3000

#### 4. Production Mode
```bash
# Start production server
./docker-scripts.sh prod

# Atau menggunakan docker-compose langsung
docker-compose --profile prod up -d --build
```

Aplikasi akan tersedia di http://localhost

### First Time Setup

1. Akses aplikasi di browser
2. Anda akan otomatis diarahkan ke `/setup`
3. Ikuti wizard setup:
   - Konfigurasi Supabase (URL dan Anon Key)
   - Setup database schema
   - Buat admin pertama
4. Selesai! Sistem siap digunakan

### Docker Commands

```bash
# Development
./docker-scripts.sh dev      # Start development mode
./docker-scripts.sh stop     # Stop all services
./docker-scripts.sh logs     # View logs

# Production
./docker-scripts.sh prod     # Start production mode
./docker-scripts.sh build    # Build production image
./docker-scripts.sh clean    # Clean up resources
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | production |
| VITE_PORT | Development port | 3000 |
| VITE_HOST | Development host | 0.0.0.0 |

### Production Considerations

#### 1. Reverse Proxy
Untuk production, gunakan reverse proxy seperti Nginx atau Traefik:

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    build: .
    expose:
      - "80"
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx-proxy.conf:/etc/nginx/conf.d/default.conf
```

#### 2. SSL/TLS
Untuk HTTPS, gunakan Let's Encrypt dengan Certbot atau Cloudflare.

#### 3. Health Checks
Container include health check endpoints:
- `/health` - Basic health check
- Built-in Docker healthcheck

### Troubleshooting

#### Port sudah digunakan
```bash
# Cek port yang digunakan
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :3000

# Hentikan service yang menggunakan port
sudo systemctl stop apache2  # atau nginx
```

#### Permission denied
```bash
# Berikan permission pada script
chmod +x docker-scripts.sh
```

#### Build gagal
```bash
# Clean build cache
docker system prune -f
docker-compose down -v
./docker-scripts.sh clean
```

### Backup & Restore

Data disimpan di Supabase, jadi backup dilakukan di level database Supabase:

1. Masuk ke Supabase Dashboard
2. Settings > Database > Backup
3. Download backup sesuai kebutuhan

### Monitoring

Container logs dapat dimonitor dengan:
```bash
# Real-time logs
docker-compose logs -f

# Logs untuk service tertentu
docker-compose logs -f app
```

### Support

Jika mengalami masalah:
1. Cek logs container
2. Pastikan Supabase configuration benar
3. Verifikasi port tidak bentrok
4. Cek Docker dan Docker Compose version
