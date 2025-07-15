import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertComunidadSchema, type InsertComunidad, type Comunidad } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ComunidadModalProps {
  isOpen: boolean;
  onClose: () => void;
  comunidad?: Comunidad | null;
}

export function ComunidadModal({ isOpen, onClose, comunidad }: ComunidadModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!comunidad;

  const { data: parroquias = [] } = useQuery({
    queryKey: ["/api/parroquias"],
  });

  const form = useForm<InsertComunidad>({
    resolver: zodResolver(insertComunidadSchema),
    defaultValues: {
      nombre: comunidad?.nombre || "",
      id_parroquia: comunidad?.id_parroquia || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertComunidad) => {
      const response = await apiRequest("POST", "/api/comunidades", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunidades"] });
      toast({
        title: "Comunidad creada",
        description: "La comunidad ha sido creada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la comunidad",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertComunidad>) => {
      const response = await apiRequest("PUT", `/api/comunidades/${comunidad!.id_comunidad}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunidades"] });
      toast({
        title: "Comunidad actualizada",
        description: "La comunidad ha sido actualizada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la comunidad",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertComunidad) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Comunidad" : "Crear Comunidad"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Comunidad</FormLabel>
                  <FormControl>
                    <Input placeholder="Los Flores" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_parroquia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parroquia</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar parroquia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {parroquias.map((parroquia) => (
                        <SelectItem key={parroquia.id_parroquia} value={parroquia.id_parroquia.toString()}>
                          {parroquia.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
