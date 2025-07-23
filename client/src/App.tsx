import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import NCERTManagement from "@/pages/ncert-management";
import ContentGenerator from "@/pages/content-generator";
import DifferentiatedMaterials from "@/pages/differentiated-materials";
import LessonPlanner from "@/pages/lesson-planner";
import VisualAids from "@/pages/visual-aids";
import ArIntegration from "@/pages/ar-integration";
import GamifiedTeaching from "@/pages/gamified-teaching";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/ncert" component={NCERTManagement} />
      <Route path="/content-generator" component={ContentGenerator} />
      <Route path="/differentiated-materials" component={DifferentiatedMaterials} />
      <Route path="/lesson-planner" component={LessonPlanner} />
      <Route path="/visual-aids" component={VisualAids} />
      <Route path="/ar-integration" component={ArIntegration} />
      <Route path="/gamified-teaching" component={GamifiedTeaching} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
