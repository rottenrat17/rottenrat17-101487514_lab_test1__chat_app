# Chat App

Pratik Pokhrel - 101487514  
COMP 3133 Lab Test 1

## What it does

Real-time chat app with signup, login, and room-based messaging. You sign up with username and password, log in, then pick a room from the list (or create your own) and chat. Messages are stored in MongoDB. There's a typing indicator when someone is typing, and you can leave the room or logout whenever.

## How to run

1. `npm install`
2. Copy `.env.example` to `.env` and put your MongoDB connection string in there (Atlas or local)
3. `node server.js` or `npm start`
4. Go to http://localhost:3000

That's it. You'll land on the login page - sign up if you don't have an account, then login and join a room to start chatting.
