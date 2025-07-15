import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { DataTable } from "@/components/tables/data-table";
import { UserModal } from "@/components/modals/user-modal";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, User } from "lucide-react";
import type { User } from "@shared/schema";

export default function Users() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["/api/roles"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario ha sido eliminado exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = (user: User) => {
    if (confirm("¿Está seguro de que desea eliminar este usuario?")) {
      deleteMutation.mutate(user.id);
    }
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const getRoleName = (roleId: number | null) => {
    if (!roleId) return "Sin rol";
    const role = roles.find(r => r.id_rol === roleId);
    return role?.nombre || "Sin rol";
  };

  const columns = [
    {
      key: "nombre",
      label: "Usuario",
      render: (value: string, item: User) => (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{item.nombre} {item.apellido}</div>
            <div className="text-sm text-gray-500">{item.cedula}</div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "telefono",
      label: "Teléfono",
    },
    {
      key: "id_rol",
      label: "Rol",
      render: (value: number | null) => (
        <Badge variant="outline">{getRoleName(value)}</Badge>
      ),
    },
    {
      key: "estado",
      label: "Estado",
      render: (value: boolean) => (
        <Badge variant={value ? "default" : "destructive"}>
          {value ? "Activo" : "Inactivo"}
        </Badge>
      ),
    },
    {
      key: "fecha_registro",
      label: "Fecha de Registro",
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 pt-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Usuarios</h1>
              <p className="text-gray-600">Gestión de usuarios del sistema</p>
            </div>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <DataTable
              data={users}
              columns={columns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar usuarios..."
              isLoading={isLoading}
            />
          </div>

          <UserModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            user={selectedUser}
          />
        </main>
      </div>
    </div>
  );
}
