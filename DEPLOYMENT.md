# Deployment Guide - Tuition Centre Aspirasi Murni

This guide will help you deploy the tuition management system to Vercel with MongoDB Atlas.

## Prerequisites

- Vercel account (https://vercel.com)
- MongoDB Atlas account (https://www.mongodb.com/atlas)
- Git repository (already set up)

## Step 1: Set up MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to https://www.mongodb.com/atlas
   - Sign up for a free account

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose "M0 Sandbox" (Free tier)
   - Select your preferred cloud provider and region
   - Name your cluster (e.g., "tuition-aspirasi")

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password
   - Set privileges to "Read and write to any database"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Choose "Allow access from anywhere" (0.0.0.0/0) for Vercel deployment
   - Confirm the entry

5. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<dbname>` with `tuition-aspirasi`

## Step 2: Deploy to Vercel

1. **Install Vercel CLI** (optional)
   ```bash
   npm i -g vercel
   ```

2. **Deploy via Vercel Dashboard**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Configure the project:
     - Framework Preset: "Other"
     - Root Directory: `./`
     - Build Command: `cd frontend && npm install && npm run build`
     - Output Directory: `frontend/dist`

3. **Set Environment Variables**
   In Vercel dashboard, go to your project settings → Environment Variables:
   
   ```
   MONGO_URI = mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tuition-aspirasi?retryWrites=true&w=majority
   NODE_ENV = production
   PORT = 5001
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Step 3: Verify Deployment

1. **Check API Endpoints**
   - Visit `https://your-app.vercel.app/api`
   - Should return: `{"message": "Welcome to Tuition Centre Aspirasi Murni API", "registrationNumber": "JZ2C113"}`

2. **Test Frontend**
   - Visit `https://your-app.vercel.app`
   - Navigate through the application
   - Test CRUD operations

## Step 4: Seed Database (Optional)

If you want to populate your MongoDB Atlas database with sample data:

1. **Update seed.js**
   - Ensure the MongoDB connection string in your local `.env` points to Atlas
   
2. **Run Seed Script**
   ```bash
   cd backend
   node seed.js
   ```

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**
   - Verify connection string format
   - Check database user credentials
   - Ensure IP whitelist includes 0.0.0.0/0

2. **API Routes Not Working**
   - Check Vercel function logs
   - Verify environment variables are set
   - Ensure `vercel.json` is properly configured

3. **Frontend Build Errors**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in `package.json`
   - Ensure environment variables are set

### Vercel Logs
To view logs:
```bash
vercel logs <deployment-url>
```

## Environment Variables Summary

### Backend (.env)
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/tuition-aspirasi?retryWrites=true&w=majority
NODE_ENV=production
PORT=5001
```

### Frontend (.env.production)
```
VITE_API_URL=/api
```

## Post-Deployment

1. **Custom Domain** (Optional)
   - Add your custom domain in Vercel dashboard
   - Update DNS records as instructed

2. **Monitoring**
   - Monitor application performance in Vercel dashboard
   - Check MongoDB Atlas metrics

3. **Backup**
   - Set up automated backups in MongoDB Atlas
   - Consider implementing data export features

## Support

For issues with:
- **Vercel**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Application**: Check the GitHub repository issues