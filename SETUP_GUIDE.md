# QuizMaster Frontend Setup Guide for Teammates

## 📋 Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager
- Git

## 🚀 Step-by-Step Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/RauanZholaman/QuizMaster.git
cd QuizMaster/quizmaster-frontend
```

### 2. Install Dependencies
The project includes all necessary dependencies in `package.json`, including the Google Generative AI package.

```bash
npm install
```

**Note**: This will automatically install:
- `@google/generative-ai` (for AI question generation)
- `firebase` (for backend integration)
- `react-router-dom` (for navigation)
- `react-icons` (for UI icons)
- All other React dependencies

### 3. Environment Setup
The project requires environment variables for API keys.

#### 3.1 Create Environment File
```bash
# Copy the example environment file
cp .env.example .env
```

#### 3.2 Configure API Keys
Open `.env` file and add your API keys:

```bash
# Gemini AI API Key (Required for AI question generation)
REACT_APP_GEMINI_API_KEY=your_actual_gemini_api_key_here

# Firebase Configuration (if using Firebase features)
# REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
# REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
# REACT_APP_FIREBASE_PROJECT_ID=your_project_id
```

### 4. Get Gemini AI API Key (Optional - for AI features)
**Note**: The AI features are currently disabled and use sample questions. You can skip this step for now.

If you want to enable AI features later:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Paste it in your `.env` file as `REACT_APP_GEMINI_API_KEY`

### 5. Start the Development Server
```bash
npm start
```

The application will open in your browser at `http://localhost:3000`

## 🔧 Troubleshooting Common Issues

### Issue 1: "Module not found" errors
**Solution**: Make sure you ran `npm install` in the `quizmaster-frontend` directory
```bash
cd quizmaster-frontend
npm install
```

### Issue 2: PowerShell execution policy errors (Windows)
**Solution**: Use cmd instead of PowerShell
```cmd
cmd /c "npm start"
```

### Issue 3: Port 3000 already in use
**Solution**: Kill the existing process or use a different port
```bash
# Kill existing process
npx kill-port 3000

# Or start on different port
set PORT=3001 && npm start
```

### Issue 4: ESLint warnings about unused variables
**Solution**: These are just warnings and don't affect functionality. The app will still work perfectly.

## 📁 Project Structure
```
quizmaster-frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── QuizForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Main application pages
│   │   ├── CreateQuiz.jsx  # Quiz creation with auto-generation
│   │   ├── AutoGenerate.jsx # Standalone auto-generation
│   │   └── ...
│   ├── services/           # API and external service integrations
│   │   └── geminiService.js # AI question generation service
│   └── ...
├── .env                    # Environment variables (create this)
├── .env.example           # Environment template
└── package.json           # Dependencies and scripts
```

## 🎯 Testing the Auto-Generation Feature

1. **Navigate to "Create Quiz" page**
2. **Find the Auto-Generation section**
3. **Test different scenarios**:
   - Select question type (MCQ, True/False, Short Answer, Fill Blank)
   - Choose number of questions (1-20)
   - Click "Generate Questions"
4. **Expected behavior**:
   - Should generate exactly the number requested
   - Questions should be realistic and educational
   - Should work without AI (using sample questions)

## 🤝 For Development Team

### Current Status
- ✅ **Sample Question Generation**: Fully working with 40+ realistic questions
- ✅ **Dynamic Count**: Generates exact number of questions requested
- ✅ **All Question Types**: MCQ, True/False, Short Answer, Fill Blank
- ⏸️ **AI Integration**: Temporarily disabled (ready to enable when needed)

### AI Integration Notes
The AI integration is ready but commented out in `geminiService.js`. To enable:
1. Uncomment the AI code in `generateQuestions()` function
2. Add proper error handling
3. Test with your Gemini API key

### Dependencies Installed
All required packages are already in `package.json`:
- `@google/generative-ai`: "^0.24.1"
- `firebase`: "^12.4.0"
- `react-router-dom`: "^7.9.4"
- `react-icons`: "^5.5.0"

## 📞 Need Help?
If you encounter any issues:
1. Check that you're in the `quizmaster-frontend` directory
2. Ensure `npm install` completed successfully
3. Verify your `.env` file exists (copy from `.env.example`)
4. Try clearing npm cache: `npm cache clean --force`
5. Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

---

**Last Updated**: October 27, 2025
**Version**: 1.0
**Status**: Ready for development team use