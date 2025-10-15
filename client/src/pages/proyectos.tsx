import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProyectoSchema, type Proyecto, type InsertProyecto } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Proyectos() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProyecto, setEditingProyecto] = useState<Proyecto | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: proyectos, isLoading } = useQuery({
    queryKey: ["/api/proyectos"],
  });

  const { data: comunas } = useQuery({
    queryKey: ["/api/comunas"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertProyecto) => apiRequest("POST", "/api/proyectos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proyectos"] });
      setIsCreateOpen(false);
      toast({ title: "Proyecto creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear proyecto", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id_proyecto, data }: { id_proyecto: number; data: Partial<InsertProyecto> }) =>
      apiRequest("PUT", `/api/proyectos/${id_proyecto}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proyectos"] });
      setEditingProyecto(null);
      toast({ title: "Proyecto actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar proyecto", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id_proyecto: number) => apiRequest("DELETE", `/api/proyectos/${id_proyecto}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/proyectos"] });
      toast({ title: "Proyecto eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar proyecto", variant: "destructive" });
    },
  });

  const form = useForm<InsertProyecto>({
    resolver: zodResolver(insertProyectoSchema),
    defaultValues: {
      id_comuna: 0,
      nombre: "",
      descripcion: "",
      estado: true,
    },
  });

  const onSubmit = (data: InsertProyecto) => {
    if (editingProyecto) {
      updateMutation.mutate({ id_proyecto: editingProyecto.id_proyecto, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (proyecto: Proyecto) => {
    setEditingProyecto(proyecto);
    form.reset({
      id_comuna: proyecto.id_comuna,
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion || "",
      estado: proyecto.estado,
    });
  };

  const handleDelete = (id_proyecto: number) => {
    if (confirm("¿Está seguro de que desea eliminar este proyecto?")) {
      deleteMutation.mutate(id_proyecto);
    }
  };

  const getComunaName = (id_comuna: number) => {
    const comuna = comunas?.find((c: any) => c.id_comuna === id_comuna);
    return comuna?.nombre || "N/A";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Proyectos Comunales</CardTitle>
            <Dialog open={isCreateOpen || !!editingProyecto} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingProyecto(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProyecto ? "Editar Proyecto" : "Crear Nuevo Proyecto"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Proyecto</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="descripcion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descripción</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="id_comuna"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comuna</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar comuna" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {comunas?.map((comuna: any) => (
                                <SelectItem key={comuna.id_comuna} value={comuna.id_comuna.toString()}>
                                  {comuna.nombre}
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
                          <FormLabel>Activo</FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Activo</SelectItem>
                                <SelectItem value="false">Inactivo</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateOpen(false);
                        setEditingProyecto(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingProyecto ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proyecto</TableHead>
                <TableHead>Comuna</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : proyectos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="py-8 text-gray-500">
                      <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay proyectos registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                proyectos?.map((proyecto: Proyecto) => (
                  <TableRow key={proyecto.id_proyecto}>
                    <TableCell>{proyecto.nombre}</TableCell>
                    <TableCell>{getComunaName(proyecto.id_comuna)}</TableCell>
                    <TableCell>{proyecto.descripcion}</TableCell>
                    <TableCell>
                      <Badge variant={proyecto.estado ? "default" : "destructive"}>
                        {proyecto.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(proyecto)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(proyecto.id_proyecto)}>
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