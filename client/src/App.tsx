import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Map from "@/pages/map";

// Importa los componentes para las nuevas rutas
import Users from "@/pages/users";
import Roles from "@/pages/roles";
import Estados from "@/pages/estados";
import Municipios from "@/pages/municipios";
import Parroquias from "@/pages/parroquias";
import Comunidades from "@/pages/comunidades";
import Ubicaciones from "@/pages/ubicaciones";
import Personal from "@/pages/personal";
import Centros from "@/pages/centros";
import Eventos from "@/pages/eventos";
import Afluencia from "@/pages/afluencia";
import Comunas from "@/pages/comunas";
import Proyectos from "@/pages/proyectos";
import Consejos from "@/pages/consejos";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/map" component={Map} />

      {/* Nuevas rutas protegidas */}
      <ProtectedRoute path="/users" component={Users} />
      <ProtectedRoute path="/roles" component={Roles} />
      <ProtectedRoute path="/estados" component={Estados} />
      <ProtectedRoute path="/municipios" component={Municipios} />
      <ProtectedRoute path="/parroquias" component={Parroquias} />
      <ProtectedRoute path="/comunidades" component={Comunidades} />
      <ProtectedRoute path="/ubicaciones" component={Ubicaciones} />
      <ProtectedRoute path="/personal" component={Personal} />
      <ProtectedRoute path="/centros" component={Centros} />
      <ProtectedRoute path="/eventos" component={Eventos} />
      <ProtectedRoute path="/afluencia" component={Afluencia} />
      <ProtectedRoute path="/comunas" component={Comunas} />
      <ProtectedRoute path="/proyectos" component={Proyectos} />
      <ProtectedRoute path="/consejos" component={Consejos} />

      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
