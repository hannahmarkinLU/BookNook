# 📚 BookNook - Reading Tracker

A modern web application for tracking your reading journey. Save books, track reading progress, write reviews, and manage your personal library.

**Important**: This is a frontend-only demo application. User data is stored temporarily in your browser's localStorage and will be lost if you clear your browser data. No backend server or database is used.

## 📝 Project Description & Problem Statement

### The Problem

Book lovers often struggle to keep track of what they've read, want to read, and their thoughts about books. Physical lists get lost, and existing solutions are often over-complicated or require paid subscriptions.

### The Solution

BookNook provides a simple, intuitive way to:

- 📚 Maintain a personal digital library
- 🔍 Discover new books through the Google Books API
- 📊 Track reading progress with visual statistics
- ✍️ Store personal reviews and ratings
- 🏷️ Organize books into Wishlist, Reading, or Completed categories

### Target Users

- Avid readers who want to track their reading
- Book club members organizing discussions
- Students managing academic reading lists
- Anyone who wants to remember what they thought about books they've read

## ✨ Features

- **🔐 User Authentication** - Secure login and registration with form validation
- **📖 Book Search** - Search millions of books using Google Books API
- **📊 Reading Dashboard** - Track reading statistics and progress with visual indicators
- **🏷️ Book Organization** - Categorize books as Wishlist, Reading, or Completed
- **⭐ Ratings & Reviews** - Rate books and write detailed reviews with rich text
- **📱 Responsive Design** - Optimized for mobile, tablet, and desktop views
- **🔒 Security** - Input sanitization, validation, and CSRF protection
- **🔄 State Management** - Persistent user sessions with React Context

## 🛠️ Technology Stack

### Frontend Core

- **React 18** - UI library with hooks and functional components
- **Vite** - Build tool and development server
- **React Router DOM v6** - Client-side routing and navigation

### State Management

- **React Context API** - Global state for authentication and books
- **LocalStorage** - Client-side data persistence
- **Custom Hooks** - Reusable logic for forms and data fetching

### Styling

- **CSS Modules / Custom CSS** - Component-scoped styling
- **CSS Variables** - Theming and consistent design tokens
- **Mobile-first responsive design** - Adaptive layouts for all devices

### API Integration

- **Google Books API** - Book search and metadata retrieval
- **Fetch API** - Asynchronous data fetching with error handling

### Testing

- **Vitest** - Unit testing framework
- **React Testing Library** - Component testing
- **JSDOM** - Browser environment simulation
- **Coverage Reports** - Test coverage analysis

### Security

- **DOMPurify** - XSS protection through input sanitization
- **CSRF Tokens** - Form submission validation
- **Input Validation** - Client-side validation for all forms

### Deployment

- **Vercel** - Hosting and continuous deployment
- **Environment Variables** - Secure API key management

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Git** - Version control

## 📋 Prerequisites

- Node.js 18.0 or higher
- npm 8.0 or higher
- Google Cloud account (for API key)
- Git

## 🔧 Installation & Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/booknook.git
cd booknook
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a .env in the root directory:

```bash
VITE_GOOGLE_BOOKS_KEY=your_google_books_api_key_here
VITE_APP_ENV=development
```

### Step 4: Get Google Books API Key

1. Go to Google Cloud Console
2. Create a new project or select existing
3. Navigate to "Library" and search for "Google Books API"
4. Enable the API
5. Go to "Credentials" → "Create Credentials" → "API Key"
6. Copy the generated key
7. (Optional) Restrict the key to Google Books API for security

### Step 5: Start Development Server

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## 🔐 Authentication System Documentation

### Overview

BookNook uses a simulated authentication system for demonstration purposes. User credentials are stored locally in the browser's localStorage.

### Authentication Flow

1. **Registration** (`/register`)
   - Username validation (3-20 chars, alphanumeric + \_ -)
   - Email validation
   - Password strength requirements (8+ chars, uppercase, lowercase, number)
   - Password confirmation matching
   - Automatic login after successful registration

2. **Login** (`/login`)
   - Username or email accepted
   - Password verification
   - Redirect to originally requested page or dashboard
   - Session persistence across browser restarts

3. **Logout**
   - Clears user session
   - Removes authentication token from localStorage
   - Redirects to login page

