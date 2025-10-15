import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { setCSRFHeader, isUnauthorizedError } from "@/lib/authUtils";
import { CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

interface User {
  id: number;
  cedula: string;
  username: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
}

export default function UserModal({ isOpen, onClose, user }: UserModalProps) {
  const [formData, setFormData] = useState({
    cedula: "",
    username: "",
    password: "",
    role: "user",
    isActive: true,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [cedulaValidation, setCedulaValidation] = useState<any>(null);
  const [cedulaError, setCedulaError] = useState<string | null>(null);

  const { validateCedula } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (user) {
      setFormData({
        cedula: user.cedula || "",
        username: user.username || "",
        password: "",
        role: user.role || "user",
        isActive: user.isActive,
      });
    } else {
      setFormData({
        cedula: "",
        username: "",
        password: "",
        role: "user",
        isActive: true,
      });
    }
    setCedulaValidation(null);
    setCedulaError(null);
  }, [user]);

  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("POST", "/api/users", userData, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario creado",
        description: "El usuario se ha creado exitosamente",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para crear usuarios",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, userData, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado exitosamente",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para actualizar usuarios",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario",
        variant: "destructive",
      });
    },
  });

  const handleCedulaValidation = async (cedula: string) => {
    if (!cedula.trim()) {
      setCedulaValidation(null);
      setCedulaError(null);
      return;
    }

    try {
      const personal = await validateCedula(cedula);
      if (personal) {
        setCedulaValidation(personal);
        setCedulaError(null);
        // Auto-fill username if not editing
        if (!user) {
          setFormData(prev => ({
            ...prev,
            username: personal.cedula,
          }));
        }
      }
    } catch (error) {
      setCedulaValidation(null);
      setCedulaError("Cédula no encontrada en la tabla de personal o está inactiva");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.cedula.trim() || !formData.username.trim()) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    if (!user && !formData.password.trim()) {
      toast({
        title: "Error",
        description: "La contraseña es requerida para usuarios nuevos",
        variant: "destructive",
      });
      return;
    }

    if (!cedulaValidation && !user) {
      toast({
        title: "Error",
        description: "Debes validar la cédula antes de crear el usuario",
        variant: "destructive",
      });
      return;
    }

    const userData = {
      cedula: formData.cedula,
      username: formData.username,
      role: formData.role,
      isActive: formData.isActive,
      ...(formData.password && { password: formData.password }),
    };

    if (user) {
      updateUserMutation.mutate(userData);
    } else {
      createUserMutation.mutate(userData);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));

    if (key === "cedula") {
      handleCedulaValidation(value);
    }
  };

  const isLoading = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="cedula" className="block text-sm font-medium text-gray-700 mb-2">
              Cédula *
            </Label>
            <Input
              id="cedula"
              value={formData.cedula}
              onChange={(e) => handleChange("cedula", e.target.value)}
              placeholder="Número de cédula"
              required
              disabled={!!user}
            />
            <p className="text-xs text-gray-500 mt-1">
              Se validará contra la tabla de personal
            </p>
            {cedulaError && (
              <div className="flex items-center mt-2 text-red-600">
                <XCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">{cedulaError}</span>
              </div>
            )}
            {cedulaValidation && (
              <div className="flex items-center mt-2 text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span className="text-sm">
                  Cédula válida - {cedulaValidation.firstName} {cedulaValidation.lastName}
                </span>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de Usuario *
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="Nombre de usuario"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña {!user && "*"}
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={user ? "Dejar vacío para no cambiar" : "Contraseña"}
                className="pr-10"
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

          <div>
            <Label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              Rol
            </Label>
            <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuario</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="supervisor">Supervisor</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleChange("isActive", checked)}
            />
            <Label htmlFor="isActive" className="text-sm text-gray-700">
              Usuario activo
            </Label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Guardando..." : user ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
