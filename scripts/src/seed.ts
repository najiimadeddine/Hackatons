import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../../lib/db/src/schema/index.js";
import bcrypt from "bcryptjs";

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const {
  usersTable, hackathonsTable, hackathonParticipantsTable, hackathonRolesTable,
  milestonesTable, teamsTable, teamMembersTable, projectsTable,
  evaluationCriteriaTable, evaluationScoresTable, ticketsTable,
} = schema;

async function seed() {
  console.log("🌱 Seeding database...");


  const PASSWORD = await bcrypt.hash("hackflow123", 10);

  const [admin, organizer, dev, designer, backend, mentor, jury] = await db
    .insert(usersTable)
    .values([
      {
        email: "admin@hackflow.dev",
        passwordHash: PASSWORD,
        name: "Alex Admin",
        role: "admin",
        bio: "Platform administrator and super user. Keeps the lights on.",
        skills: ["DevOps", "PostgreSQL", "Node.js"],
        timezone: "UTC",
        githubUrl: "https://github.com/alexadmin",
      },
      {
        email: "organizer@hackflow.dev",
        passwordHash: PASSWORD,
        name: "Olivia Organizer",
        role: "organizer",
        bio: "Hackathon architect. I've organized 12 national-level events across 3 countries.",
        skills: ["Project Management", "Community Building", "Design Thinking"],
        timezone: "Europe/Paris",
        linkedinUrl: "https://linkedin.com/in/olivia-org",
      },
      {
        email: "dev@hackflow.dev",
        passwordHash: PASSWORD,
        name: "Dani Developer",
        role: "participant",
        bio: "Full-stack developer obsessed with TypeScript and distributed systems.",
        skills: ["React", "TypeScript", "Node.js", "PostgreSQL", "Docker"],
        timezone: "Europe/Berlin",
        githubUrl: "https://github.com/danidev",
      },
      {
        email: "designer@hackflow.dev",
        passwordHash: PASSWORD,
        name: "Sophie Designer",
        role: "participant",
        bio: "UI/UX designer with a passion for accessible, beautiful products.",
        skills: ["Figma", "React", "CSS", "User Research", "Prototyping"],
        timezone: "Europe/London",
        githubUrl: "https://github.com/sophiedesign",
      },
      {
        email: "backend@hackflow.dev",
        passwordHash: PASSWORD,
        name: "Bruno Backend",
        role: "participant",
        bio: "Backend engineer specializing in API design, caching, and performance.",
        skills: ["Go", "Rust", "PostgreSQL", "Redis", "Kubernetes", "AWS"],
        timezone: "America/New_York",
        githubUrl: "https://github.com/brunoback",
      },
      {
        email: "mentor@hackflow.dev",
        passwordHash: PASSWORD,
        name: "Maria Mentor",
        role: "mentor",
        bio: "Senior engineer at a FAANG company. I mentor 20+ developers per year.",
        skills: ["System Design", "Go", "Python", "Machine Learning", "Leadership"],
        timezone: "America/Los_Angeles",
        linkedinUrl: "https://linkedin.com/in/mariamentor",
      },
      {
        email: "jury@hackflow.dev",
        passwordHash: PASSWORD,
        name: "James Jury",
        role: "jury",
        bio: "CTO & startup advisor. Evaluated projects at 40+ hackathons worldwide.",
        skills: ["Product Strategy", "Business Development", "AI/ML", "Venture Capital"],
        timezone: "Asia/Dubai",
        linkedinUrl: "https://linkedin.com/in/jamesjury",
      },
    ])
    .onConflictDoUpdate({ target: usersTable.email, set: { name: usersTable.name } })
    .returning();

  console.log("✅ Users seeded:", [admin, organizer, dev, designer, backend, mentor, jury].map(u => u.email));


  const now = new Date();
  const past  = (d: number) => new Date(now.getTime() - d * 86400000);
  const future = (d: number) => new Date(now.getTime() + d * 86400000);

  const [h1, h2, h3, h4, h5] = await db
    .insert(hackathonsTable)
    .values([
      {
        title: "AI Innovation Challenge 2025",
        description: `Build the future of AI-powered applications in this flagship 72-hour hackathon.

This challenge invites developers, designers, and innovators to create solutions that leverage artificial intelligence to solve real-world problems. From healthcare to education, sustainability to finance — the domain is yours to choose.

**What we're looking for:**
- Novelty of the AI approach
- Technical execution and code quality  
- Impact and real-world applicability
- Presentation and demo clarity

Join 200+ participants, get mentored by industry experts, and compete for a €20,000 prize pool. Open stack — use any AI/ML framework you love.`,
        status: "open" as const,
        startDate: future(14),
        endDate: future(17),
        registrationDeadline: future(12),
        maxTeamSize: 4,
        minTeamSize: 2,
        maxParticipants: 200,
        prizePool: "€20,000",
        techStack: ["Python", "TensorFlow", "PyTorch", "OpenAI API", "FastAPI", "React"],
        organizerId: organizer.id,
      },
      {
        title: "FinTech Hackathon — Open Banking",
        description: `Reshape the future of finance. Build innovative open banking solutions that empower individuals and businesses to take control of their financial data.

This 48-hour hackathon brings together the best fintech minds to tackle challenges in payments, personal finance, lending, and regulatory compliance.

**Focus areas:**
- Open Banking API integrations
- Personal financial management tools
- Cross-border payment solutions
- Financial inclusion for the unbanked

Supported by major banks and fintech VCs. Winners get fast-tracked into our accelerator program.`,
        status: "active" as const,
        startDate: past(1),
        endDate: future(1),
        registrationDeadline: past(3),
        maxTeamSize: 5,
        minTeamSize: 2,
        maxParticipants: 150,
        prizePool: "$15,000 + Accelerator Spots",
        techStack: ["Node.js", "React", "Plaid API", "Stripe", "PostgreSQL", "TypeScript"],
        organizerId: organizer.id,
      },
      {
        title: "GreenTech Summit — Sustainability Sprint",
        description: `Code for the planet. This hackathon challenges teams to build technology that addresses climate change, reduces carbon emissions, or promotes sustainable living.

From smart energy grids to carbon footprint trackers, waste reduction apps to climate data visualization — we want bold ideas backed by solid engineering.

**Judging criteria:**
- Environmental impact potential (40%)
- Technical implementation (30%)
- Scalability and business viability (20%)
- Presentation quality (10%)

Proudly supported by the European Green Innovation Fund.`,
        status: "judging" as const,
        startDate: past(10),
        endDate: past(7),
        registrationDeadline: past(12),
        maxTeamSize: 4,
        minTeamSize: 1,
        maxParticipants: 100,
        prizePool: "€10,000 + Grant Opportunities",
        techStack: ["Python", "React", "IoT", "Data Visualization", "APIs", "ML"],
        organizerId: organizer.id,
      },
      {
        title: "Web3 BuildathON — Decentralized Future",
        description: `Build on the decentralized web. This 3-day buildathon focuses on DeFi protocols, NFT ecosystems, DAO tooling, and Web3 identity solutions.

Whether you're a seasoned Solidity developer or curious newcomer, we have tracks for all skill levels. Mentors from leading Web3 protocols will be available throughout.

The best projects will be featured in our Web3 Showcase and considered for ecosystem grants.`,
        status: "completed" as const,
        startDate: past(25),
        endDate: past(22),
        registrationDeadline: past(28),
        maxTeamSize: 4,
        minTeamSize: 2,
        prizePool: "$25,000 + Protocol Grants",
        techStack: ["Solidity", "Hardhat", "Ethers.js", "React", "IPFS", "The Graph"],
        organizerId: organizer.id,
      },
      {
        title: "HealthTech Innovation Weekend",
        description: `Transform healthcare with technology. This weekend hackathon focuses on digital health, medical AI, patient engagement, and healthcare accessibility.

Teams will work on real clinical challenges provided by our hospital partners. Solutions that show strong clinical relevance and technical feasibility will win mentorship from leading medtech companies.

Free for all participants. Food, drinks, and cloud credits provided.`,
        status: "open" as const,
        startDate: future(5),
        endDate: future(7),
        registrationDeadline: future(4),
        maxTeamSize: 5,
        minTeamSize: 2,
        maxParticipants: 80,
        prizePool: "€8,000",
        techStack: ["Python", "React Native", "FHIR API", "ML", "Swift", "Firebase"],
        organizerId: organizer.id,
      },
    ])
    .returning();

  console.log("✅ Hackathons seeded:", [h1, h2, h3, h4, h5].map(h => h.title));


  await db.insert(milestonesTable).values([

    { hackathonId: h1.id, title: "Registration opens",      dueDate: past(5),    isCompleted: "true",  description: "Platform opens for participant registration." },
    { hackathonId: h1.id, title: "Team formation deadline", dueDate: future(12), isCompleted: "false", description: "All teams must be finalized before the hackathon starts." },
    { hackathonId: h1.id, title: "Hackathon kick-off",      dueDate: future(14), isCompleted: "false", description: "Opening ceremony and problem statement reveal." },
    { hackathonId: h1.id, title: "Midpoint check-in",       dueDate: future(15), isCompleted: "false", description: "Mandatory demo of progress to mentors." },
    { hackathonId: h1.id, title: "Final submissions",        dueDate: future(17), isCompleted: "false", description: "All projects must be submitted by midnight." },
    { hackathonId: h1.id, title: "Awards ceremony",          dueDate: future(18), isCompleted: "false", description: "Winners announced and prizes distributed." },


    { hackathonId: h2.id, title: "Registration closed",     dueDate: past(3),    isCompleted: "true",  description: "Registration period ended." },
    { hackathonId: h2.id, title: "Hackathon start",         dueDate: past(1),    isCompleted: "true",  description: "Teams begin hacking!" },
    { hackathonId: h2.id, title: "Mentor office hours",     dueDate: future(0),  isCompleted: "false", description: "One-on-one sessions with fintech mentors." },
    { hackathonId: h2.id, title: "Project submission",      dueDate: future(1),  isCompleted: "false", description: "Final deadline for project submissions." },


    { hackathonId: h3.id, title: "Hack started",            dueDate: past(10),   isCompleted: "true" },
    { hackathonId: h3.id, title: "Submissions closed",      dueDate: past(7),    isCompleted: "true" },
    { hackathonId: h3.id, title: "Jury evaluation",         dueDate: past(5),    isCompleted: "true",  description: "Panel of 5 judges evaluating all submissions." },
    { hackathonId: h3.id, title: "Results announced",       dueDate: future(2),  isCompleted: "false", description: "Winners published on platform and social media." },


    { hackathonId: h4.id, title: "Registration", dueDate: past(28), isCompleted: "true" },
    { hackathonId: h4.id, title: "Hack start",   dueDate: past(25), isCompleted: "true" },
    { hackathonId: h4.id, title: "Submissions",  dueDate: past(22), isCompleted: "true" },
    { hackathonId: h4.id, title: "Judging",      dueDate: past(21), isCompleted: "true" },
    { hackathonId: h4.id, title: "Winners",      dueDate: past(20), isCompleted: "true", description: "ChainVault took first place with their DeFi savings protocol." },
  ]);
  console.log("✅ Milestones seeded");


  await db.insert(evaluationCriteriaTable).values([

    { hackathonId: h1.id, name: "Innovation",       description: "How novel and creative is the AI approach?",                 weight: 30 },
    { hackathonId: h1.id, name: "Technical Quality",description: "Code quality, architecture, and engineering rigor.",         weight: 30 },
    { hackathonId: h1.id, name: "Impact",           description: "Real-world applicability and potential for adoption.",       weight: 25 },
    { hackathonId: h1.id, name: "Presentation",     description: "Clarity of demo, pitch quality, and slide design.",         weight: 15 },

    { hackathonId: h2.id, name: "Business Viability", description: "Market potential and revenue model.",                     weight: 35 },
    { hackathonId: h2.id, name: "Technical Execution",description: "API integrations, security, and code quality.",           weight: 35 },
    { hackathonId: h2.id, name: "UX Design",          description: "User experience quality and design polish.",              weight: 20 },
    { hackathonId: h2.id, name: "Pitch",              description: "Clarity and persuasiveness of the team pitch.",           weight: 10 },

    { hackathonId: h3.id, name: "Environmental Impact", description: "Potential carbon reduction or sustainability impact.",  weight: 40 },
    { hackathonId: h3.id, name: "Technical Quality",    description: "Implementation depth and code quality.",                weight: 30 },
    { hackathonId: h3.id, name: "Scalability",          description: "Can this scale to global adoption?",                   weight: 20 },
    { hackathonId: h3.id, name: "Presentation",         description: "Pitch and demo quality.",                              weight: 10 },

    { hackathonId: h4.id, name: "Smart Contract Quality", description: "Solidity code quality, security, and gas efficiency.",weight: 35 },
    { hackathonId: h4.id, name: "Originality",            description: "Novel use of blockchain primitives.",                 weight: 30 },
    { hackathonId: h4.id, name: "UX & Frontend",          description: "dApp usability and design.",                         weight: 20 },
    { hackathonId: h4.id, name: "Docs & Demo",            description: "Documentation quality and live demo.",                weight: 15 },
  ]);
  console.log("✅ Evaluation criteria seeded");


  const participants = [dev, designer, backend];
  for (const p of participants) {
    await db.insert(hackathonParticipantsTable).values([
      { hackathonId: h1.id, userId: p.id },
      { hackathonId: h2.id, userId: p.id },
      { hackathonId: h3.id, userId: p.id },
      { hackathonId: h4.id, userId: p.id },
    ]).onConflictDoNothing();
  }

  await db.insert(hackathonRolesTable).values([
    { hackathonId: h1.id, userId: mentor.id, role: "mentor" },
    { hackathonId: h2.id, userId: mentor.id, role: "mentor" },
    { hackathonId: h3.id, userId: mentor.id, role: "mentor" },
    { hackathonId: h1.id, userId: jury.id,   role: "jury"   },
    { hackathonId: h2.id, userId: jury.id,   role: "jury"   },
    { hackathonId: h3.id, userId: jury.id,   role: "jury"   },
    { hackathonId: h4.id, userId: jury.id,   role: "jury"   },
  ]).onConflictDoNothing();
  console.log("✅ Participants and roles seeded");


  const [team1] = await db.insert(teamsTable).values({
    hackathonId: h2.id,
    name: "NeoLedger",
    description: "Building a next-gen personal finance dashboard with open banking APIs.",
    leaderId: dev.id,
    lookingForRoles: [],
  }).returning();

  const [team2] = await db.insert(teamsTable).values({
    hackathonId: h2.id,
    name: "PayBridge",
    description: "Cross-border micropayments for the gig economy.",
    leaderId: backend.id,
    lookingForRoles: ["Designer"],
  }).returning();

  const [team3] = await db.insert(teamsTable).values({
    hackathonId: h3.id,
    name: "GreenPulse",
    description: "Real-time CO2 tracking for enterprises using IoT sensors.",
    leaderId: dev.id,
    lookingForRoles: [],
  }).returning();

  const [team4] = await db.insert(teamsTable).values({
    hackathonId: h3.id,
    name: "EcoRoute",
    description: "AI-powered logistics optimizer that minimizes carbon footprint.",
    leaderId: designer.id,
    lookingForRoles: [],
  }).returning();

  const [team5] = await db.insert(teamsTable).values({
    hackathonId: h4.id,
    name: "ChainVault",
    description: "Decentralized savings protocol with auto-compounding yield strategies.",
    leaderId: backend.id,
    lookingForRoles: [],
  }).returning();

  const [team6] = await db.insert(teamsTable).values({
    hackathonId: h4.id,
    name: "MetaMesh",
    description: "Decentralized social graph and identity layer for Web3 apps.",
    leaderId: dev.id,
    lookingForRoles: [],
  }).returning();

  const [team7] = await db.insert(teamsTable).values({
    hackathonId: h4.id,
    name: "DAO Forge",
    description: "No-code DAO creation and governance tooling.",
    leaderId: designer.id,
    lookingForRoles: [],
  }).returning();


  await db.insert(teamMembersTable).values([
    { teamId: team1.id, userId: dev.id,      role: "leader" },
    { teamId: team1.id, userId: designer.id, role: "member" },
    { teamId: team2.id, userId: backend.id,  role: "leader" },
    { teamId: team3.id, userId: dev.id,      role: "leader" },
    { teamId: team3.id, userId: backend.id,  role: "member" },
    { teamId: team4.id, userId: designer.id, role: "leader" },
    { teamId: team5.id, userId: backend.id,  role: "leader" },
    { teamId: team5.id, userId: dev.id,      role: "member" },
    { teamId: team6.id, userId: dev.id,      role: "leader" },
    { teamId: team6.id, userId: designer.id, role: "member" },
    { teamId: team7.id, userId: designer.id, role: "leader" },
  ]).onConflictDoNothing();
  console.log("✅ Teams seeded");


  const [proj1] = await db.insert(projectsTable).values({
    hackathonId: h3.id,
    teamId: team3.id,
    title: "GreenPulse — Enterprise Carbon Monitor",
    description: "A real-time CO2 and energy monitoring platform for medium to large enterprises. Connects to IoT sensors across office floors and factory floors, aggregates data, and surfaces actionable insights via an intuitive dashboard.",
    techStack: ["React", "Node.js", "InfluxDB", "MQTT", "Python", "ML"],
    repoUrl: "https://github.com/greenpulse/carbon-monitor",
    demoUrl: "https://greenpulse-demo.vercel.app",
    status: "submitted" as const,
    totalScore: 87.5,
    rank: 1,
  }).returning();

  const [proj2] = await db.insert(projectsTable).values({
    hackathonId: h3.id,
    teamId: team4.id,
    title: "EcoRoute — AI Logistics Optimizer",
    description: "Uses machine learning to optimize delivery routes, reducing carbon emissions by up to 35%. Integrates with major logistics APIs and provides a beautiful dashboard for fleet managers.",
    techStack: ["Python", "FastAPI", "React", "PostgreSQL", "Google Maps API"],
    repoUrl: "https://github.com/ecoroute/optimizer",
    demoUrl: "https://ecoroute.app",
    status: "submitted" as const,
    totalScore: 79.2,
    rank: 2,
  }).returning();

  const [proj3] = await db.insert(projectsTable).values({
    hackathonId: h4.id,
    teamId: team5.id,
    title: "ChainVault — DeFi Savings Protocol",
    description: "A non-custodial savings protocol on Ethereum that auto-compounds yield from Aave and Compound. Features one-click savings strategies, risk profiles, and a beautifully designed React dApp.",
    techStack: ["Solidity", "Hardhat", "Ethers.js", "React", "TheGraph", "IPFS"],
    repoUrl: "https://github.com/chainvault/protocol",
    demoUrl: "https://chainvault.finance",
    status: "winner" as const,
    totalScore: 93.1,
    rank: 1,
  }).returning();

  const [proj4] = await db.insert(projectsTable).values({
    hackathonId: h4.id,
    teamId: team6.id,
    title: "MetaMesh — Web3 Social Graph",
    description: "A decentralized identity and social graph protocol enabling portable reputation across Web3 apps. Built on Lens Protocol with a beautiful cross-platform frontend.",
    techStack: ["Solidity", "Lens Protocol", "React", "Ceramic Network"],
    repoUrl: "https://github.com/metamesh/social",
    status: "finalist" as const,
    totalScore: 84.7,
    rank: 2,
  }).returning();

  const [proj5] = await db.insert(projectsTable).values({
    hackathonId: h4.id,
    teamId: team7.id,
    title: "DAO Forge — No-Code DAO Builder",
    description: "Create and manage DAOs without writing a single line of code. Visual governance builder with voting systems, treasury management, and member onboarding flows.",
    techStack: ["Solidity", "React", "Snapshot", "Gnosis Safe"],
    repoUrl: "https://github.com/daoforge/builder",
    status: "submitted" as const,
    totalScore: 71.3,
    rank: 3,
  }).returning();

  console.log("✅ Projects seeded");


  await db.insert(ticketsTable).values([
    {
      hackathonId: h2.id,
      authorId: dev.id,
      title: "API rate limiting issue with Plaid sandbox",
      description: "We're hitting 429 errors on the Plaid sandbox when making more than 5 requests per minute. Is there a recommended approach for batching calls or using a caching layer?",
      status: "open" as const,
      priority: "high" as const,
    },
    {
      hackathonId: h2.id,
      authorId: designer.id,
      title: "How to handle multi-currency formatting?",
      description: "Our app needs to display amounts in EUR, USD, and GBP. What's the best library for handling currency formatting across locales?",
      status: "claimed" as const,
      priority: "medium" as const,
      mentorId: mentor.id,
    },
    {
      hackathonId: h1.id,
      authorId: backend.id,
      title: "PyTorch model deployment on free tier",
      description: "We have a trained model (~450MB) but struggle to deploy it within the memory constraints. Should we look at model distillation or ONNX export?",
      status: "open" as const,
      priority: "medium" as const,
    },
    {
      hackathonId: h2.id,
      authorId: backend.id,
      title: "Stripe Radar integration for fraud detection",
      description: "We want to add ML-based fraud detection to our payment flow. Can someone guide us through the Stripe Radar setup?",
      status: "resolved" as const,
      priority: "low" as const,
      mentorId: mentor.id,
      resolvedAt: past(0),
    },
  ]);
  console.log("✅ Tickets seeded");

  await pool.end();
  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Test accounts (password: hackflow123):");
  console.log("  admin@hackflow.dev     → Admin");
  console.log("  organizer@hackflow.dev → Organizer");
  console.log("  dev@hackflow.dev       → Participant");
  console.log("  designer@hackflow.dev  → Participant");
  console.log("  backend@hackflow.dev   → Participant");
  console.log("  mentor@hackflow.dev    → Mentor");
  console.log("  jury@hackflow.dev      → Jury");
}

seed().catch(err => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
