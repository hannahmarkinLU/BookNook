# 📚 BookNook - Reading Tracker

A modern web application for tracking your reading journey. Save books, track reading progress, write reviews, and manage your personal library.

## ✨ Features

- **🔐 User Authentication** - Secure login and registration
- **📖 Book Search** - Search books using Google Books API
- **📊 Reading Dashboard** - Track reading statistics and progress
- **🏷️ Book Organization** - Categorize books as Wishlist, Reading, or Completed
- **⭐ Ratings & Reviews** - Rate books and write detailed reviews
- **📱 Responsive Design** - Works on mobile, tablet, and desktop
- **🔒 Security** - Input sanitization and validation

## 🚀 Live Demo

[Deployed on Vercel](https://your-vercel-app-url.vercel.app) <!-- UPDATE -->

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Styling**: CSS Modules / Custom CSS
- **API**: Google Books API
- **Testing**: Vitest, React Testing Library
- **Deployment**: Vercel
- **Security**: DOMPurify, Input Validation

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/booknook.git
cd booknook
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Variables

Create a .env in the root directory:

```bash
VITE_GOOGLE_BOOKS_KEY=your_google_books_api_key_here
```

**To get a Google Books API Key:**

1. Go to Google Cloud Console
2. Create a new project or select existing
3. Enable "Google Books API"
4. Go to Credentials → Create Credentials → API Key
5. Copy the key and paste in .env

### Step 4: Run Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment with Vercel

1. Push your code to GitHub
2. Go to vercel.com
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   1. Framework Preset: Vite
   2. Build Command: npm run build
   3. Output Directory: dist
   4. Install Command: npm install
6. Add Environment Variable:
   1. Key: VITE_GOOGLE_BOOKS_KEY
   2. Value: your_google_books_api_key
7. Click "Deploy"

## Security Notes

This project implements the following security measures as required:

- **XSS Protection**: Input sanitization using DOMPurify
- **CSRF Protection**: Input validation and sanitization on all forms
- **Secure Token Storage**: Authentication state persisted in localStorage
- **Environment Variables**: API keys stored in .env files

In a production environment, additional measures would include:

- JWT tokens with HTTP-only cookies
- Proper CSRF tokens
- Rate limiting
- HTTPS enforcement
