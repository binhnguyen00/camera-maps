@echo off
REM Camera Maps Docker Management Script for Windows
REM This script helps manage the Docker containers for the Camera Maps application

setlocal enabledelayedexpansion

REM Function to print colored messages
set "INFO=[INFO]"
set "WARNING=[WARNING]"
set "ERROR=[ERROR]"

REM Check if .env file exists
if not exist .env (
    echo %WARNING% .env file not found!
    echo %INFO% Creating .env from .env.example...
    copy .env.example .env
    echo %WARNING% Please edit .env and add your CLOUDFLARED_TOKEN before continuing.
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo %ERROR% Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)
echo %INFO% Docker is running

REM Main command logic
if "%1"=="" goto help
if "%1"=="build" goto build
if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="rebuild" goto rebuild
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="clean" goto clean
if "%1"=="help" goto help
goto unknown

:build
echo %INFO% Building Docker containers...
docker-compose build --no-cache
echo %INFO% Build completed
goto end

:start
echo %INFO% Starting Docker containers...
docker-compose up -d
echo %INFO% Containers started
echo.
echo %INFO% Access your application at:
echo   - Frontend: http://localhost:2999
echo   - Backend: http://localhost:8090
echo   - PocketBase Admin: http://localhost:8090/_/
goto end

:stop
echo %INFO% Stopping Docker containers...
docker-compose down
echo %INFO% Containers stopped
goto end

:restart
echo %INFO% Restarting Docker containers...
docker-compose restart
echo %INFO% Containers restarted
goto end

:rebuild
echo %INFO% Rebuilding and restarting containers...
docker-compose down
docker-compose up -d --build
echo %INFO% Rebuild completed
goto end

:logs
if "%2"=="" (
    echo %INFO% Showing logs for all services...
    docker-compose logs -f
) else (
    echo %INFO% Showing logs for %2...
    docker-compose logs -f %2
)
goto end

:status
echo %INFO% Container status:
docker-compose ps
goto end

:clean
echo %WARNING% This will remove all containers, networks, and volumes.
set /p confirm="Are you sure? (y/N): "
if /i "%confirm%"=="y" (
    echo %INFO% Cleaning up...
    docker-compose down -v
    echo %INFO% Cleanup completed
) else (
    echo %INFO% Cleanup cancelled
)
goto end

:help
echo Camera Maps Docker Management Script for Windows
echo.
echo Usage: docker.bat [command]
echo.
echo Commands:
echo     build       Build Docker containers
echo     start       Start Docker containers
echo     stop        Stop Docker containers
echo     restart     Restart Docker containers
echo     rebuild     Rebuild and restart containers
echo     logs [svc]  View logs (optionally for specific service: client, server, cloudflared)
echo     status      Show container status
echo     clean       Remove all containers, networks, and volumes
echo     help        Show this help message
echo.
echo Examples:
echo     docker.bat start
echo     docker.bat logs client
echo     docker.bat rebuild
echo.
goto end

:unknown
echo %ERROR% Unknown command: %1
echo.
goto help

:end
endlocal
