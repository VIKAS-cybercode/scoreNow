# 🏏 ScoreNow

**ScoreNow** is a full-stack cricket management and live-scoring platform that helps players, teams, organizers, and spectators manage and follow cricket matches in real time.

The platform supports player profiles, team management, tournament organization, match creation, toss and squad selection, ball-by-ball live scoring, detailed scorecards, real-time messaging, match discovery, and live match streaming.

## 🚀 Live Demo

👉 **[Visit ScoreNow](https://scorenow-vflw.onrender.com/)**

---

## 📸 Screenshots

### 🏠 Home

![ScoreNow Home](https://raw.githubusercontent.com/VIKAS-cybercode/scoreNow/master/CNF/public/Images/home.png)

### 🏏 Live Scoring

![Live Scoring](https://raw.githubusercontent.com/VIKAS-cybercode/scoreNow/master/CNF/public/Images/live-scoring.png)

### 🔎 Match & Tournament Discovery

![Match Discovery](https://raw.githubusercontent.com/VIKAS-cybercode/scoreNow/master/CNF/public/Images/match-discovery.png)

### 🪙 Toss & Squad Selection

![Toss and Squad Selection](https://raw.githubusercontent.com/VIKAS-cybercode/scoreNow/master/CNF/public/Images/toss-squad.png)

### 👤 Player Profile

![Player Profile](https://raw.githubusercontent.com/VIKAS-cybercode/scoreNow/master/CNF/public/Images/profile.png)

---

## ✨ Features

### 🏏 Live Match Scoring

- Ball-by-ball cricket scoring
- Runs, boundaries, wides, no-balls, byes, leg-byes, and wickets
- Tracks striker, non-striker, bowler, overs, wickets, and innings
- Stores individual ball events
- Real-time score updates using Socket.IO
- Match-specific Socket.IO rooms

### 📊 Detailed Scorecards

- Batting runs, balls, fours, sixes, and strike rate
- Bowling overs, maidens, runs, wickets, wides, and no-balls
- Economy rate calculation
- Extras
- Fall of wickets
- Persistent innings and player statistics

### 🏆 Tournament Management

- Create and manage cricket tournaments
- Configure tournament name, location, ground, dates, category, format, and ball type
- Add teams to tournaments
- Discover ongoing, upcoming, and completed tournaments

### 👥 Team Management

- Create and manage cricket teams
- Add players to teams
- Assign team roles and captains
- Manage team memberships
- View team information and matches

### 👤 Player Profiles

- Authenticated player profiles
- Player information and location
- Cricket statistics
- Team and match relationships
- Player discovery

### 🪙 Toss & Squad Selection

- Digital toss before a match
- Select toss winner
- Choose batting or bowling
- Select playing squads before the match

### 📺 Live Match Streaming

- Live video streaming using VideoSDK
- Match-specific streaming
- Camera and microphone support
- Live streaming alongside match scoring

### 💬 Real-Time Messaging

- One-to-one messaging
- Group conversations
- Chat requests and approvals
- Persistent messages using PostgreSQL
- Real-time message delivery using Socket.IO

### 🔎 Cricket Community Discovery

Discover:

- Players
- Teams
- Umpires
- Scorers
- Coaches

### 📰 Cricket News

- Cricket news integration through an external news API
- Backend API for retrieving cricket news
- Fallback handling for news availability

---

## 🛠️ Tech Stack

### Frontend

- React.js
- React Router
- Bootstrap
- React Icons
- Socket.IO Client
- Auth0 React SDK

### Backend

- Node.js
- Express.js
- Socket.IO
- REST APIs
- PostgreSQL
- pg-promise

### Authentication

- Auth0

### Real-Time Communication

- Socket.IO
- WebSockets

### Live Streaming

- VideoSDK

### External APIs

- NewsData.io

### Deployment

- Render

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │     React Client    │
                         │                     │
                         │  Players            │
                         │  Teams              │
                         │  Tournaments        │
                         │  Matches            │
                         │  Live Scoring       │
                         │  Chat               │
                         │  Live Streaming     │
                         └──────────┬──────────┘
                                    │
                         REST APIs + Socket.IO
                                    │
                         ┌──────────▼──────────┐
                         │   Node.js + Express │
                         │                     │
                         │ Routes              │
                         │ Controllers         │
                         │ Socket Handler      │
                         └───────┬───────┬─────┘
                                 │       │
                         ┌───────▼──────┐ ┌────▼──────┐
                         │  PostgreSQL  │ │ VideoSDK  │
                         │              │ │ Streaming │
                         │ Players      │ └───────────┘
                         │ Teams        │
                         │ Tournaments  │
                         │ Matches      │
                         │ Ball Events  │
                         │ Chat         │
                         └──────────────┘
````

---

## ⚡ Real-Time Scoring

ScoreNow uses Socket.IO to synchronize live match data between the scorer and connected users.

```text
              Scorer
                 │
                 │ Ball Event
                 ▼
          ┌─────────────┐
          │  Socket.IO  │
          │    Server   │
          └──────┬──────┘
                 │
                 ▼
          ┌─────────────┐
          │ PostgreSQL  │
          │ Ball Events │
          └──────┬──────┘
                 │
                 │ Updated Match State
                 ▼
          ┌─────────────┐
          │ Match Room  │
          │ Socket.IO   │
          └──────┬──────┘
                 │
          ┌──────┴──────┐
          ▼             ▼
      Spectator 1    Spectator 2
```

Each match uses a dedicated Socket.IO room so connected users can receive live scoring updates without refreshing the page.

---

## 🗄️ Database

ScoreNow uses **PostgreSQL** for persistent application data.

The database manages relationships between players, teams, tournaments, matches, innings, ball events, and chat.

### Major Entities

```text
Players
   │
   ├── Team Membership
   ├── Match Participation
   ├── Batting Statistics
   ├── Bowling Statistics
   └── Messages

Teams
   │
   ├── Tournament Membership
   └── Match Participation

Tournaments
   │
   └── Tournament Teams

Matches
   │
   ├── Players
   ├── Ball Events
   ├── Batting Innings
   └── Bowling Innings

Chat
   │
   ├── Direct Messages
   └── Group Messages
```

Ball events contain delivery-level information such as:

* Innings
* Over
* Ball number
* Striker
* Non-striker
* Bowler
* Runs
* Extras
* Wicket information
* Timestamp

---

## 🔐 Authentication

ScoreNow uses **Auth0** for user authentication.

Authenticated users are associated with application-level player records.

```text
Auth0 User
     │
     ▼
Authenticated Identity
     │
     ▼
Player Record
     │
     ├── Teams
     ├── Matches
     ├── Statistics
     └── Messages
```

---

## 📁 Project Structure

```text
scoreNow/
│
├── CNF/                         # React frontend
│   ├── public/
│   │   └── Images/
│   │       ├── home.png
│   │       ├── live-scoring.png
│   │       ├── match-discovery.png
│   │       ├── toss-squad.png
│   │       └── profile.png
│   │
│   └── src/
│       ├── Components/
│       ├── App.js
│       └── ...
│
├── backend/                    # Node.js / Express backend
│   ├── controller/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── socketHandler.js
│
└── README.md
```

---

## ⚙️ Local Development

### Prerequisites

Make sure you have:

* Node.js
* npm
* PostgreSQL
* Auth0 application
* Required API credentials

### 1. Clone the Repository

```bash
git clone https://github.com/VIKAS-cybercode/scoreNow.git
cd scoreNow
```

### 2. Start the Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Start the Frontend

Open another terminal:

```bash
cd CNF
npm install --legacy-peer-deps
npm start
```

---

## 🔑 Environment Variables

Configure the required environment variables for the backend and frontend.

Example:

```env
PORT=3000
DATABASE_URL=your_postgresql_connection_string
NEWSDATA_API_KEY=your_newsdata_api_key
NODE_ENV=development
```

Configure Auth0 using the appropriate application credentials and callback URLs for your environment.

> Never commit private credentials, API keys, or secrets to the repository.

---

## 🌐 Deployment

ScoreNow is deployed on **Render**.

### Live Application

👉 **[https://scorenow-vflw.onrender.com/](https://scorenow-vflw.onrender.com/)**

---

## 🔮 Future Improvements

* Push notifications for live match events
* Advanced tournament standings
* More detailed cricket analytics
* Automated match summaries
* Improved moderation and reporting
* Dedicated mobile application
* More granular roles and permissions for organizers, scorers, and players

---

## 🤝 Collaboration

ScoreNow is a collaborative full-stack project focused on building a real-time cricket management and live-scoring platform.

The project combines real-time scoring, tournament management, team management, live communication, authentication, and live streaming.

---

## ⭐ Explore ScoreNow

Try the live application and explore the complete cricket management and live-scoring experience.

👉 **[🏏 Visit ScoreNow](https://scorenow-vflw.onrender.com/)**

```
