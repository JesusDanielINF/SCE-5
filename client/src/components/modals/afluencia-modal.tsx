import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertAfluenciaSchema, type InsertAfluencia, type Afluencia } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AfluenciaModalProps {
  isOpen: boolean;
  onClose: () => void;
  afluencia?: Afluencia | null;
}

export function AfluenciaModal({ isOpen, onClose, afluencia }: AfluenciaModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!afluencia;

  const { data: eventos = [] } = useQuery({
    queryKey: ["/api/eventos"],
  });

  const form = useForm<InsertAfluencia>({
    resolver: zodResolver(insertAfluenciaSchema),
    defaultValues: {
      cantidad: afluencia?.cantidad || 0,
      hora: afluencia?.hora ? new Date(afluencia.hora).toISOString().slice(0, 16) : "",
      id_evento: afluencia?.id_evento || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAfluencia) => {
      const response = await apiRequest("POST", "/api/afluencia", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/afluencia"] });
      toast({
        title: "Afluencia registrada",
        description: "La afluencia ha sido registrada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo registrar la afluencia",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertAfluencia>) => {
      const response = await apiRequest("PUT", `/api/afluencia/${afluencia!.id_afluencia}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/afluencia"] });
      toast({
        title: "Afluencia actualizada",
        description: "La afluencia ha sido actualizada exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar la afluencia",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertAfluencia) => {
    const afluenciaData = {
      ...data,
      hora: new Date(data.hora),
    };
    
    if (isEditing) {
      updateMutation.mutate(afluenciaData);
    } else {
      createMutation.mutate(afluenciaData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Afluencia" : "Registrar Afluencia"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="id_evento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evento</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar evento" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventos.map((evento) => (
                        <SelectItem key={evento.id_evento} value={evento.id_evento.toString()}>
                          {evento.nombre}
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
              name="cantidad"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cantidad de Participantes</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="250" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora de Registro</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
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
                {isEditing ? "Actualizar" : "Registrar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
