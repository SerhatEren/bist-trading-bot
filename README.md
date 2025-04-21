# BIST Trading Bot

A React-based dashboard for monitoring and analyzing BIST (Borsa Istanbul) stock trading activities. This application provides real-time market data visualization, portfolio management, and trading analytics.

## Features

- Real-time BIST-30 stock monitoring
- Portfolio performance tracking
- Asset allocation visualization
- Trading history and analytics
- Interactive charts and statistics
- Responsive dashboard design

## Tech Stack

- React 18
- TypeScript
- React Router for navigation
- Modern CSS with Flexbox/Grid
- Vite for build tooling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/SerhatEren/bist-trading-bot.git
```

2. Install dependencies
```bash
cd bist-trading-bot
npm install
```

3. Start the development server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure
src/
├── components/ # React components
├── services/ # API services
├── styles/ # CSS styles
├── pages/ # Page components
└── App.tsx # Main application component

## Authentication

The application implements a JWT-based authentication system:

### Server-side authentication:

- Uses two middleware implementations: `auth.middleware.ts` and `auth-middleware.ts`
- Secures routes requiring authentication by checking JWT tokens from the Authorization header
- Provides role-based access control through middleware functions
- Supports user registration and login via `/auth/register` and `/auth/login` endpoints

### Client-side authentication:

- Implements a centralized `AuthContext` to manage authentication state
- Uses localStorage to persist JWT tokens and user information
- Provides protected routes that redirect unauthenticated users to the login page
- Includes login and registration forms with validation
- Automatically adds auth tokens to all API requests

### Authentication Flow:

1. User registers or logs in, receiving a JWT token
2. Token is stored in localStorage and added to all API requests
3. Protected routes check for authentication and redirect if needed
4. Server middleware validates tokens for protected API endpoints

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.