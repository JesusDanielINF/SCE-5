import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertMunicipioSchema, type InsertMunicipio, type Municipio } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MunicipioModalProps {
  isOpen: boolean;
  onClose: () => void;
  municipio?: Municipio | null;
}

export function MunicipioModal({ isOpen, onClose, municipio }: MunicipioModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!municipio;

  const { data: estados = [] } = useQuery({
    queryKey: ["/api/estados"],
  });

  const form = useForm<InsertMunicipio>({
    resolver: zodResolver(insertMunicipioSchema),
    defaultValues: {
      nombre: municipio?.nombre || "",
      id_estado: municipio?.id_estado || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertMunicipio) => {
      const response = await apiRequest("POST", "/api/municipios", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/municipios"] });
      toast({
        title: "Municipio creado",
        description: "El municipio ha sido creado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el municipio",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertMunicipio>) => {
      const response = await apiRequest("PUT", `/api/municipios/${municipio!.id_municipio}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/municipios"] });
      toast({
        title: "Municipio actualizado",
        description: "El municipio ha sido actualizado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el municipio",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertMunicipio) => {
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
          <DialogTitle>{isEditing ? "Editar Municipio" : "Crear Municipio"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Municipio</FormLabel>
                  <FormControl>
                    <Input placeholder="Libertador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_estado"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {estados.map((estado) => (
                        <SelectItem key={estado.id_estado} value={estado.id_estado.toString()}>
                          {estado.nombre}
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
