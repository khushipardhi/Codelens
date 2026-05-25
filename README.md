<<<<<<< HEAD
# CodeLens — Understand Errors. Build Confidence.

> An AI-powered, beginner-friendly coding assistant that turns cryptic error messages into clear, encouraging explanations.

[![Vite](https://img.shields.io/badge/Built%20with-Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](./LICENSE)

---

## What is CodeLens?

CodeLens is a human-centered debugging tool designed for students, beginners, and developers who want to **understand** their errors — not just fix them.

It automatically detects your programming language, analyzes syntax and logic issues, and explains each error in plain language with actionable fixes.

**Works 100% offline by default.** AI-powered mode is optional and requires a free [Nvidia API key](https://build.nvidia.com/).

---

## Features

| Feature | Description |
|---|---|
| 🔍 Language Detection | Automatically detects Python, JS, Java, C++, Go, Rust, and 10 more |
| 📊 Confidence Score | Shows detection confidence % so you always know how certain it is |
| 🧠 AI Analysis | Deep explanations powered by Nvidia NIM (Llama 3.1 8B) |
| ⚡ Offline Mode | Pattern-based analysis works without any API key |
| 🎓 Adaptive Learning | Adjusts explanation depth based on your skill level |
| 🔄 Progressive Disclosure | Shows more detail as you re-analyze the same code |
| 💬 Chat Assistant | Ask follow-up questions about your code |
| 🌙 Dark / Light Theme | Both modes fully supported |
| 📱 Responsive | Works on desktop, tablet, and mobile |
| ♿ Accessible | ARIA labels, keyboard navigation, reduced-motion support |

---

## Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/codelens.git
cd codelens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and optionally add your Nvidia API key to enable AI mode. **The app works fully without a key** in Offline mode.

### 4. Start the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_NVIDIA_API_KEY` | Optional | Your Nvidia NIM API key |
| `VITE_NVIDIA_BASE_URL` | Optional | API base URL (default shown in .env.example) |
| `VITE_NVIDIA_MODEL` | Optional | Model ID (default: Llama 3.1 8B Instruct) |

> **Security note**: These variables are embedded into the browser bundle at build time. For production, route API calls through a backend proxy and never expose your key in the frontend build.

---

## Supported Languages

| Language | Icon | Monaco ID |
|---|---|---|
| Python | 🐍 | `python` |
| JavaScript | ⚡ | `javascript` |
| TypeScript | 🔷 | `typescript` |
| Java | ☕ | `java` |
| C++ | ⚙️ | `cpp` |
| C | 🔧 | `c` |
| HTML | 🌐 | `html` |
| CSS | 🎨 | `css` |
| Go | 🐹 | `go` |
| Rust | 🦀 | `rust` |
| PHP | 🐘 | `php` |
| SQL | 🗃️ | `sql` |
| Bash | 🖥️ | `shell` |

---

## Project Structure

```
codelens/
├── src/
│   ├── components/
│   │   ├── AboutCodeLens/       # Philosophy / about page
│   │   ├── ChatAssistant/       # Floating AI chat panel
│   │   ├── CodeEditor/          # Monaco editor wrapper
│   │   ├── ConceptHelp/         # Concept explanation modal
│   │   ├── ExplanationPanel/    # Error analysis results
│   │   ├── Navbar/              # Top navigation bar
│   │   ├── SettingsModal/       # Settings panel
│   │   ├── SkillIndicator/      # Learning progress badge
│   │   └── ToneSelector/        # Explanation style dropdown
│   ├── hooks/
│   │   └── useSettings.js       # Settings + history persistence
│   ├── services/
│   │   ├── adaptiveEngine.js    # Skill detection & adaptive learning
│   │   ├── aiService.js         # AI orchestration + response normalization
│   │   ├── conceptHelp.js       # Concept explanation database
│   │   ├── languageDetector.js  # Pattern-based language detection
│   │   └── providers/
│   │       ├── nvidia.js        # Nvidia NIM API provider
│   │       ├── offline.js       # Local pattern analysis
│   │       └── futureProviders.js
│   ├── App.jsx                  # Root component
│   ├── App.css                  # Layout styles
│   ├── index.css                # Design system tokens
│   └── main.jsx                 # Entry point
├── .env.example                 # Environment variable template
├── index.html                   # HTML shell
├── package.json
└── vite.config.js
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (hot reload) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

---

## AI Mode Setup

1. Go to [https://build.nvidia.com/](https://build.nvidia.com/) and create a free account.
2. Generate an API key from the Nvidia NIM catalog.
3. Add it to your `.env` file as `VITE_NVIDIA_API_KEY`.
4. In the app, open **Settings** and switch **Analysis Mode** to **AI-powered**.

The default model is **Llama 3.1 8B Instruct** — fast, capable, and free under Nvidia's trial tier.

---

## Contributing

Contributions are welcome! Please:

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Write clean, documented code
4. Open a pull request with a clear description

### Code Style

- Components: PascalCase files, default exports
- Utilities/services: camelCase, named exports
- CSS: BEM-inspired class names, use design tokens from `index.css`
- No external CSS frameworks — vanilla CSS only

---

## License

MIT © CodeLens Contributors
=======
# Codelens
>>>>>>> 8eee63e2256cc8ca54207e423d0b41c8349114d5
