# BNPL Payment Plan Simulator

A simple Buy Now, Pay Later (BNPL) dashboard built with Django REST Framework backend and React frontend, allowing merchants to create payment plans and users to manage their installments.

## Features

### Core Features

- **Merchant Dashboard**: Create BNPL plans with automatic installment generation
- **User Dashboard**: View and manage payment installments with progress tracking
- **Payment Simulation**: Simulate payments with status updates
- **Authentication**: Separate login flows for merchants and users
- **Security**: Role-based access control and permission classes

### Bonus Features

- **Overdue Calculation**: Automatic marking of late installments
- **Email Notifications**: Celery-based payment reminders
- **Analytics Dashboard**: Merchant insights on revenue and success rates

## Tech Stack

### Backend

- Python 3.10.4
- Django 4.2
- Django REST Framework
- SQLite
- Celery (for async tasks)
- Redis (message broker)

### Frontend

- React 19
- Axios for API calls
- React Router for navigation
- Context API for state management

## Installation & Setup

### Prerequisites

- Python 3.10.4
- Node.js 22.13.1
- Redis (for Celery)

### Backend Setup

1. **Clone and setup virtual environment**

```bash
git clone <repository-url>
cd django-backend
python -m venv venv
source venv/bin/activate
```

2. **Install dependencies**

```bash
cd bnpl
pip install -r requirements.txt
```

3. **Environment Configuration**
   Create `.env` file in backend directory:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/7
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

4. **Database Setup**

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

5. **Start Backend Services**

```bash
# Terminal 1: Django server
python manage.py runserver

# Terminal 2: Celery worker (for notifications)
celery -A bnpl worker --loglevel=info

# Terminal 3: Celery beat (for scheduled tasks)
celery -A bnpl beat --loglevel=info
```

### Frontend Setup

1. **Install dependencies**

```bash
cd react_frontend/bnpl-frontend
npm install
```

2. **Environment Configuration**
   Create `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:8000
```

3. **Start Frontend**

```bash
npm start
```

## Usage

### For Merchants

1. **Register/Login** as a merchant
2. **Create Payment Plans**:
   - Enter total amount (e.g., 1000 ريال)
   - Specify user email
   - Choose number of installments (2-12)
   - Set start date
3. **Monitor Plans**: View analytics dashboard with success rates and overdue payments

### For Users

1. **Login** with email used in payment plan
2. **View Installments**: See all upcoming and past payments
3. **Make Payments**: Click "Pay Now" for pending installments
4. **Track Progress**: Visual progress bars show completion status

## API Endpoints

### Authentication

- `POST /api/auth/register/` - User/Merchant registration
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/token/refresh/` - Fetch New Access Token from Refresh Token

### Payment Plans

- `POST /api/plans/` - Create BNPL plan (Merchants only)
- `GET /api/plans/` - List plans (filtered by user role)
- `GET /api/plans/{id}/` - Plan details
- `PUT /api/plans/{id}/` - Update plan (Merchants only)

### Installments

- `GET /api/plans/installments/` - List user's installments
- `POST /api/plans/installments/{id}/pay/` - Process payment

### Analytics (Merchants only)

- `GET /api/analytics/dashboard/` - Get all Revenue and success metrics (for merchants) / Get stats on upcoming payments (for customers)

## Security Considerations

### Current Implementation

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based permissions (Merchant/User)
- **Data Isolation**: Users can only access their own plans/installments
- **Input Validation**: Comprehensive validation on all endpoints
- **CORS**: Configured for frontend domain only

### Production Security Enhancements

- **Payment Processing**: Integrate with secure payment gateways (Stripe, PayPal)
- **PCI Compliance**: Never store sensitive payment data
- **Rate Limiting**: Implement API rate limiting to prevent abuse
- **HTTPS**: Enforce SSL/TLS for all communications
- **Database Security**: Use encrypted connections and proper access controls
- **Audit Logging**: Log all financial transactions and access attempts
- **Two-Factor Authentication**: Implement 2FA for merchant accounts
- **Data Encryption**: Encrypt sensitive data at rest

## Architecture Decisions & Trade-offs

### Design Choices

1. **Installment Calculation**: Equal splits for simplicity (could add custom amounts)
2. **Payment Simulation**: Mock payments for demo purposes
3. **Date Handling**: Monthly intervals by default (could add weekly/bi-weekly)
4. **User Management**: Simple email-based identification

### Time Constraints Trade-offs

1. **Simplified UI**: Focus on functionality over advanced styling
2. **Mock Payments**: Real payment integration would require additional security
3. **Basic Analytics**: Could expand with more detailed metrics
4. **Email Templates**: Using basic text emails instead of HTML templates

### Scalability Considerations

- **Database Indexing**: Added indexes on frequently queried fields
- **Async Processing**: Celery for non-blocking operations
- **API Pagination**: Implemented for large datasets

### Environment Variables for Production

- Set `DEBUG=False`
- Configure proper database (PostgreSQL recommended)
- Set up proper Redis instance
- Configure email backend for notifications
- Set secure `SECRET_KEY`

## Future Enhancements

1. **Real Payment Integration**: Stripe/PayPal gateway integration
2. **Mobile App**: React Native version
3. **Advanced Analytics**: Detailed reporting and insights
4. **Multi-currency Support**: Handle different currencies
5. **Installment Customization**: Variable amounts and frequencies
6. **Credit Scoring**: Risk assessment for payment plans
7. **Merchant Onboarding**: KYC verification process
8. **Introduction of late fees for overdue payments**: Charging Late fees for those overdue installments
