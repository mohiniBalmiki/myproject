# TaxWise Backend Setup & Integration Guide

## Quick Start

### 1. Environment Setup

1. Clone the repository
2. Navigate to the backend directory: `cd backend`
3. Create a virtual environment: `python -m venv venv`
4. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - macOS/Linux: `source venv/bin/activate`
5. Install dependencies: `pip install -r requirements.txt`

### 2. Database Configuration

#### Option A: SQLite (Development)
- No additional setup needed
- Database file will be created automatically

#### Option B: Supabase (Production)
1. Create a Supabase project at https://supabase.com
2. Get your project URL and API keys
3. Create `.env` file from `.env.example`
4. Update the following variables:
```
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-key
DATABASE_URL=your-postgresql-connection-string
```

### 3. Run the Application

```bash
python app.py
```

The server will start on `http://localhost:5000`

## Frontend Integration

### API Base URL
- Development: `http://localhost:5000`
- Production: Your deployed backend URL

### Authentication
The current implementation uses a simple email-based authentication. For production, integrate with Supabase Auth:

```javascript
// Example integration with Supabase Auth
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
)

// Register user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})
```

### Key API Endpoints

#### User Management
```javascript
// Register user
POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "9876543210",
  "pan_number": "ABCDE1234F"
}

// Login user
POST /api/auth/login
{
  "email": "user@example.com"
}
```

#### File Upload
```javascript
// Upload financial data
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('user_id', userId);
formData.append('file_type', 'bank_statement'); // or 'credit_card', 'csv'

fetch('/api/data/upload', {
  method: 'POST',
  body: formData
});
```

#### Tax Calculation
```javascript
// Calculate tax
POST /api/tax/calculate/{user_id}
{
  "financial_year": "2023-24",
  "additional_deductions": {
    "80C": 50000,
    "80D": 25000
  }
}
```

#### Dashboard Data
```javascript
// Get dashboard overview
GET /api/dashboard/overview/{user_id}

// Get chart data
GET /api/dashboard/charts/{user_id}?type=spending
```

## Frontend Integration Options

### Option 1: React Integration
```jsx
// Example React component
import React, { useState, useEffect } from 'react';

const Dashboard = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState(null);
  
  useEffect(() => {
    fetch(`http://localhost:5000/api/dashboard/overview/${userId}`)
      .then(res => res.json())
      .then(data => setDashboardData(data.dashboard));
  }, [userId]);
  
  if (!dashboardData) return <div>Loading...</div>;
  
  return (
    <div>
      <h1>Welcome, {dashboardData.user_info.name}</h1>
      <div>
        <h3>Financial Summary</h3>
        <p>Income: ₹{dashboardData.financial_summary.total_income}</p>
        <p>Expenses: ₹{dashboardData.financial_summary.total_expenses}</p>
        <p>Savings: ₹{dashboardData.financial_summary.net_savings}</p>
      </div>
    </div>
  );
};
```

### Option 2: Vue.js Integration
```vue
<template>
  <div>
    <h1>TaxWise Dashboard</h1>
    <div v-if="dashboard">
      <h3>{{ dashboard.user_info.name }}</h3>
      <p>Total Income: ₹{{ dashboard.financial_summary.total_income }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dashboard: null
    };
  },
  async mounted() {
    const response = await fetch(`/api/dashboard/overview/${this.userId}`);
    this.dashboard = await response.json();
  }
};
</script>
```

### Option 3: Vanilla JavaScript
```javascript
// Simple vanilla JS integration
class TaxWiseAPI {
  constructor(baseURL = 'http://localhost:5000') {
    this.baseURL = baseURL;
  }
  
  async getDashboard(userId) {
    const response = await fetch(`${this.baseURL}/api/dashboard/overview/${userId}`);
    return response.json();
  }
  
  async uploadFile(userId, file, fileType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('file_type', fileType);
    
    const response = await fetch(`${this.baseURL}/api/data/upload`, {
      method: 'POST',
      body: formData
    });
    return response.json();
  }
}

// Usage
const api = new TaxWiseAPI();
const dashboard = await api.getDashboard(1);
```

## Data Models

### User
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "9876543210",
  "pan_number": "ABCDE1234F",
  "created_at": "2024-01-01T00:00:00",
  "updated_at": "2024-01-01T00:00:00"
}
```

### Transaction
```json
{
  "id": 1,
  "date": "2024-01-15",
  "description": "Salary Credit",
  "amount": 50000,
  "transaction_type": "credit",
  "category": "Salary",
  "subcategory": "Monthly Salary",
  "is_recurring": true,
  "tax_relevant": true,
  "tax_section": "income"
}
```

### Tax Calculation
```json
{
  "gross_income": 600000,
  "taxable_income": 400000,
  "old_regime_tax": 25000,
  "new_regime_tax": 20000,
  "recommended_regime": "new",
  "potential_savings": 5000,
  "calculation_data": {
    "deductions": {
      "80C": 150000,
      "80D": 25000
    }
  }
}
```

## Deployment

### Backend Deployment
1. **Heroku/Railway/Render**
   ```bash
   # Add Procfile
   web: python app.py
   
   # Set environment variables
   DATABASE_URL=your-postgresql-url
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-key
   ```

2. **Docker**
   ```dockerfile
   FROM python:3.9-slim
   WORKDIR /app
   COPY requirements.txt .
   RUN pip install -r requirements.txt
   COPY . .
   EXPOSE 5000
   CMD ["python", "app.py"]
   ```

### Frontend Deployment
- Build your React/Vue/Angular app
- Deploy to Vercel/Netlify/Cloudflare Pages
- Update API_BASE_URL to your backend URL

## Testing

### Manual Testing
1. Start the backend server
2. Open `frontend/temp/index.html` in a browser
3. Test the API endpoints using the demo interface

### API Testing with curl
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Get dashboard
curl http://localhost:5000/api/dashboard/overview/1
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **CORS**: Configure CORS for your frontend domain
3. **Input Validation**: All inputs are validated on the backend
4. **File Uploads**: File types and sizes are restricted
5. **Supabase Auth**: Implement proper authentication for production

## Support & Integration

The backend is fully functional and ready for integration. Your frontend developer can:

1. Use the temporary frontend as a reference
2. Integrate with any modern frontend framework
3. Utilize the comprehensive REST API
4. Leverage Supabase for authentication and real-time features

For questions or integration support, refer to the API documentation at `/api/docs` endpoint.