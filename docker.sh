#!/bin/bash

# Camera Maps Docker Management Script
# This script helps manage the Docker containers for the Camera Maps application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env file not found!"
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env and add your CLOUDFLARED_TOKEN before continuing."
        exit 1
    fi
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_info "Docker is running ✓"
}

# Function to build containers
build() {
    print_info "Building Docker containers..."
    docker-compose build --no-cache
    print_info "Build completed ✓"
}

# Function to start containers
start() {
    print_info "Starting Docker containers..."
    docker-compose up -d
    print_info "Containers started ✓"
    print_info ""
    print_info "Access your application at:"
    print_info "  - Frontend: http://localhost:2999"
    print_info "  - Backend: http://localhost:8090"
    print_info "  - PocketBase Admin: http://localhost:8090/_/"
}

# Function to stop containers
stop() {
    print_info "Stopping Docker containers..."
    docker-compose down
    print_info "Containers stopped ✓"
}

# Function to restart containers
restart() {
    print_info "Restarting Docker containers..."
    docker-compose restart
    print_info "Containers restarted ✓"
}

# Function to view logs
logs() {
    if [ -z "$1" ]; then
        print_info "Showing logs for all services..."
        docker-compose logs -f
    else
        print_info "Showing logs for $1..."
        docker-compose logs -f "$1"
    fi
}

# Function to show status
status() {
    print_info "Container status:"
    docker-compose ps
}

# Function to clean up
clean() {
    print_warning "This will remove all containers, networks, and volumes."
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleaning up..."
        docker-compose down -v
        print_info "Cleanup completed ✓"
    else
        print_info "Cleanup cancelled"
    fi
}

# Function to rebuild and restart
rebuild() {
    print_info "Rebuilding and restarting containers..."
    docker-compose down
    docker-compose up -d --build
    print_info "Rebuild completed ✓"
}

# Function to show help
show_help() {
    cat << EOF
Camera Maps Docker Management Script

Usage: ./docker.sh [command]

Commands:
    build       Build Docker containers
    start       Start Docker containers
    stop        Stop Docker containers
    restart     Restart Docker containers
    rebuild     Rebuild and restart containers
    logs [svc]  View logs (optionally for specific service: client, server, cloudflared)
    status      Show container status
    clean       Remove all containers, networks, and volumes
    help        Show this help message

Examples:
    ./docker.sh start
    ./docker.sh logs client
    ./docker.sh rebuild

EOF
}

# Main script logic
main() {
    check_docker

    case "${1:-}" in
        build)
            check_env_file
            build
            ;;
        start)
            check_env_file
            start
            ;;
        stop)
            stop
            ;;
        restart)
            restart
            ;;
        rebuild)
            check_env_file
            rebuild
            ;;
        logs)
            logs "$2"
            ;;
        status)
            status
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: ${1:-}"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