4. **Protected Routes**
   - Routes wrapped in `<ProtectedRoute>` component
   - Automatic redirect to login if unauthenticated
   - Preserves intended destination for post-login redirect

### Security Measures

- **XSS Protection**: All user inputs sanitized with DOMPurify
- **CSRF Protection**: Hidden tokens in all forms with validation
- **Input Validation**: Client-side validation for all form fields
- **Secure Storage**: Authentication state in localStorage (as per project requirements)

## 📡 API Integration Documentation

### Google Books API

#### Endpoint

```bash
GET https://www.googleapis.com/books/v1/volumes
```

#### Parameters

| Parameter    | Type   | Description                        |
| ------------ | ------ | ---------------------------------- |
| `q`          | string | Search query (title, author, ISBN) |
| `maxResults` | number | Maximum results (default: 20)      |
| `key`        | string | API key from environment           |

#### Example Request

```javascript
const response = await fetch(
  `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20&key=${API_KEY}`,
);
```

#### Response Structure

```javascript
{
  items: [
    {
      id: "unique-book-id",
      volumeInfo: {
        title: "Book Title",
        authors: ["Author Name"],
        description: "Book description",
        imageLinks: {
          thumbnail: "https://...",
          smallThumbnail: "https://...",
        },
        publishedDate: "2024",
        pageCount: 320,
      },
    },
  ];
}
```

#### Data Flow

1. User enters search query
2. Frontend sends request to Google Books API
3. Results are displayed with expandable descriptions
4. User selects book and status
5. Book saved to localStorage with user's metadata (status, rating, review)

## 🧪 Testing

### Test Suite Overview

The project includes comprehensive tests covering all major functionality.

### Running Tests

| **Command**           | **Description**                |
| --------------------- | ------------------------------ |
| npm test              | Run all tests                  |
| npm run test:watch    | Run tests in watch mode        |
| npm run test:coverage | Run tests with coverage report |

### Key Test Scenarios

- ✅ User authentication (login, register, logout)
- ✅ Protected route access
- ✅ Book search and save functionality
- ✅ Form validation and error handling
- ✅ Data persistence across sessions
- ✅ Responsive design behavior
- ✅ Security measures (XSS, CSRF)

## 🌐 Deployment

### Deploy to Vercel

#### Step 1: Prepare for Deployment

1. Ensure all environment variables are documented
2. Build the project locally to verify:

```bash
npm run build
```

#### Step 2: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
```

#### Step 3: Deploy via Vercel Dashboard

1. Push code to GitHub repository
2. Visit vercel.com
3. Click "Add New" → "Project"
4. Import your GitHub repository
5. Configure build settings:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
6. Add environment variables:
   - `VITE_GOOGLE_BOOKS_KEY`: your_api_key_here
   - `VITE_APP_ENV`: production
7. Click "Deploy"

### Environment Configuration

#### Development (.env)

```bash
VITE_GOOGLE_BOOKS_KEY=your_dev_key
VITE_APP_ENV=development
```

#### Production (Vercel)

```bash
VITE_GOOGLE_BOOKS_KEY=your_production_key
VITE_APP_ENV=production
```

## ⚠️ Known Issues & Limitations

### Current Limitations

1. **No Backend**
   - User data is stored in browser localStorage
   - Data cannot be accessed across devices
   - Clearing browser data removes all books and reviews
2. **Simulated Authentication**
   - Passwords are stored in plaintext (for demo only)
   - No email verification
   - No password recovery
3. **API Limitations**
   - Google Books API has rate limits
   - Some books may have incomplete metadata
   - Cover images are low resolution
   - Cover images may be missing for some titles
4. **Browser Compatibillity**
   - Requires modern browser with JavaScript enabled
   - LocalStorage must be enabled
   - Not tested on Internet Explorer

### Browser Data Warning

All data is stored locally in your browser. If you:

- Clear your browser history/cache
- Use private/incognito mode
- Switch to a different browser
- Use a different device
  **Your books and reviews will not be available**

## 🤝 Contributing

This is a class project and is not accepting contributions. Feel free to fork for your own learning purposes.

## 📄 License

This project is created for educational purposes as part of a frontend development course.
