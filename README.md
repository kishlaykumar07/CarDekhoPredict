# Car Buyer Recommendation Platform

This repository contains:

- `frontend` - Angular 17 application
- `backend` - .NET 8 Web API

## Folder Structure

```text
CarDekho/
|- backend/    # .NET 8 Web API
|- frontend/   # Angular 17 app
`- README.md
```

## Prerequisites

- .NET SDK 8.0+
- Node.js 18+ and npm
- Angular CLI (optional globally, project uses local CLI via npm scripts)

## Run Backend (.NET 8 Web API)

```powershell
Set-Location backend
# If restore is needed
# dotnet restore

dotnet run --urls http://localhost:5000
```

Backend will run on: http://localhost:5000

## Run Frontend (Angular 17)

```powershell
Set-Location frontend
npm install
npm start
```

Frontend will run on: http://localhost:4200

## Notes

If `dotnet restore` fails due to custom NuGet feeds in your machine config, update your NuGet source settings to a reachable feed and run restore again.
