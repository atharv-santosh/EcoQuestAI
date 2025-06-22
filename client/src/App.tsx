import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import InstallButton from "@/components/install-button";
import InstallPrompt from "@/components/install-prompt";
import Home from "@/pages/home";
import Hunt from "@/pages/hunt";
import Explore from "@/pages/explore";
import Badges from "@/pages/badges";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/hunt/:id" component={Hunt} />
      <Route path="/explore" component={Explore} />
      <Route path="/badges" component={Badges} />
      <Route path="/profile" component={Profile} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <InstallPrompt />
        <Toaster />
        <Router />
        <InstallButton />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
