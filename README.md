# Chat App - COMP 3133 Lab Test 1
**Pratik Pokhrel, 101487514**

Real-time chat with Socket.io, Express, and MongoDB.

## Setup (Required before running)

1. **Install dependencies:**
   ```
   npm install
   ```

2. **MongoDB** – choose one:
   - **MongoDB Atlas (recommended):** Create free account at cloud.mongodb.com, get connection string, put it in `.env`
   - **Local MongoDB:** Install and run MongoDB, then use `mongodb://localhost:27017/chat_app`

3. **Create `.env` file** in the project root:
   ```
   MONGODB_URI=mongodb://localhost:27017/chat_app
   ```
   Or use your MongoDB Atlas connection string.

## Run
```
node server.js
```
Open http://localhost:3000
