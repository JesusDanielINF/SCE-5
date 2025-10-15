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
import { Plus, Edit, Trash2, Bus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPersonalSchema, type Personal, type InsertPersonal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Personal() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPersonal, setEditingPersonal] = useState<Personal | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: personal, isLoading } = useQuery({
    queryKey: ["/api/personal"],
  });

  const createMutation = useMutation({
    mutationFn: (data: InsertPersonal) => apiRequest("POST", "/api/personal", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal"] });
      setIsCreateOpen(false);
      toast({ title: "Personal creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear personal", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InsertPersonal> }) =>
      apiRequest("PUT", `/api/personal/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal"] });
      setEditingPersonal(null);
      toast({ title: "Personal actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar personal", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/personal/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/personal"] });
      toast({ title: "Personal eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar personal", variant: "destructive" });
    },
  });

  const form = useForm<InsertPersonal>({
    resolver: zodResolver(insertPersonalSchema),
    defaultValues: {
      nombre: "",
      apellido: "",
      cedula: "",
      cuenta: "",
      telefono: "",
      cargo: "",
      estado: true,
    },
  });

  const onSubmit = (data: InsertPersonal) => {
    if (editingPersonal) {
      updateMutation.mutate({ id: editingPersonal.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (personalItem: Personal) => {
    setEditingPersonal(personalItem);
    form.reset({
      nombre: personalItem.nombre,
      apellido: personalItem.apellido,
      cedula: personalItem.cedula,
      cuenta: personalItem.cuenta,
      telefono: personalItem.telefono,
      cargo: personalItem.cargo,
      estado: personalItem.estado,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("¿Está seguro de que desea eliminar este personal?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Personal Electoral</CardTitle>
            <Dialog open={isCreateOpen || !!editingPersonal} onOpenChange={(open) => {
              if (!open) {
                setIsCreateOpen(false);
                setEditingPersonal(null);
                form.reset();
              }
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => setIsCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Personal
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingPersonal ? "Editar Personal" : "Crear Nuevo Personal"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cedula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cédula</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="V-12345678" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="cuenta"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cuenta</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="usuario@ejemplo.com" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="0414-1234567" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="cargo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                        setEditingPersonal(null);
                        form.reset();
                      }}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                        {editingPersonal ? "Actualizar" : "Crear"}
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
            <Input placeholder="Buscar personal..." className="flex-1" />
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Personal</TableHead>
                <TableHead>Cédula</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Cuenta</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">Cargando...</TableCell>
                </TableRow>
              ) : personal?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <div className="py-8 text-gray-500">
                      <Bus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No hay personal registrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                personal?.map((person: Personal) => (
                  <TableRow key={person.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                          <span className="text-white text-sm font-medium">
                            {person.nombre[0]}{person.apellido[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium">{person.nombre} {person.apellido}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{person.cedula}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {person.cargo}
                      </Badge>
                    </TableCell>
                    <TableCell>{person.telefono}</TableCell>
                    <TableCell>{person.cuenta}</TableCell>
                    <TableCell>
                      <Badge variant={person.estado ? "default" : "destructive"}>
                        {person.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(person)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleDelete(person.id)}>
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