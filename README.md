# Loan Management System (LMS)

A full-stack web application for managing loan applications and approvals with role-based access for customers and administrators.

## Features

**Customer Portal**: Loan applications, profile management, EMI calculator

**Admin Dashboard**: Loan management, customer analytics, system settings

**Secure Authentication**: JWT-based authentication with role-based access

## Tech Stack:

**Frontend**: HTML5, CSS3, JavaScript, Chart.js
**Backend**: Node.js, Express.js, MySQL, JWT, bcryptjs

## Database Tables

### Core Tables

- **users** - Customer and admin accounts with role-based access
- **loans** - Loan applications with status tracking and EMI calculations
- **system_settings** - Configurable loan parameters and limits
- **notifications** - In-app messaging and status updates

## Quick Start:

1. Clone the repo
2.  Install backend dependencies: cd backend && npm install
3. Setup database and environment variables
4. Run: npm start
5. Open frontend/index.html in browser

##  Default Admin Login:

**Email**: admin@loanapp.com
**Password**: ******

**Security**:bcryptjs - Password hashing and security

## API Endpoints:

### Authentication

POST /api/auth/register - User registration

POST /api/auth/login - User login

POST /api/auth/admin-login - Admin login

GET /api/auth/me - Get current user

POST /api/auth/logout - Logout

### Customer Routes

GET /api/customer/profile - Get profile

PUT /api/customer/profile - Update profile

GET /api/customer/loans - Get user loans

POST /api/customer/loans - Apply for loan

GET /api/customer/loans/:id - Get loan details

GET /api/customer/stats - Get customer statistics

### Admin Routes

GET /api/admin/dashboard-stats - Dashboard statistics

GET /api/admin/analytics - Analytics data

GET /api/admin/loans - Get all loans

GET /api/admin/loans/:id - Get loan details

PUT /api/admin/loans/:id - Update loan status

GET /api/admin/customers - Get all customers

GET /api/admin/customers/:id - Get customer details

GET /api/admin/users - User management

PUT /api/admin/profile - Update admin profile

GET /api/admin/settings - System settings

###  Loan Routes

POST /api/loans/calculate-emi - Calculate EMI

POST /api/loans/submitLoan - Submit loan application

GET /api/loans/:id - Get loan details

## Future Enhancements:

Email notifications for loan status updates

Document upload and verification system

Advanced analytics and reporting features

Payment integration for EMI tracking

Multi-level approval workflows

## Learning Outcomes

Full-stack development with modern web technologies

RESTful API design and implementation

Database design and SQL optimization

Authentication and authorization systems

Role-based access control implementation

