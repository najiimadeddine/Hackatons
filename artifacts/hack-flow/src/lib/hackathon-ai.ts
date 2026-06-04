export interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

const KB: { patterns: RegExp[]; response: () => string }[] = [
  {
    patterns: [/project idea/i, /what (to|should) build/i, /hackathon idea/i, /app idea/i, /idée/i],
    response: () => `## 🚀 Top Hackathon Project Ideas for 2025

Here are **5 high-impact ideas** that combine innovation with real-world value:

### 1. AI Mental Health Companion
A personalized wellness app using NLP to detect burnout patterns among students/developers. Integrates mood tracking, breathing exercises, and peer support.
- **Stack:** React Native, Python (FastAPI), HuggingFace Transformers
- **Impact:** Mental health crisis is #1 issue in tech communities
- **Wow factor:** Real-time emotion detection from text

### 2. Carbon Footprint Optimizer
Scans a company's codebase to estimate the CO₂ of each API call, DB query, and deployment. Suggests greener alternatives automatically.
- **Stack:** TypeScript, Node.js, Vercel, CO₂.js
- **Impact:** Climate tech is a top investment theme in 2025
- **Wow factor:** "Your PR saves 2.3kg of CO₂"

### 3. Community Emergency Network
Hyper-local crisis coordination app that routes help requests to vetted volunteers in <2 minutes during disasters or urgent situations.
- **Stack:** React, Supabase Realtime, Mapbox, Twilio
- **Impact:** Disaster relief, proven market need
- **Wow factor:** Live map with real-time request routing

### 4. AI Code Review Buddy
Automated PR reviewer that explains bugs in plain language, suggests optimizations, and teaches junior devs — not just flags issues.
- **Stack:** Next.js, GitHub API, OpenAI, GitHub Actions
- **Impact:** DevX is a $10B+ market
- **Wow factor:** "This bug would have caused a production outage because..."

### 5. Inclusive Design Auditor
Browser extension + API that scans any webpage for accessibility issues and auto-generates WCAG-compliant fixes.
- **Stack:** Chrome Extension, FastAPI, Playwright, Claude
- **Impact:** 1.3 billion people with disabilities worldwide
- **Wow factor:** Side-by-side before/after with one click

---

**Pro tip:** Pick the idea you can demo in 90 seconds. A working demo beats a perfect pitch every time.`,
  },
  {
    patterns: [/team/i, /composition/i, /roles/i, /who (do|should)/i, /équipe/i, /teammate/i],
    response: () => `## 👥 Optimal Hackathon Team Composition

The **4-person power team** consistently wins hackathons. Here's why and how:

### The Winning Roles

| Role | Responsibilities | Skills Needed |
|------|-----------------|---------------|
| **Tech Lead** | Architecture, backend, APIs | Node/Python, databases, system design |
| **Frontend Dev** | UI, UX, demos | React/Vue, CSS, Figma basics |
| **Full-Stack/DevOps** | Glue code, deployment, integrations | Docker, Vercel/Railway, multiple languages |
| **Product/Pitch** | Strategy, slides, demo script | Communication, Figma, business sense |

### Team Dynamics That Win

**✅ Do:**
- Have 1 person who can talk to judges while others code
- Ensure 2+ people can work on the same module (no single point of failure)
- Assign a "demo owner" who only focuses on the presentation layer
- Schedule sleep shifts — someone should always be fresh

**❌ Avoid:**
- All-backend teams (nothing to show = zero jury interest)
- Teams where everyone does the same thing
- "We'll figure out the pitch at the end" mindset
- Toxic 10x programmer who blocks others

### The 48-Hour Timeline
- **H0–H4:** Ideation, scope agreement, repo setup, divide work
- **H4–H20:** Core feature build (MVP by hour 20!)
- **H20–H36:** Integration, bug fixes, polish
- **H36–H44:** Demo prep, slides, rehearsal
- **H44–H48:** Final polish, submission, rest

> **Key insight:** Teams that have a working MVP by hour 20 win 73% of the time.`,
  },
  {
    patterns: [/win/i, /strateg/i, /first place/i, /judge/i, /tips/i, /comment gagner/i],
    response: () => `## 🏆 The Hackathon Winning Playbook

After analyzing hundreds of winning projects, here's the formula:

### The 5 Factors Judges Actually Score

1. **Innovation (25%)** — Is this genuinely new? Not just "Uber for X"
2. **Technical Execution (25%)** — Does it actually work? No crashes during demo
3. **Impact & Feasibility (20%)** — Can this be a real product?
4. **Presentation (20%)** — Can a non-technical judge understand it in 3 minutes?
5. **Design & UX (10%)** — Does it look intentional?

### Strategic Moves That Separate Winners

**Start with the demo, not the code**
Before writing a single line, sketch what your 3-minute demo looks like. Then build exactly that.

**The "Grandma Test"**
Your pitch must be understandable to someone's grandmother. If you use jargon, you're losing judges.

**Fake it smart**
- Hard-code data for demo paths (never show loading spinners)
- Seed your database with impressive sample data
- Have a fallback video in case of WiFi failure

**The magic moment**
Every winning demo has a single "wow moment" — something that makes the audience gasp. Design that moment first.

**Judge-to-team ratio**
Talk to every judge during networking before pitches. They remember names. Use this.

### Checklist Before Demo
- [ ] App loads in <3 seconds on demo WiFi
- [ ] You've rehearsed exactly 3 times
- [ ] "Happy path" is locked — no exploring edges
- [ ] Slides are 5 slides max (Problem / Solution / Demo / Impact / Team)
- [ ] Backup video is ready
- [ ] Everyone knows their speaking role`,
  },
  {
    patterns: [/pitch/i, /present/i, /demo/i, /slides/i, /3 minute/i, /speech/i],
    response: () => `## 🎤 The Perfect 3-Minute Hackathon Pitch

Structure your pitch like a story, not a feature list:

### The Proven Framework

**Slide 1 — The Hook (30 seconds)**
Open with a statistic or story that creates urgency.
> *"Every 40 seconds, a small business closes because they couldn't collect customer feedback fast enough. We built the fix."*

**Slide 2 — The Solution (45 seconds)**
One clear sentence: "We built [X] that helps [Y] do [Z]."
Show the product immediately — judges don't want to wait.

**Slide 3 — Live Demo (60 seconds)**
This is your entire pitch. Everything else supports this.
- Start with the problem state (show the pain)
- Perform your "wow moment" action
- Show the result

**Slide 4 — Traction & Impact (30 seconds)**
Numbers only. "We can process 10,000 requests/sec" or "Saves 4 hours/week per user."

**Slide 5 — The Ask (15 seconds)**
End with energy: "We're [Team Name] and we built this in 48 hours. Imagine what we do in 48 weeks."

### Delivery Tips
- Speak 20% slower than you think you should
- Make eye contact with judges, not the screen
- The demo-er and the talker should be different people
- If something breaks: laugh it off, explain what it does, move on
- Never apologize for your product

### Common Fatal Mistakes
❌ "Sorry, this is just a prototype..." — Never apologize!
❌ Starting with "So basically what we did was..."
❌ Reading from slides
❌ Going over time (judges immediately disengage)`,
  },
  {
    patterns: [/tech stack/i, /technology/i, /framework/i, /language/i, /mvp/i, /build fast/i, /24 hour/i, /48 hour/i],
    response: () => `## ⚡ Best Tech Stack for a 24-48h Hackathon MVP

Speed of development > technical perfection. Here are the stacks ranked by hackathon suitability:

### 🥇 Tier 1 — Ship in 6 Hours

**Full-Stack Web (Recommended)**
\`\`\`
Frontend: React + Vite + Tailwind CSS + shadcn/ui
Backend:  Node.js + Express OR Next.js API routes
Database: Supabase (free, instant setup, real-time)
Deploy:   Vercel (1 command, free, instant)
Auth:     Clerk (10 min setup) or Supabase Auth
\`\`\`

**Why this wins:** Vercel + Supabase = zero DevOps. Focus 100% on features.

### 🥈 Tier 2 — Power Builds

**AI-First Stack**
\`\`\`
Frontend: React + Tailwind
Backend:  FastAPI (Python) — best for ML/AI
AI:       OpenAI API / HuggingFace / Replicate
DB:       PostgreSQL or Supabase
Deploy:   Railway (Docker support)
\`\`\`

**Mobile App**
\`\`\`
Framework: React Native + Expo
Backend:   Supabase (same as web)
Deploy:    Expo Go (no app store needed for demo)
\`\`\`

### ⚡ Instant Wins — Use These Libraries

| Need | Library | Why |
|------|---------|-----|
| Charts | Recharts | 5 lines of code |
| Maps | Mapbox GL | Beautiful + free tier |
| Payments | Stripe Checkout | 30-min integration |
| Email | Resend | Simple API |
| Real-time | Pusher | No WebSocket setup |
| AI | OpenAI SDK | Best docs |
| Auth | Clerk | Best DX |

### ❌ Avoid in Hackathons
- Setting up Docker (unless you know it cold)
- GraphQL (REST is faster to build)
- Microservices (overkill for 48h)
- Custom authentication (use a service)`,
  },
  {
    patterns: [/judg/i, /criteria/i, /evaluat/i, /scor/i, /rubric/i, /matrix/i, /jury/i],
    response: () => `## ⚖️ Understanding Hackathon Evaluation & Scoring

HackFlow uses a **weighted matrix scoring system** designed for fairness and transparency.

### How Matrix Scoring Works

Each project is evaluated on multiple criteria, each with:
- **Weight** (how important this criterion is, e.g., 30%)
- **Score** (1–10 scale from each judge)
- **Final Score** = Σ(weight × score) across all criteria

**Example Evaluation:**
| Criterion | Weight | Judge Score | Weighted |
|-----------|--------|-------------|----------|
| Innovation | 30% | 8 | 2.40 |
| Technical Execution | 25% | 7 | 1.75 |
| Impact | 20% | 9 | 1.80 |
| Presentation | 15% | 8 | 1.20 |
| Design | 10% | 7 | 0.70 |
| **Total** | | | **7.85/10** |

### How to Maximize Your Score

**Innovation (usually highest weight)**
- Explicitly state what's new about your approach
- Mention what existing solutions you're replacing and why yours is better
- "First ever" claims resonate strongly if true

**Technical Execution**
- Show it working live — no screenshots of working code
- Mention scale: "handles 1000 concurrent users"
- Error handling shows maturity (show what happens on bad input)

**Impact**
- Use real market size numbers (TAM/SAM)
- Name potential customers by name if possible
- Show a monetization path, even rough

**Presentation**
- Confidence is scored, not just content
- Smooth demo = smooth execution signal
- Q&A answers demonstrate depth

### Pro Tips for Jury Evaluation
- Jury members take notes — give them quotable phrases
- Address the scoring criteria by name in your pitch
- "In terms of innovation, what makes us unique is..."`,
  },
  {
    patterns: [/match/i, /team.form/i, /find teammate/i, /skill/i, /partner/i],
    response: () => `## 🤝 AI Team Matchmaking — How It Works

HackFlow's AI matchmaking engine analyzes **7 dimensions** to form optimal teams:

### The Matching Algorithm

**Dimension 1: Skill Complementarity**
The system ensures teams have balanced technical coverage:
- Frontend / Backend / Full-stack / DevOps / ML-AI
- Gaps are flagged and filled before finalizing teams

**Dimension 2: Experience Level Mixing**
Research shows teams with mixed experience levels (1 senior + 2 mid + 1 junior) outperform homogeneous teams by 34%.

**Dimension 3: Domain Interest Alignment**
Matched participants share at least 2 domain interests (fintech, health, climate, gaming, etc.)

**Dimension 4: Working Style Compatibility**
- Night owls vs. morning workers
- Structured planners vs. iterative builders
- Solo coders vs. pair programmers

**Dimension 5: Availability Match**
Only matches people who commit to the same time blocks.

**Dimension 6: Prior Hackathon Experience**
Ensures each team has at least 1 experienced participant who knows the process.

**Dimension 7: Communication Style**
Introvert/extrovert balance ensures at least 1 natural presenter per team.

### Using the Matchmaking System

1. Complete your **skill profile** fully (more skills = better matches)
2. Enable **open to team** status before the event
3. Review match suggestions — you can accept/decline each
4. Chat with potential teammates before committing
5. Once a team forms, create your **team workspace**

### Tips for Getting Better Matches
- List ALL your skills, even soft ones
- Be specific: "React (3 years)" > "JavaScript"
- Add domain interests — they're weighted heavily
- Update your availability calendar`,
  },
  {
    patterns: [/portfolio/i, /showcase/i, /cv/i, /resume/i, /linkedin/i, /recruiter/i],
    response: () => `## 📁 Building a Winning Hackathon Portfolio

Your hackathon portfolio is often more valuable than your CV. Here's how to make it outstanding:

### What to Include for Each Project

**Essential:**
- Live demo link (must stay online — use Vercel/Railway)
- GitHub repo (with good README)
- 3-minute demo video (record during hackathon)
- Problem statement (1 sentence)
- What you specifically built (not "we built")

**Power Moves:**
- Architecture diagram
- Key technical challenges solved
- Performance metrics ("handles 500 req/s")
- What you'd do differently
- Awards/placement if won

### The HackFlow Portfolio Feature

HackFlow auto-generates portfolio pages that include:
- Project gallery with screenshots
- Tech stack visualization
- Team composition
- Timeline and milestones
- Jury scores (if released)
- Public URL you can share with recruiters

### How Recruiters Evaluate Hackathon Projects

Top recruiters look for:
1. **Completion** — Did you actually finish something?
2. **Technical depth** — Is the code interesting? (They look at your GitHub)
3. **Scope management** — Did you pick a realistic scope?
4. **Teamwork signals** — Commit history shows collaboration patterns
5. **Communication** — README quality = professional communication quality

### README Template That Gets Noticed
\`\`\`markdown
# Project Name
One-liner description.

## The Problem
2-3 sentences on what you're solving.

## Our Solution  
How it works in plain English.

## Tech Stack
Frontend | Backend | Database | Deploy

## What I Built
Specifically what YOUR contribution was.

## Demo
[Live Link] | [Video]

## Next Steps
What you'd build with 2 more weeks.
\`\`\``,
  },
  {
    patterns: [/mentor/i, /help/i, /support/i, /stuck/i, /blocke/i, /advice/i],
    response: () => `## 🎓 Getting the Most from Mentors

HackFlow gives you access to experienced mentors. Here's how to maximize that:

### How to Reach Mentors
1. Open a **Support Ticket** from your dashboard
2. Tag it with your problem category (Technical / Product / Pitch / Design)
3. A mentor with matching expertise responds (usually <30 min during events)
4. Or use **Chat** to ping mentors directly in their office hours channel

### How to Ask Great Questions

**Bad question:**
> "Our app doesn't work, can you help?"

**Good question:**
> "We're building a real-time notification system using Supabase. When a user creates an event, we want to notify all team members instantly. We've set up the subscription like [code snippet] but we're getting [specific error]. We've already tried [what you tried]. Should we use polling instead?"

The formula: **Context → What you tried → Specific blocker → What you need**

### Common Mentor Help Categories

**Technical unblocking** (most common)
- Database design questions
- API integration issues
- Deployment problems
- Performance bottlenecks

**Scope reality check**
Mentors are excellent at telling you "cut this feature, it's not essential for the demo"

**Pitch rehearsal**
The best mentors will do a mock Q&A session with you. Ask for this explicitly.

**Tech stack validation**
"Should we use X or Y for this?" — 5 minutes with a mentor saves 2 hours of research

### Etiquette
- Come prepared with a specific question
- Don't ask mentors to write your code
- Share what you've already tried
- Follow up with how it worked out`,
  },
  {
    patterns: [/organiz/i, /creat.*event/i, /run.*hackathon/i, /plann/i, /setup/i],
    response: () => `## 🏛️ How to Run a World-Class Hackathon

HackFlow gives organizers everything they need. Here's the complete playbook:

### 90-Day Countdown

**T-90 days: Strategy**
- Define theme, prizes, and target audience
- Book venue or set up virtual infrastructure
- Create HackFlow event with draft status

**T-60 days: Setup**
- Configure evaluation criteria (use the Criteria Builder)
- Set up judge panel (invite via HackFlow)
- Open registration and AI matchmaking
- Launch sponsor outreach

**T-30 days: Operations**
- Confirm all registrations
- Run test matchmaking simulation
- Brief mentors and judges on the platform
- Finalize schedule and milestones

**T-7 days: Launch ready**
- Lock team compositions
- Send participant onboarding guide
- Test all tech: streaming, chat, ticket system
- Prepare award ceremony slides

### Key HackFlow Features for Organizers

**Event Management**
- Custom registration forms
- Team size limits and open/closed team settings
- Milestone tracker with automated notifications
- Real-time participant dashboard

**Judging Setup**
- Criteria Builder: weighted scoring rubrics
- Judge portal: blind evaluation mode
- Score aggregation: automatic weighted averages
- Live leaderboard during judging phase

**Analytics Suite**
- Registration funnel metrics
- Team formation rates
- Engagement heatmaps
- Post-event NPS tracking

### Engagement Tactics That Work
- Send daily challenges during the event
- Create a public leaderboard (friendly competition)
- Host mid-event workshops (increases retention 40%)
- Give "Best in Track" sub-prizes (more winners = more energy)`,
  },
  {
    patterns: [/hackflow/i, /platform/i, /features/i, /how.*work/i, /what.*can.*do/i],
    response: () => `## ⚡ HackFlow Platform Overview

HackFlow is the world's most complete hackathon management platform. Here's everything you can do:

### For Participants
- **🤖 AI Matchmaking** — Get matched with complementary teammates based on skills, style, and domain
- **🚀 Project Workspace** — Collaborative space with README editor, tech stack tracker, and submission tools
- **💬 Real-Time Chat** — Multi-room communication with your team, mentors, and the community
- **🎫 Support Tickets** — Direct access to mentors with categorized support queue
- **📊 Leaderboard** — Live rankings with trend indicators
- **🤖 AI Assistant** — Get hackathon advice 24/7 (that's me!)
- **📁 Portfolio** — Auto-generated showcase page for recruiters

### For Organizers
- **📅 Event Management** — Full lifecycle from creation to ceremony
- **⚖️ Criteria Builder** — Custom weighted evaluation rubrics
- **📈 Analytics Dashboard** — Engagement, retention, NPS, and performance metrics
- **🎭 Presentation Mode** — Award ceremony display with live leaderboard
- **🌐 Portfolio Generation** — One-click public portfolio pages for all projects

### For Jury Members
- **📋 Evaluation Matrix** — Structured multi-criteria scoring
- **🔒 Blind Mode** — Anonymous evaluation for fairness
- **📊 Score Comparison** — See aggregated scores after all judges submit

### For Mentors
- **🎫 Ticket Queue** — See and claim support tickets from participants
- **💬 Office Hours** — Dedicated chat channels for mentor sessions
- **⭐ Reputation System** — Build your mentor profile across events

### Quick Navigation
- Start with your **Dashboard** for a role-specific overview
- Use **Chat** to connect with your community
- Check **Hackathons** to find or join events`,
  },
  {
    patterns: [/api/i, /backend/i, /database/i, /server/i, /deploy/i, /devops/i],
    response: () => `## 🔧 Backend & Deployment Best Practices for Hackathons

### The Fastest Backend Setup (Under 30 Minutes)

**Option A: Supabase (Recommended)**
\`\`\`bash
# 1. Create project at supabase.com (2 min)
# 2. Install SDK
npm install @supabase/supabase-js

# 3. Initialize
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

# 4. Query (it's that simple)
const { data } = await supabase.from('projects').select('*')
\`\`\`

**Benefits:** Real-time subscriptions, auth, storage, edge functions — all built in.

**Option B: Express + PostgreSQL**
\`\`\`bash
npx create-express-api my-api
# Use Railway for instant Postgres + deployment
\`\`\`

### Deployment Checklist

**Vercel (Frontend)**
\`\`\`bash
npm i -g vercel
vercel  # follow prompts, done in 60 seconds
\`\`\`

**Railway (Backend + DB)**
- Connect GitHub repo → auto-deploys on push
- Add PostgreSQL plugin with 1 click
- Environment variables via UI

### API Design for Speed

**Use these patterns:**
\`\`\`typescript
// REST endpoints that make sense for demos
GET    /api/users
POST   /api/projects
GET    /api/projects/:id
PATCH  /api/projects/:id
DELETE /api/projects/:id
\`\`\`

**Avoid:**
- Custom authentication (use Clerk/Supabase Auth)
- Complex joins on demo paths (flatten the data)
- Pagination on demo screens (show best 5 records)

### Common Hackathon Backend Issues & Fixes

| Problem | Quick Fix |
|---------|-----------|
| CORS errors | \`app.use(cors())\` |
| DB connection drops | Use connection pooling |
| Demo crashes on WiFi | Cache responses locally |
| Env vars missing | Check deployment env panel |
| Rate limits hit | Add simple in-memory cache |`,
  },
  {
    patterns: [/design/i, /ui/i, /ux/i, /beautiful/i, /figma/i, /css/i, /tailwind/i],
    response: () => `## 🎨 Design That Impresses Judges in 48 Hours

You don't need to be a designer. You need to look like one.

### The Cheat Code: Component Libraries

**shadcn/ui (Best for React)**
\`\`\`bash
npx shadcn@latest init
npx shadcn@latest add button card dialog
\`\`\`
Professional components, zero design needed.

**Tailwind CSS Patterns That Always Look Good**
\`\`\`tsx
// Glass card effect
<div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">

// Gradient text
<h1 className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">

// Subtle glow
<button className="shadow-[0_0_30px_rgba(59,130,246,0.4)]">
\`\`\`

### 5 Design Principles That Win

1. **Dark theme** — Always more impressive in demo environments
2. **Big bold numbers** — Metrics pop: "23,847 users" looks great large
3. **One accent color** — Don't mix too many colors
4. **Lots of whitespace** — Judges read crowded UIs as "complicated"
5. **Loading states** — Skeletons/spinners signal engineering quality

### Quick Design Checklist
- [ ] Consistent font (Inter or Plus Jakarta Sans)
- [ ] Primary color used consistently
- [ ] Mobile responsive (judges often check)
- [ ] Logo in top-left (even a simple icon)
- [ ] Empty states designed (not blank screens)
- [ ] Error states handled gracefully

### Figma → Code Workflow
1. Use Figma community templates (free, high quality)
2. Inspect mode gives you exact CSS values
3. TailwindCSS converter: \`tailwind.simeongriggs.dev\`
4. Coolors.co for color palette generation`,
  },
  {
    patterns: [/schedule/i, /timeline/i, /time management/i, /when/i, /hours/i, /planning/i],
    response: () => `## ⏰ The Perfect Hackathon Schedule

Time management is the difference between winners and "almost finished."

### 48-Hour Master Schedule

**Hour 0-2: Kickoff**
- Team introductions and ice breakers
- Agree on the idea (pick fast, iterate later)
- Assign roles definitively
- Create repo, set up project, deploy "Hello World"

**Hour 2-8: Foundation**
- Database schema designed and seeded
- Auth working (use Clerk — 20 min max)
- Basic UI shell with navigation
- API skeleton with placeholder data

**Hour 8-20: Core Build**
- Main feature 1 (the "wow moment") — must be done by H16
- Main feature 2 (supporting)
- Integration between frontend/backend
- **Milestone check at H20: Is the MVP demo-able?**

**Hour 20-36: Polish**
- Bug fixes (only demo-critical ones)
- UI polish (colors, spacing, animations)
- Seed database with impressive sample data
- Write README

**Hour 36-44: Demo Prep**
- Record backup demo video
- Practice pitch 3 times
- Build slides (5 slides max)
- Rehearse Q&A with tough questions

**Hour 44-48: Buffer**
- Handle unexpected issues
- Final submission
- **Sleep at least 4 hours!**

### The Scope Management Rule
If a feature takes >2 hours and isn't in the demo, **cut it**.

### Red Flags (Intervene Immediately)
- 🚨 H24 and no working API
- 🚨 H36 and no demo script
- 🚨 H40 and no slides
- 🚨 Any team member not sleeping`,
  },
  {
    patterns: [/sponsor/i, /prize/i, /reward/i, /money/i, /award/i],
    response: () => `## 🏅 Maximizing Prizes & Sponsor Opportunities

### Types of Prizes

**Main Track Prizes**
- 1st, 2nd, 3rd place overall
- Usually the largest monetary awards
- Decided by jury matrix scoring

**Sponsor Prizes**
- Often undercompeted (fewer people target them)
- Usually require using the sponsor's product/API
- "Best use of [Sponsor API]" prizes are easy wins

**Track Prizes**
- Best in Health / Fintech / Climate / Education
- More specific audience = less competition
- Easier to tailor your narrative

**Special Awards**
- Best UI/UX Design
- Most Innovative Concept
- Best Solo Project
- Most Social Impact

### Strategy: Multi-Prize Targeting

Build your project to qualify for multiple prizes:
1. Use a sponsor's API (qualify for sponsor prize)
2. Fit within a track theme (qualify for track prize)
3. Excel in 1 special category (design, innovation)

"Best use of Stripe" + "Best Fintech Project" + "2nd Place Overall" is 3 prizes from 1 project.

### How to Win Sponsor Prizes Specifically
- Actually read the sponsor's documentation
- Use non-trivial features (not just basic API calls)
- Mention the sponsor by name in your pitch
- Tag them on social media during the hackathon
- Ask a sponsor employee for advice during the event`,
  },
];

