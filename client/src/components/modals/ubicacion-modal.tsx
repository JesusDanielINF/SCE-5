import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertUbicacionSchema, type InsertUbicacion, type Ubicacion } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UbicacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  ubicacion?: Ubicacion | null;
}

export function UbicacionModal({ isOpen, onClose, ubicacion }: UbicacionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!ubicacion;

  const { data: comunidades = [] } = useQuery({
    queryKey: ["/api/comunidades"],
  });

  const form = useForm<InsertUbicacion>({
    resolver: zodResolver(insertUbicacionSchema),
    defaultValues: {
      nombre: ubicacion?.nombre || "",
      calle: ubicacion?.calle || "",
      avenida: ubicacion?.avenida || "",
      referencia: ubicacion?.referencia || "",
      id_comunidad: ubicacion?.id_comunidad || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertUbicacion) => {
      const response = await apiRequest("POST", "/api/ubicaciones", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ubicaciones"] });
      toast({
        title: "Ubicación creada",
        description: "La ubicación ha sido creada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la ubicación",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertUbicacion>) => {
      const response = await apiRequest("PUT", `/api/ubicaciones/${ubicacion!.id_ubicacion}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ubicaciones"] });
      toast({
        title: "Ubicación actualizada",
        description: "La ubicación ha sido actualizada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la ubicación",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertUbicacion) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Ubicación" : "Crear Ubicación"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Ubicación</FormLabel>
                  <FormControl>
                    <Input placeholder="Escuela Bolivariana" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_comunidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comunidad</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar comunidad" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {comunidades.map((comunidad) => (
                        <SelectItem key={comunidad.id_comunidad} value={comunidad.id_comunidad.toString()}>
                          {comunidad.nombre}
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
                      <Input placeholder="Calle Principal" {...field} />
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
                      <Input placeholder="Avenida Bolívar" {...field} />
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
                    <Textarea placeholder="Frente a la plaza principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {isEditing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
