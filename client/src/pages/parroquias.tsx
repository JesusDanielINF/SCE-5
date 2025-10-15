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
import { insertParroquiaSchema, type Parroquia, type InsertParroquia } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Parroquias() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingParroquia, setEditingParroquia] = useState<Parroquia | null>(null);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: parroquias, isLoading } = useQuery({
    queryKey: ["/api/parroquias"],
  });

  const { data: municipios } = useQuery({
    queryKey: ["/api/municipios"],
  });

  const { data: estados } = useQuery({
    queryKey: ["/api/estados"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertParroquia) => apiRequest("POST", "/api/parroquias", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parroquias"] });
      setIsCreateOpen(false);
      toast({ title: "Parroquia creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear parroquia", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertParroquia> }) =>
      apiRequest("PUT", `/api/parroquias/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parroquias"] });
      setEditingParroquia(null);
      toast({ title: "Parroquia actualizada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar parroquia", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/parroquias/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parroquias"] });
      toast({ title: "Parroquia eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar parroquia", variant: "destructive" });
    },
  });

  const form = useForm<InsertParroquia>({
    resolver: zodResolver(insertParroquiaSchema),
    defaultValues: {
      name: "",
      municipioId: 0,
      estado: true,
    },
  });

  const onSubmit = (data: InsertParroquia) => {
    if (editingParroquia) {
      updateMutation.mutate({ id: editingParroquia.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (parroquia: Parroquia) => {
    setEditingParroquia(parroquia);
    form.reset({
      name: parroquia.name,
      municipioId: parroquia.municipioId,
      estado: parroquia.estado,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta parroquia?")) {
      deleteMutation.mutate(id);
    }
  };

  const getMunicipioName = (municipioId: number) => {
    const municipio = municipios?.find((m: any) => m.id === municipioId);
    return municipio?.name || "N/A";
  };

  const getEstadoName = (municipioId: number) => {
    const municipio = municipios?.find((m: any) => m.id === municipioId);
    if (!municipio) return "N/A";
    const estado = estados?.find((e: any) => e.id === municipio.estadoId);
    return estado?.name || "N/A";
  };

  const filteredParroquias = selectedMunicipio === "all" 
    ? parroquias 
    : parroquias?.filter((p: Parroquia) => p.municipioId === parseInt(selectedMunicipio));

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Parroquias</CardTitle>
            <Dialog open={isCreateOpen || !!editingParroquia} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingParroquia(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Parroquia
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingParroquia ? "Editar Parroquia" : "Crear Nueva Parroquia"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Parroquia</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="municipioId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Municipio</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar municipio" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {municipios?.map((municipio: any) => (
                                <SelectItem key={municipio.id} value={municipio.id.toString()}>
                                  {municipio.name}
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
                        setEditingParroquia(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingParroquia ? "Actualizar" : "Crear"}
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
            <Input placeholder="Buscar parroquias..." className="flex-1" />
            <Select value={selectedMunicipio} onValueChange={setSelectedMunicipio}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por municipio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Municipios</SelectItem>
                {municipios?.map((municipio: any) => (
                  <SelectItem key={municipio.id} value={municipio.id.toString()}>
                    {municipio.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Parroquia</TableHead>
                <TableHead>Municipio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : filteredParroquias?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="py-8 text-gray-500">
                      <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay parroquias registradas</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredParroquias?.map((parroquia: Parroquia) => (
                  <TableRow key={parroquia.id}>
                    <TableCell className="font-medium">{parroquia.name}</TableCell>
                    <TableCell>{getMunicipioName(parroquia.municipioId)}</TableCell>
                    <TableCell>{getEstadoName(parroquia.municipioId)}</TableCell>
                    <TableCell>{parroquia.estado ? "Activo" : "Inactivo"}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(parroquia)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(parroquia.id)}>
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