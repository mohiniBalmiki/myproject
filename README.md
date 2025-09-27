# TaxWise: AI-Powered Personal Finance Platform

An intelligent financial management system designed specifically for Indian users to simplify tax filing and credit score management.

## 🚀 Features

### Smart Financial Data Ingestion
- Upload bank statements, credit card statements, or CSV files
- Automatic data cleaning, normalization, and transaction pattern identification
- Recognition of recurring income, EMIs, SIPs, rent, and insurance payments

### AI-Powered Tax Optimization Engine
- Automatic income and expense categorization
- Taxable income computation with relevant deductions (80C, 80D, 80G, 24(b), etc.)
- Old vs New tax regime simulation
- Personalized tax-saving recommendations

### CIBIL Score Advisor
- Credit behavior analysis from financial statements
- Score impact factor identification
- Actionable creditworthiness improvement recommendations
- "What-if" scenario simulations

### Interactive Dashboard & Reports
- Visual spending breakdowns
- Projected tax liability charts
- CIBIL health monitoring
- Downloadable summaries and personalized insights

## 🛠️ Technology Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Python Flask with AI/ML capabilities
- **Database**: SQLite/PostgreSQL
- **AI/ML**: scikit-learn, pandas, numpy
- **Data Visualization**: Chart.js, D3.js
- **File Processing**: pandas, openpyxl, PyPDF2

## 📁 Project Structure

```
taxwise/
├── frontend/           # React application
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/            # Flask API server
│   ├── app/
│   ├── models/
│   ├── utils/
│   └── requirements.txt
├── data/              # Sample data and templates
├── docs/              # Documentation
└── scripts/           # Utility scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd # TaxWise - AI-Powered Personal Finance Platform

## 🚀 Overview
TaxWise is an intelligent personal finance platform designed for Indian users that simplifies tax filing and credit score management through AI-powered analysis and optimization.

## ✨ Key Features

### 🧠 Smart Financial Data Ingestion
- Automated bank statement processing (PDF, Excel, CSV)
- Credit card statement analysis
- Intelligent transaction categorization using ML
- Support for multiple financial institutions

### 💰 AI-Powered Tax Optimization Engine
- Dynamic tax calculation for both old and new regimes
- Personalized deduction recommendations
- Real-time tax savings suggestions
- Investment optimization for tax benefits

### 📊 CIBIL Score Advisor
- Credit score analysis and monitoring
- Personalized improvement recommendations
- Payment behavior tracking
- Credit utilization optimization

### 📈 Interactive Dashboard & Reports
- Real-time financial insights
- Spending pattern analysis
- Tax liability projections
- Investment performance tracking

## 🏗️ Architecture

### Backend (Python/Flask)
- **Framework**: Flask 2.3.3 with SQLAlchemy ORM
- **Database**: PostgreSQL via Supabase (SQLite for development)
- **AI/ML**: scikit-learn, pandas, numpy for intelligent analysis
- **File Processing**: Support for PDF, Excel, CSV formats
- **Authentication**: Supabase Auth integration ready

### Frontend Integration
- **Current**: Temporary HTML demo for API testing
- **Planned**: React/Vue/Angular frontend (to be developed by team member)
- **API**: Comprehensive REST API with CORS enabled
- **Real-time**: Supabase real-time features for live updates

## 🛠️ Technology Stack

### Core Technologies
- **Backend**: Python 3.9+, Flask, SQLAlchemy
- **Database**: PostgreSQL (Supabase), SQLite (development)
- **AI/ML**: scikit-learn, pandas, numpy
- **File Processing**: PyPDF2, openpyxl, pandas
- **Authentication**: Supabase Auth

### Development Tools
- **Environment**: Python virtual environment
- **Dependencies**: pip with requirements.txt
- **Configuration**: Environment variables via .env
- **Testing**: Built-in Flask testing utilities

## 📋 Quick Start

### Prerequisites
- Python 3.9+
- pip (Python package manager)
- Supabase account (for production)

### Installation

1. **Clone and Setup**
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate  # Windows
   # source venv/bin/activate  # macOS/Linux
   pip install -r requirements.txt
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Run the Application**
   ```bash
   python app.py
   ```
   Server starts at `http://localhost:5000`

4. **Test the API**
   - Open `frontend/temp/index.html` for demo interface
   - Or use curl/Postman to test endpoints

## 🔌 API Integration

### Key Endpoints

#### Authentication
```http
POST /api/auth/register    # User registration
POST /api/auth/login       # User login
```

#### Data Management
```http
POST /api/data/upload      # Upload financial documents
GET  /api/data/transactions/{user_id}  # Get transactions
```

