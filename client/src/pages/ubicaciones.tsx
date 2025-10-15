import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MapPinOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUbicacionSchema, type Ubicacion, type InsertUbicacion } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Ubicaciones() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUbicacion, setEditingUbicacion] = useState<Ubicacion | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: ubicaciones, isLoading } = useQuery({
    queryKey: ["/api/ubicaciones"],
  });

  const { data: comunidades } = useQuery({
    queryKey: ["/api/comunidades"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertUbicacion) => apiRequest("POST", "/api/ubicaciones", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ubicaciones"] });
      setIsCreateOpen(false);
      toast({ title: "Ubicación creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear ubicación", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertUbicacion> }) =>
      apiRequest("PUT", `/api/ubicaciones/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ubicaciones"] });
      setEditingUbicacion(null);
      toast({ title: "Ubicación actualizada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar ubicación", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/ubicaciones/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ubicaciones"] });
      toast({ title: "Ubicación eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar ubicación", variant: "destructive" });
    },
  });

  const form = useForm<InsertUbicacion>({
    resolver: zodResolver(insertUbicacionSchema),
    defaultValues: {
      name: "",
      comunidadId: undefined,
      calle: "",
      avenida: "",
      referencia: "",
      estado: true,
    },
  });

  const onSubmit = (data: InsertUbicacion) => {
    if (editingUbicacion) {
      updateMutation.mutate({ id: editingUbicacion.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (ubicacion: Ubicacion) => {
    setEditingUbicacion(ubicacion);
    form.reset({
      name: ubicacion.name,
      comunidadId: ubicacion.comunidadId || undefined,
      calle: ubicacion.calle || "",
      avenida: ubicacion.avenida || "",
      referencia: ubicacion.referencia || "",
      estado: ubicacion.estado,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta ubicación?")) {
      deleteMutation.mutate(id);
    }
  };

  const getComunidadName = (comunidadId: number | null) => {
    if (!comunidadId) return "N/A";
    const comunidad = comunidades?.find((c: any) => c.id === comunidadId);
    return comunidad?.name || "N/A";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Ubicaciones</CardTitle>
            <Dialog open={isCreateOpen || !!editingUbicacion} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingUbicacion(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Ubicación
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingUbicacion ? "Editar Ubicación" : "Crear Nueva Ubicación"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Ubicación</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="comunidadId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comunidad</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString() || ""}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar comunidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sin comunidad</SelectItem>
                              {comunidades?.map((comunidad: any) => (
                                <SelectItem key={comunidad.id} value={comunidad.id.toString()}>
                                  {comunidad.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="calle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calle</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="avenida"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Avenida</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="referencia"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Referencia</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
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
                        setEditingUbicacion(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingUbicacion ? "Actualizar" : "Crear"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Input placeholder="Buscar ubicaciones..." className="flex-1 max-w-md" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Calle</TableHead>
                <TableHead>Avenida</TableHead>
                <TableHead>Referencia</TableHead>
                <TableHead>Comunidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : ubicaciones?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="py-8 text-gray-500">
                      <MapPinOff className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay ubicaciones registradas</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                ubicaciones?.map((ubicacion: Ubicacion) => (
                  <TableRow key={ubicacion.id}>
                    <TableCell className="font-medium">{ubicacion.name}</TableCell>
                    <TableCell>{ubicacion.calle}</TableCell>
                    <TableCell>{ubicacion.avenida}</TableCell>
                    <TableCell className="max-w-xs truncate">{ubicacion.referencia}</TableCell>
                    <TableCell>{getComunidadName(ubicacion.comunidadId)}</TableCell>
                    <TableCell>
                      <Badge variant={ubicacion.estado ? "default" : "destructive"}>
                        {ubicacion.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(ubicacion)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(ubicacion.id)}>
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