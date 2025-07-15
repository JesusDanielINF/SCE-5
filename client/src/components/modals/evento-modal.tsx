import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertEventoSchema, type InsertEvento, type Evento } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EventoModalProps {
  isOpen: boolean;
  onClose: () => void;
  evento?: Evento | null;
}

export function EventoModal({ isOpen, onClose, evento }: EventoModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!evento;

  const { data: centros = [] } = useQuery({
    queryKey: ["/api/centros-votacion"],
  });

  const form = useForm<InsertEvento>({
    resolver: zodResolver(insertEventoSchema),
    defaultValues: {
      nombre: evento?.nombre || "",
      fecha_evento: evento?.fecha_evento ? new Date(evento.fecha_evento).toISOString().slice(0, 16) : "",
      id_ce: evento?.id_ce || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertEvento) => {
      const response = await apiRequest("POST", "/api/eventos", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos"] });
      toast({
        title: "Evento creado",
        description: "El evento ha sido creado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertEvento>) => {
      const response = await apiRequest("PUT", `/api/eventos/${evento!.id_evento}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventos"] });
      toast({
        title: "Evento actualizado",
        description: "El evento ha sido actualizado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el evento",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertEvento) => {
    const eventData = {
      ...data,
      fecha_evento: new Date(data.fecha_evento),
    };
    
    if (isEditing) {
      updateMutation.mutate(eventData);
    } else {
      createMutation.mutate(eventData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Evento" : "Crear Evento"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Evento</FormLabel>
                  <FormControl>
                    <Input placeholder="Elecciones Presidenciales 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fecha_evento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Evento</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_ce"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Centro de Votación</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar centro de votación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {centros.map((centro) => (
                        <SelectItem key={centro.id_ce} value={centro.id_ce.toString()}>
                          {centro.nombre}
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
