import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import Register from "@/pages/register";
import CreateTest from "@/pages/create-test";
import EditTest from "@/pages/edit-test";
import TestLibrary from "@/pages/test-library";
import Students from "@/pages/students";
import Settings from "@/pages/settings";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/create-test" component={CreateTest} />
      <Route path="/edit-test/:id" component={EditTest} />
      <Route path="/test-library" component={TestLibrary} />
      <Route path="/students" component={Students} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
