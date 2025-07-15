import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Vote, MapPin, Users, BarChart3 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [loginData, setLoginData] = useState({
    email: "",
    password: ""
  });

  const [registerData, setRegisterData] = useState({
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    contrasena: "",
    id_rol: 1
  });

  // Redirect if already authenticated
  if (user) {
    setLocation("/");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync({
        username: loginData.email,
        password: loginData.password
      });
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al Sistema de Control Electoral",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: "Credenciales inválidas. Por favor verifique sus datos.",
        variant: "destructive",
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await registerMutation.mutateAsync(registerData);
      toast({
        title: "Registro exitoso",
        description: "Su cuenta ha sido creada exitosamente",
      });
      setLocation("/");
    } catch (error) {
      toast({
        title: "Error en el registro",
        description: "No se pudo crear la cuenta. Por favor verifique sus datos.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side - Authentication Forms */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <Vote className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-800">
                Sistema de Control Electoral
              </CardTitle>
              <p className="text-gray-600 text-sm">
                Accede a tu cuenta o regístrate para continuar
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="register">Registrarse</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="********"
                        value={loginData.password}
                        onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Iniciando sesión..." : "Iniciar Sesión"}
                    </Button>
                  </form>
                  
                  {loginMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Error al iniciar sesión. Verifique sus credenciales.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
                
                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cedula">Cédula</Label>
                        <Input
                          id="cedula"
                          placeholder="V-12345678"
                          value={registerData.cedula}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, cedula: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="nombre">Nombre</Label>
                        <Input
                          id="nombre"
                          placeholder="Juan"
                          value={registerData.nombre}
                          onChange={(e) => setRegisterData(prev => ({ ...prev, nombre: e.target.value }))}
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apellido">Apellido</Label>
                      <Input
                        id="apellido"
                        placeholder="Pérez"
                        value={registerData.apellido}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, apellido: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="correo@ejemplo.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefono">Teléfono</Label>
                      <Input
                        id="telefono"
                        placeholder="0414-1234567"
                        value={registerData.telefono}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, telefono: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Contraseña</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="********"
                        value={registerData.contrasena}
                        onChange={(e) => setRegisterData(prev => ({ ...prev, contrasena: e.target.value }))}
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Registrando..." : "Registrarse"}
                    </Button>
                  </form>
                  
                  {registerMutation.error && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Error al registrar. Verifique sus datos.
                      </AlertDescription>
                    </Alert>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right side - Hero Section */}
        <div className="flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">
                Sistema de Control Electoral
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Gestión integral de procesos electorales en Venezuela
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <MapPin className="w-8 h-8 text-primary mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Gestión Territorial</h3>
                <p className="text-gray-600 text-sm">
                  Administra estados, municipios, parroquias y comunidades
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Users className="w-8 h-8 text-primary mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Control de Personal</h3>
                <p className="text-gray-600 text-sm">
                  Gestiona personal electoral y centros de votación
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <Vote className="w-8 h-8 text-primary mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Eventos Electorales</h3>
                <p className="text-gray-600 text-sm">
                  Organiza y monitorea eventos y procesos electorales
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <BarChart3 className="w-8 h-8 text-primary mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">Análisis y Reportes</h3>
                <p className="text-gray-600 text-sm">
                  Genera reportes y análisis de participación electoral
                </p>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Características del Sistema
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gestión completa de entidades geográficas</li>
                <li>• Control de usuarios y roles</li>
                <li>• Monitoreo de afluencia electoral</li>
                <li>• Gestión de consejos comunales</li>
                <li>• Reportes y estadísticas en tiempo real</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
