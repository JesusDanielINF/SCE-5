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
import { Plus, Edit, Trash2, Calendar } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEventoSchema, type Evento, type InsertEvento } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

export default function Eventos() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Evento | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: eventos, isLoading } = useQuery({
    queryKey: ["/api/eventos"],
  });

  const { data: centros } = useQuery({
    queryKey: ["/api/centros-de-votacion"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertEvento) => apiRequest("POST", "/api/eventos", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos"] });
      setIsCreateOpen(false);
      toast({ title: "Evento creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear evento", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id_evento, data }: { id_evento: number; data: Partial<InsertEvento> }) =>
      apiRequest("PUT", `/api/eventos/${id_evento}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos"] });
      setEditingEvento(null);
      toast({ title: "Evento actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar evento", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id_evento: number) => apiRequest("DELETE", `/api/eventos/${id_evento}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos"] });
      toast({ title: "Evento eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar evento", variant: "destructive" });
    },
  });

  const form = useForm<InsertEvento>({
    resolver: zodResolver(insertEventoSchema),
    defaultValues: {
      id_ce: 0,
      nombre: "",
      fecha_evento: new Date(),
      estado: true,
    },
  });

  const onSubmit = (data: InsertEvento) => {
    if (editingEvento) {
      updateMutation.mutate({ id_evento: editingEvento.id_evento, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (evento: Evento) => {
    setEditingEvento(evento);
    form.reset({
      id_ce: evento.id_ce,
      nombre: evento.nombre,
      fecha_evento: new Date(evento.fecha_evento),
      estado: evento.estado,
    });
  };

  const handleDelete = (id_evento: number) => {
    if (confirm("¿Está seguro de que desea eliminar este evento?")) {
      deleteMutation.mutate(id_evento);
    }
  };

  const getCentroName = (id_ce: number) => {
    const centro = centros?.find((c: any) => c.id_ce === id_ce);
    return centro?.nombre || "N/A";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Eventos Electorales</CardTitle>
            <Dialog open={isCreateOpen || !!editingEvento} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingEvento(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Evento
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingEvento ? "Editar Evento" : "Crear Nuevo Evento"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Evento</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="id_ce"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Centro de Votación</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar centro" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {centros?.map((centro: any) => (
                                <SelectItem key={centro.id_ce} value={centro.id_ce.toString()}>
                                  {centro.nombre}
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
                      name="fecha_evento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha del Evento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="datetime-local"
                              value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ""}
                              onChange={(e) => field.onChange(new Date(e.target.value))}
                            />
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
                          <FormLabel>Activo</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex justify-end space-x-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => {
                        setIsCreateOpen(false);
                        setEditingEvento(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingEvento ? "Actualizar" : "Crear"}
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
                <TableHead>Evento</TableHead>
                <TableHead>Centro de Votación</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : eventos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="py-8 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay eventos registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                eventos?.map((evento: Evento) => (
                  <TableRow key={evento.id_evento}>
                    <TableCell>{evento.nombre}</TableCell>
                    <TableCell>{getCentroName(evento.id_ce)}</TableCell>
                    <TableCell>{format(new Date(evento.fecha_evento), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell>
                      <Badge variant={evento.estado ? "default" : "destructive"}>
                        {evento.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(evento)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(evento.id_evento)}>
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