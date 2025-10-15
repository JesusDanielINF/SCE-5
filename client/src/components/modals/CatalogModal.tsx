import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setCSRFHeader, isUnauthorizedError } from "@/lib/authUtils";

interface CatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: any;
  type: "category" | "department" | "role";
}

export default function CatalogModal({ isOpen, onClose, item, type }: CatalogModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#1976D2",
    managerId: "",
    permissions: [] as string[],
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        color: item.color || "#1976D2",
        managerId: item.managerId?.toString() || "",
        permissions: item.permissions || [],
      });
    } else {
      setFormData({
        name: "",
        description: "",
        color: "#1976D2",
        managerId: "",
        permissions: [],
      });
    }
  }, [item]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("POST", `/api/${type === "category" ? "categories" : type === "department" ? "departments" : "roles"}`, data, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type === "category" ? "categories" : type === "department" ? "departments" : "roles"}`] });
      toast({
        title: `${type === "category" ? "Categoría" : type === "department" ? "Departamento" : "Rol"} creado`,
        description: `El ${type === "category" ? "categoría" : type === "department" ? "departamento" : "rol"} se ha creado exitosamente`,
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: `No tienes permisos para crear ${type === "category" ? "categorías" : type === "department" ? "departamentos" : "roles"}`,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: `No se pudo crear el ${type === "category" ? "categoría" : type === "department" ? "departamento" : "rol"}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("PUT", `/api/${type === "category" ? "categories" : type === "department" ? "departments" : "roles"}/${item?.id}`, data, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/${type === "category" ? "categories" : type === "department" ? "departments" : "roles"}`] });
      toast({
        title: `${type === "category" ? "Categoría" : type === "department" ? "Departamento" : "Rol"} actualizado`,
        description: `El ${type === "category" ? "categoría" : type === "department" ? "departamento" : "rol"} se ha actualizado exitosamente`,
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: `No tienes permisos para actualizar ${type === "category" ? "categorías" : type === "department" ? "departamentos" : "roles"}`,
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: `No se pudo actualizar el ${type === "category" ? "categoría" : type === "department" ? "departamento" : "rol"}`,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return;
    }

    const data: any = {
      name: formData.name,
      description: formData.description,
    };

    if (type === "category") {
      data.color = formData.color;
    } else if (type === "department") {
      if (formData.managerId) {
        data.managerId = parseInt(formData.managerId);
      }
    } else if (type === "role") {
      data.permissions = formData.permissions;
    }

    if (item) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, permission]
        : prev.permissions.filter(p => p !== permission),
    }));
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  const getTitle = () => {
    const action = item ? "Editar" : "Crear";
    const entity = type === "category" ? "Categoría" : type === "department" ? "Departamento" : "Rol";
    return `${action} ${entity}`;
  };

  const availablePermissions = [
    { key: "create_events", label: "Crear eventos" },
    { key: "edit_events", label: "Editar eventos" },
    { key: "delete_events", label: "Eliminar eventos" },
    { key: "view_reports", label: "Ver reportes" },
    { key: "generate_reports", label: "Generar reportes" },
    { key: "manage_users", label: "Gestionar usuarios" },
    { key: "manage_catalogs", label: "Gestionar catálogos" },
    { key: "manage_backups", label: "Gestionar respaldos" },
    { key: "manage_security", label: "Gestionar seguridad" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder={`Nombre del ${type === "category" ? "categoría" : type === "department" ? "departamento" : "rol"}`}
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder={`Descripción del ${type === "category" ? "categoría" : type === "department" ? "departamento" : "rol"}`}
              rows={3}
            />
          </div>

          {type === "category" && (
            <div>
              <Label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="w-16 h-10"
                />
                <span className="text-sm text-gray-500">{formData.color}</span>
              </div>
            </div>
          )}

          {type === "role" && (
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Permisos
              </Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availablePermissions.map((permission) => (
                  <div key={permission.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.key}
                      checked={formData.permissions.includes(permission.key)}
                      onCheckedChange={(checked) => handlePermissionChange(permission.key, checked as boolean)}
                    />
                    <Label htmlFor={permission.key} className="text-sm text-gray-700">
                      {permission.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Guardando..." : item ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
