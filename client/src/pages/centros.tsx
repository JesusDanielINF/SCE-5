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
import { Plus, Edit, Trash2, School } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCentroVotacionSchema, type CentroVotacion, type InsertCentroVotacion } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Centros() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCentro, setEditingCentro] = useState<CentroVotacion | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: centros, isLoading } = useQuery({
    queryKey: ["/api/centros"],
  });

  const { data: ubicaciones } = useQuery({
    queryKey: ["/api/ubicaciones"],
  });

  const { data: personal } = useQuery({
    queryKey: ["/api/personal"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertCentroVotacion) => apiRequest("POST", "/api/centros", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/centros"] });
      setIsCreateOpen(false);
      toast({ title: "Centro de votación creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear centro de votación", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertCentroVotacion> }) =>
      apiRequest("PUT", `/api/centros/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/centros"] });
      setEditingCentro(null);
      toast({ title: "Centro de votación actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar centro de votación", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/centros/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/centros"] });
      toast({ title: "Centro de votación eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar centro de votación", variant: "destructive" });
    },
  });

  const form = useForm<InsertCentroVotacion>({
    resolver: zodResolver(insertCentroVotacionSchema),
    defaultValues: {
      nombre: "",
      codigo: 0,
      id_persona: undefined,
      id_ubicacion: undefined,
      mesas: 0,
      estado: true,
    },
  });

  const onSubmit = (data: InsertCentroVotacion) => {
    if (editingCentro) {
      updateMutation.mutate({ id: editingCentro.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (centro: CentroVotacion) => {
    setEditingCentro(centro);
    form.reset({
      nombre: centro.nombre,
      codigo: centro.codigo,
      id_persona: centro.id_persona || undefined,
      id_ubicacion: centro.id_ubicacion || undefined,
      mesas: centro.mesas,
      estado: centro.estado,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este centro de votación?")) {
      deleteMutation.mutate(id);
    }
  };

  const getPersonalName = (personaId: number | null) => {
    if (!personaId) return "N/A";
    const persona = personal?.find((p: any) => p.id === personaId);
    return persona ? `${persona.nombre} ${persona.apellido}` : "N/A";
  };

  const getUbicacionName = (ubicacionId: number | null) => {
    if (!ubicacionId) return "N/A";
    const ubicacion = ubicaciones?.find((u: any) => u.id === ubicacionId);
    return ubicacion?.name || "N/A";
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Centros de Votación</CardTitle>
            <Dialog open={isCreateOpen || !!editingCentro} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingCentro(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Centro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingCentro ? "Editar Centro de Votación" : "Crear Nuevo Centro de Votación"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del Centro</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="codigo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="001" 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="mesas"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de Mesas</FormLabel>
                            <FormControl>
                              <Input 
                                {...field} 
                                type="number" 
                                placeholder="1"
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="id_persona"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Persona Responsable</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar persona" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sin persona</SelectItem>
                              {personal?.map((persona: any) => (
                                <SelectItem key={persona.id} value={persona.id.toString()}>
                                  {persona.nombre} {persona.apellido}
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
                      name="id_ubicacion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ubicación</FormLabel>
                          <Select onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)} value={field.value?.toString()}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar ubicación" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="">Sin ubicación</SelectItem>
                              {ubicaciones?.map((ubicacion: any) => (
                                <SelectItem key={ubicacion.id} value={ubicacion.id.toString()}>
                                  {ubicacion.nombre}
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
                        setEditingCentro(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingCentro ? "Actualizar" : "Crear"}
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
            <Input placeholder="Buscar centros..." className="flex-1" />
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los Estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Centro</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Persona</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Mesas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : centros?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="py-8 text-gray-500">
                      <School className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay centros de votación registrados</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                centros?.map((centro: CentroVotacion) => (
                  <TableRow key={centro.id}>
                    <TableCell className="font-medium">{centro.nombre}</TableCell>
                    <TableCell>{centro.codigo}</TableCell>
                    <TableCell>{getPersonalName(centro.id_persona)}</TableCell>
                    <TableCell>{getUbicacionName(centro.id_ubicacion)}</TableCell>
                    <TableCell>{centro.mesas}</TableCell>
                    <TableCell>
                      <Badge variant={centro.estado ? "default" : "destructive"}>
                        {centro.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(centro)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(centro.id)}>
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