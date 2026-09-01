import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { AppShell } from '@/components/barca-ui';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { AdminCategoriesPage, AdminMatchesPage, AdminNewsEditorPage, AdminNewsPage, AdminOverviewPage, AdminTransfersPage } from '@/pages/admin-pages';
import {
  FavoritesPage,
  HomePage,
  MatchesPage,
  NewsDetailPage,
  NotificationsPage,
  SearchPage,
  TransfersPage,
} from '@/pages/barca-pages';
import {
  Route,
  Switch,
  useLocation,
  Router as WouterRouter,
} from 'wouter';

const queryClient = new QueryClient();

function Router() {
  const [location] = useLocation();
  if (location.startsWith('/admin')) {
    return (
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/admin" component={AdminOverviewPage} />
          <Route path="/admin/news" component={AdminNewsPage} />
          <Route path="/admin/news/new" component={AdminNewsEditorPage} />
          <Route path="/admin/news/:id/edit" component={AdminNewsEditorPage} />
          <Route path="/admin/categories" component={AdminCategoriesPage} />
          <Route path="/admin/transfers" component={AdminTransfersPage} />
          <Route path="/admin/matches" component={AdminMatchesPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    );
  }
  return (
    <AppShell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/transfers" component={TransfersPage} />
          <Route path="/matches" component={MatchesPage} />
          <Route path="/search" component={SearchPage} />
          <Route path="/favorites" component={FavoritesPage} />
          <Route path="/notifications" component={NotificationsPage} />
          <Route path="/news/:id" component={NewsDetailPage} />
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </AppShell>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
