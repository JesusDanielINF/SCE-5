import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { insertComunaSchema, type InsertComuna, type Comuna } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

interface ComunaModalProps {
  isOpen: boolean;
  onClose: () => void;
  comuna?: Comuna | null;
}

export function ComunaModal({ isOpen, onClose, comuna }: ComunaModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!comuna;

  const form = useForm<InsertComuna>({
    resolver: zodResolver(insertComunaSchema),
    defaultValues: {
      codigo: comuna?.codigo || undefined,
      nombre: comuna?.nombre || "",
      cantidad_electores: comuna?.cantidad_electores || 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertComuna) => {
      const response = await apiRequest("POST", "/api/comunas", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunas"] });
      toast({
        title: "Comuna creada",
        description: "La comuna ha sido creada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear la comuna",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertComuna>) => {
      const response = await apiRequest("PUT", `/api/comunas/${comuna!.id_comuna}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/comunas"] });
      toast({
        title: "Comuna actualizada",
        description: "La comuna ha sido actualizada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la comuna",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertComuna) => {
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
          <DialogTitle>{isEditing ? "Editar Comuna" : "Crear Comuna"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de la Comuna</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="001" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
                    <Input placeholder="Comuna El Libertador" {...field} />
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
                    <Input type="number" placeholder="5000" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
