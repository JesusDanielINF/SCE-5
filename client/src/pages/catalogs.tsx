import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { setCSRFHeader, isUnauthorizedError } from "@/lib/authUtils";
import CatalogModal from "@/components/modals/CatalogModal";
import { Plus, Edit, Trash2, Tag, Users, Building, Shield } from "lucide-react";

interface Category {
  id: number;
  name: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: number;
  name: string;
  description: string;
  managerId: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Catalogs() {
  const [activeTab, setActiveTab] = useState<"categories" | "departments" | "roles">("categories");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<"category" | "department" | "role">("category");
  
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: departments, isLoading: departmentsLoading } = useQuery<Department[]>({
    queryKey: ["/api/departments"],
  });

  const { data: roles, isLoading: rolesLoading } = useQuery<Role[]>({
    queryKey: ["/api/roles"],
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      await apiRequest("DELETE", `/api/categories/${id}`, undefined, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({
        title: "Categoría eliminada",
        description: "La categoría se ha eliminado exitosamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para eliminar categorías",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo eliminar la categoría",
        variant: "destructive",
      });
    },
  });

  const deleteDepartmentMutation = useMutation({
    mutationFn: async (id: number) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      await apiRequest("DELETE", `/api/departments/${id}`, undefined, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/departments"] });
      toast({
        title: "Departamento eliminado",
        description: "El departamento se ha eliminado exitosamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para eliminar departamentos",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo eliminar el departamento",
        variant: "destructive",
      });
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: async (id: number) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      await apiRequest("DELETE", `/api/roles/${id}`, undefined, headers);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/roles"] });
      toast({
        title: "Rol eliminado",
        description: "El rol se ha eliminado exitosamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para eliminar roles",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo eliminar el rol",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: any, type: "category" | "department" | "role") => {
    setSelectedItem(item);
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number, type: "category" | "department" | "role") => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar este ${type === "category" ? "categoría" : type === "department" ? "departamento" : "rol"}?`)) {
      if (type === "category") {
        deleteCategoryMutation.mutate(id);
      } else if (type === "department") {
        deleteDepartmentMutation.mutate(id);
      } else {
        deleteRoleMutation.mutate(id);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleNew = (type: "category" | "department" | "role") => {
    setSelectedItem(null);
    setModalType(type);
    setIsModalOpen(true);
  };

  const CatalogCard = ({ title, items, type, isLoading, icon: Icon }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Icon className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          <Button
            onClick={() => handleNew(type)}
            className="btn-primary"
            size="sm"
            disabled={user?.role !== "admin"}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-2">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : items?.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Icon className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No hay {title.toLowerCase()} disponibles</p>
            </div>
          ) : (
            items?.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {type === "category" && (
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(item, type)}
                    className="text-blue-600 hover:text-blue-700"
                    disabled={user?.role !== "admin"}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id, type)}
                    className="text-red-600 hover:text-red-700"
                    disabled={user?.role !== "admin"}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 fade-in">
      {/* Admin Notice */}
      {user?.role !== "admin" && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <Shield className="h-5 w-5" />
              <span className="text-sm">
                Solo los administradores pueden crear, editar y eliminar elementos de catálogos
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Catalog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <CatalogCard
          title="Categorías"
          items={categories}
          type="category"
          isLoading={categoriesLoading}
          icon={Tag}
        />
        
        <CatalogCard
          title="Departamentos"
          items={departments}
          type="department"
          isLoading={departmentsLoading}
          icon={Building}
        />
        
        <CatalogCard
          title="Roles"
          items={roles}
          type="role"
          isLoading={rolesLoading}
          icon={Users}
        />
      </div>

      {/* Catalog Modal */}
      <CatalogModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        item={selectedItem}
        type={modalType}
      />
    </div>
  );
}
