# LuxeLane - Backend

**LuxeLane** is a fully-featured backend for a modern online clothing store, built with scalability, security, and performance in mind. This project powers the core logic, APIs, authentication, and business operations behind LuxeLane’s e-commerce platform.

## Features

- **User Authentication & Authorization**
  - JWT-based auth with refresh tokens
  - Role-based access control (`Admin`, `Seller`, `User`)
  - Secure password hashing

- **Product Management**
  - CRUD operations for products
  - Image upload support
  - Category and brand associations

- **User Management**
  - View, edit, and delete users (Admin access)
  - User profile and account settings

- **Order Management**
  - Cart, checkout, and order processing
  - Order history and order status updates

- **Category & Brand Management**
  - Admin-level control over product organization

- **RESTful API Design**
  - Clean and scalable API architecture
  - Pagination, search, and filtering support

- **Security**
  - Rate limiting
  - Helmet, CORS, and input sanitization
  - Environment-based config management

## Tech Stack

- **Node.js** + **Express.js**
- **MongoDB** + **Mongoose**
- **JWT** for authentication
- **Multer** for image uploads
- **dotenv**, **helmet**, **cors**, **bcrypt**, etc.

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/mahmoudmaherofficial/luxelane-backend.git
   cd luxelane-backend
   
