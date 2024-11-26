# VRV Backend Assignment

This project demonstrates an authentication and authorization system with Role-Based Access Control (RBAC) using Node.js, Express, TypeScript, and MongoDB. The system includes features such as user registration, login, email verification, and password reset.

## Features

- User registration with email verification
- User login with JWT authentication
- Password reset functionality
- Role-Based Access Control (RBAC) with roles: Admin, User, Moderator
- Containerized with Docker

## Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/vrv-backend-assignment.
    ```

2. Create a [.env] file in the root directory and add the following environment variables:

    ```env
    MONGO_URI=mongodb://mongo:27017/vrvbackendassignment
    JWT_SECRET=your_jwt_secret
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    CLIENT_URL=http://localhost:3000
    ```

3. Build and run the Docker containers:

    ```bash
    docker-compose up --build
    ```

The application will be available at `http://localhost:5000`.

API Endpoints
POST /api/auth/register: Register a new user
POST /api/auth/login: Login a user
GET /api/auth/verify-email: Verify user email
POST /api/auth/reset-password: Request password reset
POST /api/auth/update-password: Update password
GET /api/users/me: Get current user details (requires authentication)