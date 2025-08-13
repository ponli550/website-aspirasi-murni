# Tuition Centre Aspirasi Murni - Fee Payment System

A comprehensive web-based fee payment management system for Tuition Centre Aspirasi Murni (Registration Number: JZ2C113).

## Features

### Student Management
- Add, edit, and delete student records
- Bulk delete functionality
- Student profile management with contact information
- Search and filter capabilities

### Payment Management
- Record and track fee payments
- Monthly payment reports
- Payment history for each student
- Bulk delete functionality
- Export capabilities (PDF, Excel)

### Dashboard & Analytics
- Real-time dashboard with key metrics
- Monthly revenue tracking
- Student enrollment statistics
- Payment status overview
- Custom MYR currency display

### E-Invoice Generation
- Generate professional invoices
- PDF export functionality
- Automated invoice numbering

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **CORS** for cross-origin requests
- **Morgan** for logging
- **Puppeteer** for PDF generation

### Frontend
- **React 19** with Vite
- **Material-UI (MUI)** for components
- **React Router** for navigation
- **Axios** for API calls
- **Chart.js** for data visualization
- **jsPDF** and **html2canvas** for exports

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ponli550/website-aspirasi-murni.git
   cd website-aspirasi-murni
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**
   ```bash
   # Backend (.env)
   cd ../backend
   cp .env.example .env
   # Edit .env with your MongoDB connection string
   ```

5. **Start the development servers**
   
   **Backend** (Terminal 1):
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend** (Terminal 2):
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:5001

### Seed Database (Optional)
```bash
cd backend
node seed.js
```

## Deployment

This application is configured for deployment on **Vercel** with **MongoDB Atlas**.

### Quick Deploy
1. Fork this repository
2. Connect to Vercel
3. Set up MongoDB Atlas
4. Configure environment variables
5. Deploy!

📖 **[Complete Deployment Guide](./DEPLOYMENT.md)**

## Project Structure

```
tuition-aspirasi/
├── backend/
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── server.js        # Express server
│   └── seed.js          # Database seeding
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Main application pages
│   │   └── services/    # API service layer
│   └── dist/            # Build output
├── vercel.json          # Vercel configuration
└── DEPLOYMENT.md        # Deployment guide
```

## API Endpoints

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/:id` - Get student by ID
- `PATCH /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

### Payments
- `GET /api/payments` - Get all payments
- `POST /api/payments` - Create new payment
- `GET /api/payments/:id` - Get payment by ID
- `PATCH /api/payments/:id` - Update payment
- `DELETE /api/payments/:id` - Delete payment
- `GET /api/payments/student/:studentId` - Get payments by student
- `GET /api/payments/month/:month/:year` - Get payments by month

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/students` - Get student summaries
- `GET /api/dashboard/monthly/:month/:year` - Get monthly report

## Environment Variables

### Backend
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/tuition-aspirasi
NODE_ENV=development
```

### Frontend
```env
VITE_API_URL=http://localhost:5001/api
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions:
- Create an issue in this repository
- Check the [Deployment Guide](./DEPLOYMENT.md) for deployment issues

---

**Tuition Centre Aspirasi Murni**  
Registration Number: JZ2C113