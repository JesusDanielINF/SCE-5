import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Edit, Trash2, Building } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMunicipioSchema, type Municipio, type InsertMunicipio } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Municipios() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMunicipio, setEditingMunicipio] = useState<Municipio | null>(null);
  const [selectedEstado, setSelectedEstado] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: municipios, isLoading } = useQuery({
    queryKey: ["/api/municipios"],
  });

  const { data: estados } = useQuery({
    queryKey: ["/api/estados"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertMunicipio) => apiRequest("POST", "/api/municipios", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/municipios"] });
      setIsCreateOpen(false);
      toast({ title: "Municipio creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear municipio", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertMunicipio> }) =>
      apiRequest("PUT", `/api/municipios/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/municipios"] });
      setEditingMunicipio(null);
      toast({ title: "Municipio actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar municipio", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/municipios/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/municipios"] });
      toast({ title: "Municipio eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar municipio", variant: "destructive" });
    },
  });

  const form = useForm<InsertMunicipio>({
    resolver: zodResolver(insertMunicipioSchema),
    defaultValues: {
      name: "",
      estadoId: 0,
      estado: true,
    },
  });

  const onSubmit = (data: InsertMunicipio) => {
    if (editingMunicipio) {
      updateMutation.mutate({ id: editingMunicipio.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (municipio: Municipio) => {
    setEditingMunicipio(municipio);
    form.reset({
      name: municipio.name,
      estadoId: municipio.estadoId,
      estado: municipio.estado,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este municipio?")) {
      deleteMutation.mutate(id);
    }
  };

  const getEstadoName = (estadoId: number) => {
    const estado = estados?.find((e: any) => e.id === estadoId);
    return estado?.name || "N/A";
  };

  const filteredMunicipios = selectedEstado === "all" 
    ? municipios 
    : municipios?.filter((m: Municipio) => m.estadoId === parseInt(selectedEstado));

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Municipios</CardTitle>
            <Dialog open={isCreateOpen || !!editingMunicipio} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingMunicipio(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Municipio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMunicipio ? "Editar Municipio" : "Crear Nuevo Municipio"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Municipio</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="estadoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {estados?.map((estado: any) => (
                                <SelectItem key={estado.id} value={estado.id.toString()}>
                                  {estado.name}
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
                        setEditingMunicipio(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingMunicipio ? "Actualizar" : "Crear"}
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
            <Input placeholder="Buscar municipios..." className="flex-1" />
            <Select value={selectedEstado} onValueChange={setSelectedEstado}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                {estados?.map((estado: any) => (
                  <SelectItem key={estado.id} value={estado.id.toString()}>
                    {estado.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : filteredMunicipios?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    <div className="py-8 text-gray-500">
                      <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay municipios registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredMunicipios?.map((municipio: Municipio) => (
                  <TableRow key={municipio.id}>
                    <TableCell className="font-medium">{municipio.name}</TableCell>
                    <TableCell>{getEstadoName(municipio.estadoId)}</TableCell>
                    <TableCell>{municipio.estado ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(municipio)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(municipio.id)}>
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