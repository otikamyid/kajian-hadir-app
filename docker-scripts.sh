
#!/bin/bash

# Docker management scripts for Attendance System

case "$1" in
  "dev")
    echo "Starting development environment..."
    docker-compose --profile dev up --build
    ;;
  "prod")
    echo "Starting production environment..."
    docker-compose --profile prod up -d --build
    ;;
  "build")
    echo "Building production image..."
    docker build -t attendance-system:latest .
    ;;
  "stop")
    echo "Stopping all services..."
    docker-compose down
    ;;
  "logs")
    echo "Showing logs..."
    docker-compose logs -f
    ;;
  "clean")
    echo "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    ;;
  *)
    echo "Usage: $0 {dev|prod|build|stop|logs|clean}"
    echo ""
    echo "Commands:"
    echo "  dev   - Start development environment with hot reload"
    echo "  prod  - Start production environment"
    echo "  build - Build production Docker image"
    echo "  stop  - Stop all running services"
    echo "  logs  - Show container logs"
    echo "  clean - Stop services and clean up resources"
    exit 1
    ;;
esac
