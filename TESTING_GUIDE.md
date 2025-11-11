# Testing Guide - Running Multiple User Sessions

## 🎯 Running Mentor and Mentee Windows Simultaneously

### **Method 1: Multiple Browser Windows (Recommended)**

1. **Start your application:**
   ```bash
   # Terminal 1: Start Backend
   cd backend && npm start
   
   # Terminal 2: Start Frontend
   npm run dev
   ```

2. **Open two browser windows:**
   - **Window 1:** Open `http://localhost:8080` (or your frontend port)
   - **Window 2:** Open `http://localhost:8080` in a new window

3. **Login:**
   - **Window 1:** Login as **Mentor** (e.g., `praveen.kr.shukla@jaipur.manipal.edu` / `password123`)
   - **Window 2:** Login as **Mentee** (e.g., `nishant.23fe10cii00012@muj.manipal.edu` / `password123`)

4. **Result:** Both sessions run independently with separate localStorage

---

### **Method 2: Incognito/Private Window**

1. Open normal browser window → Login as Mentor
2. Open Incognito/Private window → Login as Mentee
3. Both sessions work independently

**Chrome/Edge:** `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)  
**Firefox:** `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)  
**Safari:** `Cmd+Shift+N`

---

### **Method 3: Different Browsers**

- **Chrome:** Login as Mentor
- **Firefox/Edge/Safari:** Login as Mentee

Each browser maintains separate localStorage and sessions.

---

### **Method 4: Browser Profiles (Chrome/Edge)**

1. **Create separate profiles:**
   - Chrome: Settings → People → Add person
   - Create "Mentor" profile and "Mentee" profile

2. **Use profiles:**
   - Open Chrome with Mentor profile → Login as Mentor
   - Open Chrome with Mentee profile → Login as Mentee

---

## 🔑 Quick Test Credentials

### **Mentors:**
- `praveen.kr.shukla@jaipur.manipal.edu` / `password123`
- `gl.saini@jaipur.manipal.edu` / `password123`
- `sunil.kumar.d@jaipur.manipal.edu` / `password123`

### **Mentees:**
- `nishant.23fe10cii00012@muj.manipal.edu` / `password123`
- `ANANYA.23FE10CII00132@muj.manipal.edu` / `password123`
- `PRAGATI.23FE10CII00130@muj.manipal.edu` / `password123`

---

## 💡 Tips

1. **Resize windows side-by-side** for easier testing
2. **Use different screen sizes** to test responsive design
3. **Test real-time features** like notifications between sessions
4. **Clear cache** if you encounter issues: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)

---

## 🧪 Testing Scenarios

### **Mentor-Mentee Interaction:**
- ✅ Mentor creates meeting → Mentee sees it
- ✅ Mentee requests session → Mentor sees request
- ✅ Mentor completes meeting → Mentee can view notes
- ✅ Mentor downloads mentee info → PDF downloads

### **Real-time Testing:**
- Test notifications between roles
- Test meeting scheduling and updates
- Test session request workflow

---

## 🚀 Quick Start Commands

```bash
# Start Backend (Terminal 1)
cd backend && npm start

# Start Frontend (Terminal 2)
npm run dev

# Then open browser twice:
# 1. http://localhost:8080 → Login as Mentor
# 2. http://localhost:8080 → Login as Mentee (new window/tab)
```

---

**Note:** Each browser window/tab maintains its own localStorage, so you can have multiple user sessions active simultaneously!