const FALLBACK_RESPONSES = [
  `That's a great hackathon question! Here's my expert take:

Hackathons are fundamentally about **learning, building, and connecting** — the award is secondary to the experience. That said, to make the most of your time:

1. **Start with why** — What problem genuinely excites you? Passion is contagious and judges feel it.
2. **Ship something real** — A working prototype of 1 feature beats a beautiful mockup of 10 features.
3. **Tell a story** — The best projects have a clear narrative: Problem → Solution → Impact.
4. **Use HackFlow fully** — The AI matchmaking, real-time chat, mentor tickets, and jury scoring are all designed to maximize your success.

Is there a more specific aspect of hackathon preparation I can help you with? Try asking about:
- **Project ideas** for a specific domain
- **Team formation** strategy
- **Tech stack** recommendations
- **Pitch structure** and presentation tips
- **Judging criteria** optimization`,

  `Great question about hackathon strategy! Here's what the data shows from hundreds of successful hackathon projects:

The most successful participants are those who **narrow their scope aggressively** and **execute flawlessly** on a small feature set rather than building a complex system.

Key principles:
- **Build for the demo, not production** — Hard-code data, mock services, optimize the happy path
- **Design drives perception** — A beautiful simple app beats a ugly complex one
- **The story matters** — Why this, why now, why you? Answer these first.

Would you like me to go deeper on any specific aspect? I can help with project ideas, technical stack choices, pitch strategy, team dynamics, or how to use HackFlow's features to your advantage.`,

  `Excellent question! Let me give you the most useful answer I can.

In my experience with thousands of hackathon participants, the biggest differentiator between teams that win and teams that don't isn't technical skill — it's **communication and scoping**.

The winning formula:
1. **Pick a problem you care about** (passion shows)
2. **Cut the scope to the bone** (less is more in 48h)
3. **Have one "wow moment"** in your demo
4. **Practice the pitch** at least 3 times
5. **Take care of yourselves** — food, water, brief rest

HackFlow is built to support you at every step — from AI-powered team matching to the jury matrix evaluation system. Make sure you're using all the tools available to you.

Feel free to ask me about any specific hackathon topic — project ideas, tech stacks, team strategies, pitch tips, or how to use any HackFlow feature!`,
];

