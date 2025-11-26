# 🚀 Quick Setup for Teammates

## Essential Steps (5 minutes)
```bash
# 1. Clone and navigate
git clone https://github.com/RauanZholaman/QuizMaster.git
cd QuizMaster/quizmaster-frontend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# 4. Start the app
npm start
```

## That's it! 🎉
- App opens at `http://localhost:3000`
- Auto-generation works with sample questions (no API key needed)
- AI features are disabled for now (will be enabled later)

## If you get errors:
- **Windows PowerShell issues**: Use `cmd /c "npm start"` instead
- **Module not found**: Make sure you ran `npm install`
- **Port 3000 busy**: Kill other React apps or use `set PORT=3001 && npm start`

---
📖 **Full setup guide**: See `SETUP_GUIDE.md` for detailed instructions