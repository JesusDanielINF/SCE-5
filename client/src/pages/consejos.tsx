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
import { Plus, Edit, Trash2, Handshake } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertConsejoComunalSchema, type ConsejoComunal, type InsertConsejoComunal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

export default function Consejos() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingConsejo, setEditingConsejo] = useState<ConsejoComunal | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: consejos, isLoading } = useQuery({
    queryKey: ["/api/consejo-comunal"],
  });

  const { data: eventoccs } = useQuery({
    queryKey: ["/api/eventocc"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertConsejoComunal) => apiRequest("POST", "/api/consejo-comunal", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consejo-comunal"] });
      setIsCreateOpen(false);
      toast({ title: "Consejo comunal creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear consejo comunal", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id_consejo, data }: { id_consejo: number; data: Partial<InsertConsejoComunal> }) =>
      apiRequest("PUT", `/api/consejo-comunal/${id_consejo}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consejo-comunal"] });
      setEditingConsejo(null);
      toast({ title: "Consejo comunal actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar consejo comunal", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id_consejo: number) => apiRequest("DELETE", `/api/consejo-comunal/${id_consejo}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consejo-comunal"] });
      toast({ title: "Consejo comunal eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar consejo comunal", variant: "destructive" });
    },
  });

  const form = useForm<InsertConsejoComunal>({
    resolver: zodResolver(insertConsejoComunalSchema),
    defaultValues: {
      id_cc: 0,
      nombre: "",
      apellido: "",
      rif: "",
      fecha_eleccion: "",
      cantidad_electores: 0,
      estado: true,
    },
  });

  const onSubmit = (data: InsertConsejoComunal) => {
    if (editingConsejo) {
      updateMutation.mutate({ id_consejo: editingConsejo.id_consejo, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (consejo: ConsejoComunal) => {
    setEditingConsejo(consejo);
    form.reset({
      id_cc: consejo.id_cc,
      nombre: consejo.nombre,
      apellido: consejo.apellido,
      rif: consejo.rif,
      fecha_eleccion: consejo.fecha_eleccion ? format(new Date(consejo.fecha_eleccion), "yyyy-MM-dd") : "",
      cantidad_electores: consejo.cantidad_electores,
      estado: consejo.estado,
    });
  };

  const handleDelete = (id_consejo: number) => {
    if (confirm("¿Está seguro de que desea eliminar este consejo comunal?")) {
      deleteMutation.mutate(id_consejo);
    }
  };

  const getEventoccName = (id_cc: number) => {
    const eventocc = eventoccs?.find((e: any) => e.id_cc === id_cc);
    return eventocc?.nombre || "N/A";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Consejos Comunales</CardTitle>
            <Dialog open={isCreateOpen || !!editingConsejo} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingConsejo(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Consejo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingConsejo ? "Editar Consejo Comunal" : "Crear Nuevo Consejo Comunal"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="id_cc"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Evento Comunal</FormLabel>
                          <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar evento comunal" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {eventoccs?.map((eventocc: any) => (
                                <SelectItem key={eventocc.id_cc} value={eventocc.id_cc.toString()}>
                                  {eventocc.nombre}
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
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="apellido"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="rif"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RIF</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="fecha_eleccion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Elección</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="date"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cantidad_electores"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cantidad de Electores</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min={0} />
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
                        setEditingConsejo(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingConsejo ? "Actualizar" : "Crear"}
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
                <TableHead>Evento Comunal</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Apellido</TableHead>
                <TableHead>RIF</TableHead>
                <TableHead>Fecha Elección</TableHead>
                <TableHead>Cantidad Electores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : consejos?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    <div className="py-8 text-gray-500">
                      <Handshake className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay consejos comunales registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                consejos?.map((consejo: ConsejoComunal) => (
                  <TableRow key={consejo.id_consejo}>
                    <TableCell>{getEventoccName(consejo.id_cc)}</TableCell>
                    <TableCell>{consejo.nombre}</TableCell>
                    <TableCell>{consejo.apellido}</TableCell>
                    <TableCell>{consejo.rif}</TableCell>
                    <TableCell>{consejo.fecha_eleccion ? format(new Date(consejo.fecha_eleccion), "dd/MM/yyyy") : "N/A"}</TableCell>
                    <TableCell>{consejo.cantidad_electores}</TableCell>
                    <TableCell>
                      <Badge variant={consejo.estado ? "default" : "destructive"}>
                        {consejo.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(consejo)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(consejo.id_consejo)}>
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