import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertCentroVotacionSchema, type InsertCentroVotacion, type CentroVotacion } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CentroVotacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  centro?: CentroVotacion | null;
}

export function CentroVotacionModal({ isOpen, onClose, centro }: CentroVotacionModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!centro;

  const { data: personal = [] } = useQuery({
    queryKey: ["/api/personal"],
  });

  const { data: ubicaciones = [] } = useQuery({
    queryKey: ["/api/ubicaciones"],
  });

  const form = useForm<InsertCentroVotacion>({
    resolver: zodResolver(insertCentroVotacionSchema),
    defaultValues: {
      nombre: centro?.nombre || "",
      mesas: centro?.mesas || 1,
      codigo: centro?.codigo || undefined,
      id_persona: centro?.id_persona || undefined,
      id_ubicacion: centro?.id_ubicacion || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertCentroVotacion) => {
      const response = await apiRequest("POST", "/api/centros-votacion", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/centros-votacion"] });
      toast({
        title: "Centro de votación creado",
        description: "El centro de votación ha sido creado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el centro de votación",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertCentroVotacion>) => {
      const response = await apiRequest("PUT", `/api/centros-votacion/${centro!.id_ce}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/centros-votacion"] });
      toast({
        title: "Centro de votación actualizado",
        description: "El centro de votación ha sido actualizado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el centro de votación",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertCentroVotacion) => {
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
          <DialogTitle>{isEditing ? "Editar Centro de Votación" : "Crear Centro de Votación"}</DialogTitle>
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
                    <Input placeholder="Escuela Bolivariana Los Próceres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mesas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Mesas</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="10" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código del Centro</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="12345" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
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
                  <FormLabel>Personal Responsable</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar personal" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {personal.map((persona) => (
                        <SelectItem key={persona.id_persona} value={persona.id_persona.toString()}>
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
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar ubicación" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ubicaciones.map((ubicacion) => (
                        <SelectItem key={ubicacion.id_ubicacion} value={ubicacion.id_ubicacion.toString()}>
                          {ubicacion.nombre}
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
