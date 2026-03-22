<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FinAI Strategic Advisor

Elite AI financial consultancy powered by Gemini 3 Pro.

## 🚀 Quick Start (Docker)

The easiest way to get started is using Docker.

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd fin-ai-strategic
   ```

2. **Setup environment variables:**
   Copy `.env.example` to `.env` and add your `GEMINI_API_KEY`.
   ```bash
   cp .env.example .env
   ```

3. **Run with Docker Compose:**
   ```bash
   docker compose up -d
   ```
   The app will be available at [http://localhost:3000](http://localhost:3000).

---

## 💻 Manual Local Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup environment variables:**
   Create a `.env` file (or `.env.local`) and add your `GEMINI_API_KEY`.
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Your Google Gemini API Key. Get it from [Google AI Studio](https://aistudio.google.com/app/apikey). |

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite
- **AI:** Google Generative AI (Gemini 3 Pro)
- **Styling:** Vanilla CSS (Modern aesthetic)
- **Icons:** Lucide React
- **Charts:** Recharts
