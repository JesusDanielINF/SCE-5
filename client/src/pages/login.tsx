import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Shield, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    cedula: "",
    username: "",
    password: "",
    rememberMe: false,
  });
  const [step, setStep] = useState<"cedula" | "credentials">("cedula");
  
  const { login, validateCedula, isLoginLoading, isValidatingCedula, loginError, cedulaValidation, cedulaError } = useAuth();
  const { toast } = useToast();

  const handleCedulaValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.cedula.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu cédula",
        variant: "destructive",
      });
      return;
    }

    try {
      const personal = await validateCedula(formData.cedula);
      if (personal) {
        setStep("credentials");
        setFormData(prev => ({
          ...prev,
          username: personal.cedula, // Use cedula as default username
        }));
        toast({
          title: "Cédula válida",
          description: `Bienvenido ${personal.firstName} ${personal.lastName}`,
          variant: "default",
        });
      }
    } catch (error) {
      toast({
        title: "Cédula no válida",
        description: "La cédula no está registrada en el sistema o está inactiva",
        variant: "destructive",
      });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username.trim() || !formData.password.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
      
      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido al sistema",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Credenciales inválidas",
        variant: "destructive",
      });
    }
  };

  const handleBackToCedula = () => {
    setStep("cedula");
    setFormData(prev => ({ ...prev, username: "", password: "" }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-8">
          <div className="text-center mb-8">
            <div className="bg-blue-600 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Iniciar Sesión</h1>
            <p className="text-gray-600 mt-2">
              {step === "cedula" 
                ? "Ingresa tu cédula para validar tu acceso" 
                : "Ingresa tus credenciales para acceder al sistema"
              }
            </p>
          </div>

          {step === "cedula" ? (
            <form onSubmit={handleCedulaValidation} className="space-y-6">
              <div>
                <Label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-2">
                  Cédula
                </Label>
                <Input
                  id="cedula"
                  type="text"
                  value={formData.cedula}
                  onChange={(e) => setFormData(prev => ({ ...prev, cedula: e.target.value }))}
                  placeholder="Ingresa tu cédula"
                  className="w-full"
                  disabled={isValidatingCedula}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se validará contra la tabla de personal
                </p>
                {cedulaError && (
                  <div className="flex items-center mt-2 text-red-600">
                    <XCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Cédula no encontrada o inactiva</span>
                  </div>
                )}
                {cedulaValidation && (
                  <div className="flex items-center mt-2 text-green-600">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    <span className="text-sm">Cédula válida</span>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isValidatingCedula}
              >
                {isValidatingCedula ? "Validando..." : "Validar Cédula"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Nombre de usuario"
                  className="w-full"
                  disabled={isLoginLoading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Contraseña"
                    className="w-full pr-10"
                    disabled={isLoginLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Checkbox
                    id="rememberMe"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))
                    }
                  />
                  <Label htmlFor="rememberMe" className="ml-2 text-sm text-gray-600">
                    Recordarme
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleBackToCedula}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Cambiar cédula
                </button>
              </div>

              {loginError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <XCircle className="h-4 w-4 text-red-500 mr-2" />
                    <span className="text-sm text-red-700">
                      {loginError.message || "Error de autenticación"}
                    </span>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className="w-full btn-primary"
                disabled={isLoginLoading}
              >
                {isLoginLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Solicitar acceso
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
