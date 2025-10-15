import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEstadoSchema, type Estado, type InsertEstado } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Estados() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEstado, setEditingEstado] = useState<Estado | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: estados, isLoading } = useQuery({
    queryKey: ["/api/estados"],
  });

  const { data: municipios } = useQuery({
    queryKey: ["/api/municipios"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertEstado) => apiRequest("POST", "/api/estados", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estados"] });
      setIsCreateOpen(false);
      toast({ title: "Estado creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear estado", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertEstado> }) =>
      apiRequest("PUT", `/api/estados/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estados"] });
      setEditingEstado(null);
      toast({ title: "Estado actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar estado", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/estados/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/estados"] });
      toast({ title: "Estado eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar estado", variant: "destructive" });
    },
  });

  const form = useForm<InsertEstado>({
    resolver: zodResolver(insertEstadoSchema),
    defaultValues: {
      name: "",
      code: "",
      region: "",
      population: undefined,
      area: undefined,
    },
  });

  const onSubmit = (data: InsertEstado) => {
    if (editingEstado) {
      updateMutation.mutate({ id: editingEstado.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (estado: Estado) => {
    setEditingEstado(estado);
    form.reset({
      name: estado.name,
      code: estado.code,
      region: estado.region || "",
      population: estado.population || undefined,
      area: estado.area || undefined,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este estado?")) {
      deleteMutation.mutate(id);
    }
  };

  const getMunicipiosCount = (estadoId: number) => {
    return municipios?.filter((m: any) => m.estadoId === estadoId).length || 0;
  };

  if (isLoading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Estados de Venezuela</CardTitle>
            <Dialog open={isCreateOpen || !!editingEstado} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingEstado(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Estado
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEstado ? "Editar Estado" : "Crear Nuevo Estado"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Estado</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Miranda, Carabobo" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: MI, CA" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="region"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Región</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Ej: Central, Capital" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="population"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Población</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="Habitantes"
                                onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área (km²)</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                step="0.01"
                                placeholder="Área en km²"
                                onChange={(e) => field.onChange(e.target.value || undefined)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateOpen(false);
                        setEditingEstado(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingEstado ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {estados?.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No hay estados registrados</p>
              </div>
            ) : (
              estados?.map((estado: Estado) => (
                <div key={estado.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{estado.name}</h3>
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(estado)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(estado.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Código:</span>
                      <span className="font-medium">{estado.code}</span>
                    </div>
                    {estado.region && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Región:</span>
                        <span className="font-medium">{estado.region}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Municipios:</span>
                      <span className="font-medium">{getMunicipiosCount(estado.id)}</span>
                    </div>
                    {estado.population && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Población:</span>
                        <span className="font-medium">{estado.population.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
