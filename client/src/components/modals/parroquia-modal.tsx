import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertParroquiaSchema, type InsertParroquia, type Parroquia } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParroquiaModalProps {
  isOpen: boolean;
  onClose: () => void;
  parroquia?: Parroquia | null;
}

export function ParroquiaModal({ isOpen, onClose, parroquia }: ParroquiaModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!parroquia;

  const { data: municipios = [] } = useQuery({
    queryKey: ["/api/municipios"],
  });

  const form = useForm<InsertParroquia>({
    resolver: zodResolver(insertParroquiaSchema),
    defaultValues: {
      nombre: parroquia?.nombre || "",
      id_municipio: parroquia?.id_municipio || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertParroquia) => {
      const response = await apiRequest("POST", "/api/parroquias", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parroquias"] });
      toast({
        title: "Parroquia creada",
        description: "La parroquia ha sido creada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la parroquia",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertParroquia>) => {
      const response = await apiRequest("PUT", `/api/parroquias/${parroquia!.id_parroquia}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/parroquias"] });
      toast({
        title: "Parroquia actualizada",
        description: "La parroquia ha sido actualizada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la parroquia",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertParroquia) => {
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
          <DialogTitle>{isEditing ? "Editar Parroquia" : "Crear Parroquia"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la Parroquia</FormLabel>
                  <FormControl>
                    <Input placeholder="23 de Enero" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_municipio"
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
                      {municipios.map((municipio) => (
                        <SelectItem key={municipio.id_municipio} value={municipio.id_municipio.toString()}>
                          {municipio.nombre}
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