#### Tax Services
```http
POST /api/tax/calculate/{user_id}      # Calculate taxes
GET  /api/tax/optimization/{user_id}   # Get tax optimization
```

#### Analytics
```http
GET /api/dashboard/overview/{user_id}  # Dashboard data
GET /api/dashboard/charts/{user_id}    # Chart data
```

#### CIBIL Analysis
```http
GET /api/cibil/score/{user_id}         # Get CIBIL score
GET /api/cibil/recommendations/{user_id} # Get recommendations
```

### Frontend Integration Example
```javascript
// React integration example
const api = {
  baseURL: 'http://localhost:5000',
  
  async getDashboard(userId) {
    const response = await fetch(`${this.baseURL}/api/dashboard/overview/${userId}`);
    return response.json();
  },
  
  async uploadFile(userId, file, fileType) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', userId);
    formData.append('file_type', fileType);
    
    return fetch(`${this.baseURL}/api/data/upload`, {
      method: 'POST',
      body: formData
    });
  }
};
```

## 🧪 Testing

### Demo Interface
- Navigate to `frontend/temp/index.html`
- Interactive API testing interface
- Pre-configured test data and scenarios

### Manual API Testing
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","phone":"9876543210"}'
```

## 📊 Data Models

### User Profile
- Personal information (name, email, phone, PAN)
- Authentication and session management
- Preferences and settings

### Financial Data
- Bank statements and transactions
- Credit card statements
- Investment records
- Tax-related documents

### Analysis Results
- Tax calculations and optimizations
- CIBIL score analysis
- Spending pattern insights
- Investment recommendations

## 🔒 Security Features

- **Input Validation**: Comprehensive validation for all inputs
- **File Security**: Restricted file types and size limits
- **Data Privacy**: Secure handling of financial data
- **Environment Security**: Sensitive data in environment variables
- **CORS Configuration**: Proper cross-origin resource sharing

## 🚢 Deployment

### Development
- Local SQLite database for quick setup
- Flask development server
- Hot reload for rapid development

### Production
- Supabase PostgreSQL database
- Environment variable configuration
- Scalable cloud deployment ready

### Deployment Options
- **Heroku/Railway/Render**: Easy cloud deployment
- **Docker**: Containerized deployment
- **Traditional VPS**: Manual server deployment

## 📈 Future Enhancements

### Planned Features
- **Multi-language Support**: Hindi and regional languages
- **Advanced Analytics**: Machine learning insights
- **Investment Tracking**: Portfolio management
- **Bill Reminders**: Automated payment alerts
- **Goal Planning**: Financial goal tracking

### Integration Opportunities
- **Payment Gateways**: Razorpay, PayU integration
- **Banking APIs**: Open banking integration
- **Government APIs**: GST, income tax integration
- **Investment Platforms**: Mutual fund, stock APIs

## 🤝 Contributing

### Development Workflow
1. Backend development (current phase - ✅ Complete)
2. Frontend development (next phase)
3. Integration testing
4. Production deployment

### Team Roles
- **Backend Developer**: API development, database design, AI/ML implementation
- **Frontend Developer**: User interface, user experience, client-side logic
- **Integration**: API integration, testing, deployment

## 📞 Support

### Documentation
- `INTEGRATION_GUIDE.md`: Comprehensive integration guide
- API documentation available at `/api/docs`
- Code comments and docstrings throughout

### Getting Help
- Review the integration guide for common questions
- Check the demo interface for API usage examples
- Refer to the comprehensive error handling in the API

## 📄 License

This project is developed for educational and demonstration purposes as part of the BitNBuild'25 hackathon.

---

**Status**: Backend Complete ✅ | Frontend Integration Ready 🔄 | Production Deployment Ready 🚀

The TaxWise platform backend is fully functional with comprehensive AI-powered financial analysis, tax optimization, and CIBIL score management features. Ready for frontend integration and production deployment.
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```

3. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 📊 Key Capabilities

- **Smart Data Processing**: Automated financial statement analysis
- **Tax Calculation**: Comprehensive Indian tax law compliance
- **AI Recommendations**: Machine learning-powered financial insights
- **Credit Score Analysis**: CIBIL score improvement strategies
- **Interactive Visualizations**: Rich charts and dashboards
- **Report Generation**: Professional financial reports

## 🔧 Development

The application is built with modern development practices:
- RESTful API design
- Component-based frontend architecture
- Machine learning integration
- Secure data handling
- Responsive design

## 📈 Future Enhancements

- Mobile app development
- Advanced AI models
- Integration with banking APIs
- Real-time credit monitoring
- Investment advisory features

## 🤝 Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details. 