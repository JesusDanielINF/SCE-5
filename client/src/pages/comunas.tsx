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
import { Plus, Edit, Trash2, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertComunaSchema, type Comuna, type InsertComuna } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Comunas() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingComuna, setEditingComuna] = useState<Comuna | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: comunas, isLoading } = useQuery({
    queryKey: ["/api/comunas"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertComuna) => apiRequest("POST", "/api/comunas", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunas"] });
      setIsCreateOpen(false);
      toast({ title: "Comuna creada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear comuna", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id_comuna, data }: { id_comuna: number; data: Partial<InsertComuna> }) =>
      apiRequest("PUT", `/api/comunas/${id_comuna}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunas"] });
      setEditingComuna(null);
      toast({ title: "Comuna actualizada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar comuna", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id_comuna: number) => apiRequest("DELETE", `/api/comunas/${id_comuna}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunas"] });
      toast({ title: "Comuna eliminada exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar comuna", variant: "destructive" });
    },
  });

  const form = useForm<InsertComuna>({
    resolver: zodResolver(insertComunaSchema),
    defaultValues: {
      codigo: "",
      nombre: "",
      cantidad_electores: 0,
      estado: true,
    },
  });

  const onSubmit = (data: InsertComuna) => {
    if (editingComuna) {
      updateMutation.mutate({ id_comuna: editingComuna.id_comuna, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (comuna: Comuna) => {
    setEditingComuna(comuna);
    form.reset({
      codigo: comuna.codigo || "",
      nombre: comuna.nombre,
      cantidad_electores: comuna.cantidad_electores,
      estado: comuna.estado,
    });
  };

  const handleDelete = (id_comuna: number) => {
    if (confirm("¿Está seguro de que desea eliminar esta comuna?")) {
      deleteMutation.mutate(id_comuna);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Comunas</CardTitle>
            <Dialog open={isCreateOpen || !!editingComuna} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingComuna(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nueva Comuna
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingComuna ? "Editar Comuna" : "Crear Nueva Comuna"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="codigo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Código</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la Comuna</FormLabel>
                          <FormControl>
                            <Input {...field} type="text" />
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
                          <FormLabel>Activa</FormLabel>
                          <FormControl>
                            <Select onValueChange={(value) => field.onChange(value === "true")} value={field.value ? "true" : "false"}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Activa</SelectItem>
                                <SelectItem value="false">Inactiva</SelectItem>
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
                        setEditingComuna(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingComuna ? "Actualizar" : "Crear"}
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
                <TableHead>Código</TableHead>
                <TableHead>Comuna</TableHead>
                <TableHead>Cantidad de Electores</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : comunas?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    <div className="py-8 text-gray-500">
                      <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay comunas registradas</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                comunas?.map((comuna: Comuna) => (
                  <TableRow key={comuna.id_comuna}>
                    <TableCell>{comuna.codigo}</TableCell>
                    <TableCell>{comuna.nombre}</TableCell>
                    <TableCell>{comuna.cantidad_electores?.toLocaleString() || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant={comuna.estado ? "default" : "destructive"}>
                        {comuna.estado ? "Activa" : "Inactiva"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(comuna)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(comuna.id_comuna)}>
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