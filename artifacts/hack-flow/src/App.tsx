import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthInit } from "@/components/shared/AuthInit";
import NotFound from "@/pages/not-found";

// Pages
import LandingPage from "@/pages/index";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import DashboardPage from "@/pages/dashboard/index";
import ChatPage from "@/pages/chat/index";
import HackathonsPage from "@/pages/hackathons/index";
import HackathonDetailPage from "@/pages/hackathons/[id]";
import PortfolioPage from "@/pages/hackathons/[id]/portfolio";
import MatchmakingPage from "@/pages/hackathons/[id]/matchmaking";
import TeamsPage from "@/pages/teams/index";
import TeamDetailPage from "@/pages/teams/[id]";
import ProjectsPage from "@/pages/projects/[id]";
import TicketsPage from "@/pages/tickets/index";
import JuryPage from "@/pages/jury/[hackathonId]";
import JuryIndexPage from "@/pages/jury/index";
import OrganizerHackathonsPage from "@/pages/organizer/hackathons/index";
import AnalyticsPage from "@/pages/organizer/hackathons/[id]/analytics";
import CriteriaBuilderPage from "@/pages/organizer/hackathons/[id]/criteria";
import HackathonManagePage from "@/pages/organizer/hackathons/[id]/manage";
import AdminOverviewPage from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminAuditLogsPage from "@/pages/admin/audit-logs";
import ProfilePage from "@/pages/profile/index";
import AIPage from "@/pages/ai/index";
import LeaderboardPage from "@/pages/leaderboard/index";
import { AIFloatingWidget } from "@/components/shared/AIFloatingWidget";
import { useAuthStore } from "@/store/authStore";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      
      <Route path="/dashboard" component={DashboardPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/chat" component={ChatPage} />
      
      <Route path="/hackathons" component={HackathonsPage} />
      <Route path="/hackathons/:id" component={HackathonDetailPage} />
      <Route path="/hackathons/:id/portfolio" component={PortfolioPage} />
      <Route path="/hackathons/:id/matchmaking" component={MatchmakingPage} />
      
      <Route path="/teams" component={TeamsPage} />
      <Route path="/teams/:id" component={TeamDetailPage} />
      <Route path="/projects/:id" component={ProjectsPage} />
      <Route path="/tickets" component={TicketsPage} />
      
      <Route path="/jury" component={JuryIndexPage} />
      <Route path="/jury/:hackathonId" component={JuryPage} />
      
      <Route path="/organizer/hackathons" component={OrganizerHackathonsPage} />
      <Route path="/organizer/hackathons/:id/analytics" component={AnalyticsPage} />
      <Route path="/organizer/hackathons/:id/criteria" component={CriteriaBuilderPage} />
      <Route path="/organizer/hackathons/:id/manage" component={HackathonManagePage} />
      
      <Route path="/admin" component={AdminOverviewPage} />
      <Route path="/admin/users" component={AdminUsersPage} />
      <Route path="/admin/audit-logs" component={AdminAuditLogsPage} />
      
      <Route path="/ai" component={AIPage} />
      <Route path="/leaderboard" component={LeaderboardPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const { isAuthenticated } = useAuthStore();
  return (
    <>
      <AuthInit />
      <Router />
      {isAuthenticated && <AIFloatingWidget />}
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AppInner />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
