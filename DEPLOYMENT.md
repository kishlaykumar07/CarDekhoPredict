# CarDekho Deployment Guide

## Issues Fixed ✅
- [x] Removed hardcoded localhost:5000 from frontend
- [x] Made CORS configurable from appsettings
- [x] Added environment-specific configurations
- [x] Database connection is file-based (SQLite) - portable

---

## Deployment Steps

### Option 1: Azure App Service (Recommended)

#### Backend Deployment:
1. **Create Azure App Service**
   ```bash
   # Install Azure CLI if needed
   az appservice plan create --name CarDekhoPlane --resource-group MyResourceGroup --sku B1
   az webapp create --resource-group MyResourceGroup --plan CarDekhoPlane --name cardekho-api --runtime "dotnet:8.0"
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   dotnet publish -c Release
   
   # Deploy using Azure CLI
   az webapp up --resource-group MyResourceGroup --name cardekho-api --location "eastus"
   ```

3. **Configure Production Settings**
   - Go to Azure Portal → App Service → Configuration
   - Set `ASPNETCORE_ENVIRONMENT` = `Production`
   - Add `CorsOrigins` = your frontend URL (e.g., `https://cardekho.azurewebsites.net`)

#### Frontend Deployment:
1. **Build Angular for Production**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy Frontend**
   - Option A: Static Web App
     ```bash
     az staticwebapp create --name cardekho-app --resource-group MyResourceGroup --source ./frontend
     ```
   - Option B: App Service with Node.js
     - Create App Service with Node.js runtime
     - Deploy using Azure CLI

---

### Option 2: Heroku Deployment

#### Backend (Heroku):
```bash
# Create Heroku app
heroku create cardekho-api

# Set environment
heroku config:set ASPNETCORE_ENVIRONMENT=Production -a cardekho-api

# Deploy
git push heroku main
```

#### Frontend (Vercel):
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd frontend
vercel --prod
```

**After deployment**, configure environment variable in Vercel:
- Create `.env.production.local`:
  ```
  API_BASE_URL=https://cardekho-api.herokuapp.com
  ```

---

### Option 3: AWS Elastic Beanstalk

#### Backend:
```bash
# Initialize EB
eb init -p "dotnet 8.0 running on 64bit Amazon Linux 2" --region us-east-1

# Configure environment
eb create cardekho-prod

# Set production settings
eb setenv ASPNETCORE_ENVIRONMENT=Production

# Deploy
eb deploy
```

#### Frontend (AWS S3 + CloudFront):
```bash
cd frontend
npm run build

# Create S3 bucket and deploy
aws s3 sync dist/frontend s3://cardekho-bucket/

# Create CloudFront distribution pointing to S3
```

---

### Option 4: Docker (Any Cloud Provider)

#### Create Dockerfile for Backend:
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY backend/ .
RUN dotnet publish -c Release -o out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/out .
EXPOSE 80
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ["dotnet", "CarReasearch.API.dll"]
```

#### Create Dockerfile for Frontend:
```dockerfile
FROM node:18 AS build
WORKDIR /app
COPY frontend/ .
RUN npm install
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist/frontend /usr/share/nginx/html
EXPOSE 80
```

---

## Database Setup

### SQLite in Production:
```csharp
// Already configured in appsettings.json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=/app/carresearch.db"
}
```

**Important**: Ensure persistent storage
- **Azure**: Use Azure Files or blob storage
- **AWS**: Use EBS volumes
- **Heroku**: Use Heroku Postgres (not SQLite for production)
- **Docker**: Mount volumes for database persistence

---

## Environment Variables Summary

### Backend (appsettings.Production.json):
```json
{
  "ASPNETCORE_ENVIRONMENT": "Production",
  "CorsOrigins": "https://yourdomain.com,https://www.yourdomain.com",
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=/persistent/carresearch.db"
  }
}
```

### Frontend (api.config.ts):
- Automatically detects production origin
- Uses API on same domain or backend service URL

---

## Pre-Deployment Checklist

- [x] CORS configured for production domains
- [x] API endpoint configurable
- [x] SQLite database path configurable
- [x] Environment-specific settings ready
- [ ] Database backup strategy (if using SQLite)
- [ ] SSL/TLS certificate configured
- [ ] Logging/monitoring setup (Application Insights, Datadog, etc.)
- [ ] Error handling and exception logging
- [ ] Rate limiting (if needed)

---

## Monitoring & Maintenance

1. **Application Insights (Azure)**
   ```csharp
   builder.Services.AddApplicationInsightsTelemetry();
   ```

2. **Health Checks**
   ```csharp
   builder.Services.AddHealthChecks();
   app.MapHealthChecks("/health");
   ```

3. **Logging**
   - Check production logs daily
   - Set up alerts for errors

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS errors | Update `CorsOrigins` in appsettings.Production.json |
| Database not found | Ensure persistent storage is mounted |
| API 404 errors | Verify backend URL is correct in frontend |
| Slow responses | Check database size, consider pagination |
| SQLite locked | Implement connection pooling, consider upgrading to PostgreSQL |

---

## Upgrade Path

For production scalability:
1. Replace SQLite with PostgreSQL or SQL Server
2. Add caching layer (Redis)
3. Implement API versioning
4. Add authentication/authorization
5. Implement rate limiting
