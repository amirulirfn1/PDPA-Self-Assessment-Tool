# PDPA Self Assessment Tool

A comprehensive self-assessment tool for PDPA (Personal Data Protection Act) compliance, designed specifically for Malaysian businesses and organizations.

## 🚀 Features

- **PDPA Compliance Assessment**: Comprehensive questionnaire covering all 7 PDPA principles
- **User Authentication**: Secure Firebase Authentication with MFA support
- **Admin Dashboard**: Complete admin interface for managing users and assessments
- **Real-time Feedback**: Instant validation and error handling
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Progress Tracking**: Visual progress indicators and completion tracking
- **Export Results**: Download assessment results and reports

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (SCSS), JavaScript (ES6+)
- **Build Tool**: Webpack 5 with code splitting and optimization
- **Backend**: Firebase (Authentication, Firestore, Hosting)
- **UI Framework**: Bootstrap 5 with custom components
- **Icons**: Bootstrap Icons, Remix Icons, Boxicons
- **Animations**: AOS (Animate On Scroll), Swiper.js

## 📋 Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Firebase CLI (for deployment)
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/pdpa-self-assessment-tool.git
cd pdpa-self-assessment-tool
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the environment template and configure your Firebase project:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
FIREBASE_APP_ID=your_app_id
FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Application Configuration
NODE_ENV=development
APP_NAME=PDPA Self Assessment Tool
APP_VERSION=1.0.0
```

### 4. Development

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

### 6. Deploy to Firebase

```bash
npm run firebase:deploy
```

## 📁 Project Structure

```
pdpa-self-assessment-tool/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Header.js       # Navigation header
│   │   └── Loading.js      # Loading states
│   ├── shared/
│   │   ├── config/
│   │   │   └── firebase.js # Firebase configuration
│   │   └── services/
│   │       ├── errorHandler.js # Error management
│   │       └── validation.js   # Form validation
│   ├── html/               # HTML templates
│   ├── js/                 # Page-specific JavaScript
│   ├── scss/               # Stylesheets
│   ├── forms/              # Form templates
│   └── img/                # Images and assets
├── functions/              # Firebase Cloud Functions
├── dist/                   # Build output (generated)
├── public/                 # Static assets
├── .env.example           # Environment template
├── .env.local             # Local environment
├── .env.production        # Production environment
├── webpack.config.js      # Webpack configuration
├── firebase.json          # Firebase configuration
└── package.json           # Dependencies and scripts
```

## 🎯 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run start` - Start production server
- `npm run clean` - Clean build directory
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run analyze` - Analyze bundle size
- `npm run firebase:deploy` - Deploy to Firebase
- `npm run firebase:serve` - Serve Firebase locally

## 🔧 Configuration

### Webpack Configuration

The project uses Webpack 5 with the following features:

- **Code Splitting**: Automatic vendor and common chunk splitting
- **Environment Variables**: Support for different environments
- **Hot Reload**: Development server with hot module replacement
- **Asset Optimization**: Image and font optimization
- **Source Maps**: Development source maps for debugging

### Firebase Configuration

The Firebase configuration is centralized in `src/shared/config/firebase.js` and supports:

- **Environment Variables**: Secure API key management
- **Multiple Environments**: Development, staging, and production
- **Error Handling**: Comprehensive error management
- **Validation**: Environment variable validation

## 🎨 Styling

The project uses SCSS with the following structure:

- `_variables.scss` - Global variables and colors
- `_general.scss` - General styles and utilities
- `_header.scss` - Header and navigation styles
- `_nav.scss` - Navigation component styles
- `_hero.scss` - Hero section styles
- `_sections.scss` - Page section styles
- `_footer.scss` - Footer styles

## 🔒 Security Features

- **Environment Variables**: API keys stored securely
- **Input Validation**: Comprehensive form validation
- **Error Handling**: Centralized error management
- **Authentication**: Firebase Auth with MFA support
- **CORS Headers**: Proper cross-origin resource sharing
- **Content Security**: X-Content-Type-Options headers

## 📱 Responsive Design

The application is built with a mobile-first approach using Bootstrap 5:

- **Breakpoints**: xs, sm, md, lg, xl, xxl
- **Grid System**: 12-column responsive grid
- **Components**: Responsive navigation, forms, and tables
- **Typography**: Scalable typography system

## 🧪 Testing

To run tests:

```bash
npm run test
```

For continuous testing during development:

```bash
npm run test:watch
```

## 📊 Performance Optimization

- **Code Splitting**: Automatic vendor and common chunk splitting
- **Lazy Loading**: Dynamic imports for better performance
- **Asset Optimization**: Compressed images and fonts
- **Caching**: Proper cache headers for static assets
- **Bundle Analysis**: Webpack bundle analyzer integration

## 🚀 Deployment

### Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase (if not already done):
   ```bash
   firebase init
   ```

4. Deploy:
   ```bash
   npm run firebase:deploy
   ```

### Environment-Specific Deployment

- **Development**: `npm run build:dev && firebase deploy`
- **Production**: `npm run build && firebase deploy`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation

## 🔄 Changelog

### Version 1.0.0
- Initial release
- PDPA assessment functionality
- User authentication system
- Admin dashboard
- Responsive design
- Error handling and validation

## 🙏 Acknowledgments

- UTM (Universiti Teknologi Malaysia) for project support
- Firebase team for the excellent platform
- Bootstrap team for the UI framework
- All contributors and testers

---

**Note**: This is a production-ready application with comprehensive security, performance, and user experience features. Make sure to configure your environment variables properly before deployment.
