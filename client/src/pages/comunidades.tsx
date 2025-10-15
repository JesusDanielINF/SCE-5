import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Home } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertComunidadSchema, type Comunidad, type InsertComunidad } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Comunidades() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingComunidad, setEditingComunidad] = useState<Comunidad | null>(null);
  const [selectedParroquia, setSelectedParroquia] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comunidades, isLoading } = useQuery({
    queryKey: ["/api/comunidades"],
  });

  const { data: parroquias } = useQuery({
    queryKey: ["/api/parroquias"],
  });

  const { data: municipios } = useQuery({
    queryKey: ["/api/municipios"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertComunidad) => apiRequest("POST", "/api/comunidades", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunidades"] });
      setIsCreateOpen(false);
      toast({ title: "Comunidad creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear comunidad", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertComunidad> }) =>
      apiRequest("PUT", `/api/comunidades/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunidades"] });
      setEditingComunidad(null);
      toast({ title: "Comunidad actualizada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar comunidad", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/comunidades/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunidades"] });
      toast({ title: "Comunidad eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar comunidad", variant: "destructive" });
    },
  });

  const form = useForm<InsertComunidad>({
    resolver: zodResolver(insertComunidadSchema),
    defaultValues: {
      name: "",
      parroquiaId: 0,
      estado: true,
    },
  });

  const onSubmit = (data: InsertComunidad) => {
    if (editingComunidad) {
      updateMutation.mutate({ id: editingComunidad.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (comunidad: Comunidad) => {
    setEditingComunidad(comunidad);
    form.reset({
      name: comunidad.name,
      parroquiaId: comunidad.parroquiaId,
      estado: comunidad.estado,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta comunidad?")) {
      deleteMutation.mutate(id);
    }
  };

  const getParroquiaName = (parroquiaId: number) => {
    const parroquia = parroquias?.find((p: any) => p.id === parroquiaId);
    return parroquia?.name || "N/A";
  };

  const getMunicipioName = (parroquiaId: number) => {
    const parroquia = parroquias?.find((p: any) => p.id === parroquiaId);
    if (!parroquia) return "N/A";
    const municipio = municipios?.find((m: any) => m.id === parroquia.municipioId);
    return municipio?.name || "N/A";
  };

  const filteredComunidades = selectedParroquia === "all" 
    ? comunidades 
    : comunidades?.filter((c: Comunidad) => c.parroquiaId === parseInt(selectedParroquia));

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Comunidades</CardTitle>
            <Dialog open={isCreateOpen || !!editingComunidad} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingComunidad(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Comunidad
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingComunidad ? "Editar Comunidad" : "Crear Nueva Comunidad"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Comunidad</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="parroquiaId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parroquia</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar parroquia" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {parroquias?.map((parroquia: any) => (
                                <SelectItem key={parroquia.id} value={parroquia.id.toString()}>
                                  {parroquia.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado (Activo/Inactivo)</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "true")} 
                            value={field.value ? "true" : "false"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="true">Activo</SelectItem>
                              <SelectItem value="false">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateOpen(false);
                        setEditingComunidad(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingComunidad ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4 mb-6">
            <Input placeholder="Buscar comunidades..." className="flex-1" />
            <Select value={selectedParroquia} onValueChange={setSelectedParroquia}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por parroquia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las Parroquias</SelectItem>
                {parroquias?.map((parroquia: any) => (
                  <SelectItem key={parroquia.id} value={parroquia.id.toString()}>
                    {parroquia.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Comunidad</TableHead>
                <TableHead>Parroquia</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : filteredComunidades?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="py-8 text-gray-500">
                      <Home className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay comunidades registradas</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredComunidades?.map((comunidad: Comunidad) => (
                  <TableRow key={comunidad.id}>
                    <TableCell className="font-medium">{comunidad.name}</TableCell>
                    <TableCell>{getParroquiaName(comunidad.parroquiaId)}</TableCell>
                    <TableCell>{getMunicipioName(comunidad.parroquiaId)}</TableCell>
                    <TableCell>{comunidad.estado ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(comunidad)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(comunidad.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}