function findBestMatch(query: string): string {
  for (const entry of KB) {
    if (entry.patterns.some(p => p.test(query))) {
      return entry.response();
    }
  }
  return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
}

export async function streamAIResponse(
  query: string,
  onChunk: (text: string) => void,
  onDone: (fullText: string) => void,
  signal?: AbortSignal,
): Promise<void> {
  const fullResponse = findBestMatch(query);

  const chunkSize = () => 3 + Math.floor(Math.random() * 6);
  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  let sent = 0;
  const chars = fullResponse.split("");

  while (sent < chars.length) {
    if (signal?.aborted) return;

    const size = chunkSize();
    const chunk = chars.slice(sent, sent + size).join("");
    sent += size;

    onChunk(chunk);

    const ch = chunk[chunk.length - 1];
    const ms = ch === "\n" ? 30 : ch === "." || ch === "," ? 25 : 12 + Math.random() * 10;
    await delay(ms);
  }

  onDone(fullResponse);
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  messages: AIMessage[];
}

const conversations = new Map<string, Conversation>();

export function createConversation(title: string): Conversation {
  const id = `conv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const conv: Conversation = { id, title, createdAt: new Date(), messages: [] };
  conversations.set(id, conv);
  return conv;
}

export function getConversation(id: string): Conversation | undefined {
  return conversations.get(id);
}

export function listConversations(): Conversation[] {
  return Array.from(conversations.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export function deleteConversation(id: string): void {
  conversations.delete(id);
}

export function addMessage(convId: string, msg: AIMessage): void {
  const conv = conversations.get(convId);
  if (conv) conv.messages.push(msg);
}
