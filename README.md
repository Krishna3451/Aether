# Aether Advisor

<img src="https://github.com/user-attachments/assets/920daec7-0693-4bdb-8c8d-f7a4b7ec8c81" alt="Aether Advisor Logo" width="50" height="50">

Aether Advisor is your **AI-powered financial strategist**.  
It helps clients clarify goals, analyze scenarios, and plan wealth-building steps with compliant, easy-to-action guidance.



## 🚀 Features

### 💬 Advisory-Grade Conversations
- Expert financial guidance powered by Google Gemini
- Built-in system prompt for compliant, professional tone
- Clarifying questions to capture goals, timelines, and risk tolerance
- Real-time loading indicator and responsive chat layout

### 📊 Planning Tools
- **Scenario Tables**: Compare budgets, allocations, and projections
- **Markdown Summaries**: Present key takeaways and next steps
- **Formulas & Calculations**: Show math in context with fenced code blocks
- **Document Attachments**: Upload statements and plans for AI context (PDF parsing included)

### 🎙 Interaction Enhancements
- **Text-to-Speech**: Listen to advisor recommendations on the go
- **Voice-to-Text**: Capture client narratives hands-free
- **Copy to Clipboard**: Share action plans with clients quickly
- **Feedback Buttons**: Gather quality insights from each response

### 🗂 Engagement Management
- Persisted chat history stored in Supabase
- Instant search across client conversations
- Rename, archive, or delete engagements
- Responsive sidebar optimized for advisory workflows

### 🔒 Authentication
- Secure login/logout with Supabase Auth and role-aware policies


## 📸 Screenshots

<!-- Replace with actual images -->
<!--
<img width="1446" height="901" alt="Screenshot 2025-08-10 at 7 58 20 PM" src="https://github.com/user-attachments/assets/3461154f-636d-46d4-a200-09d08d262411" />
 <img width="1446" height="901" alt="Screenshot 2025-08-10 at 7 57 54 PM" src="https://github.com/user-attachments/assets/35030668-b1ee-4358-be3e-63e938cb7f09" /> -->

<img width="1446" height="901" alt="Portfolio Planning View" src="https://github.com/user-attachments/assets/cc4b15b4-d26c-42d6-9354-e95d3ae7848c" />
<img width="1446" height="901" alt="Client Summary Brief" src="https://github.com/user-attachments/assets/4cc70ee6-2785-4d26-a291-10b889907c52" />


## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Shadcn UI
- **AI**: Google's Generative AI (Gemini) tuned for fiduciary-grade prompts
- **Database & Auth**: Supabase
- **Voice**: Deepgram for transcription and synthesis
- **Compliance**: Configurable system prompts and audit-friendly chat logs
- **Payments**: Stripe Integration (Coming Soon)
- **Deployment**: Vercel

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account for database
- Google AI API key
- (Optional) Stripe account for payments

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/Shreyas-29/aether.git
   cd aether
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Update the environment variables in .env.local
   ```
   - `GOOGLE_GENERATIVE_AI_API_KEY` for Gemini access  
   - `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Supabase  
   - Optional: `DEEPGRAM_API_KEY`, `STRIPE_SECRET_KEY`

4. Run the development server
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Roadmap

- [ ] AI Streaming Responses with compliance reminders
- [ ] Monte Carlo simulations for retirement planning
- [ ] Regulatory audit log exports
- [ ] Premium advisory tiers via Stripe
- [ ] Real-time voice consultations
- [ ] Expanded document ingestion (CSV, XLSX, OFX)



## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

