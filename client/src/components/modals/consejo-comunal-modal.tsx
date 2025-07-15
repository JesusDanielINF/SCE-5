import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { insertConsejoComunalSchema, type InsertConsejoComunal, type ConsejoComunal } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConsejoComunalModalProps {
  isOpen: boolean;
  onClose: () => void;
  consejo?: ConsejoComunal | null;
}

export function ConsejoComunalModal({ isOpen, onClose, consejo }: ConsejoComunalModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!consejo;

  const { data: eventocc = [] } = useQuery({
    queryKey: ["/api/eventocc"],
  });

  const form = useForm<InsertConsejoComunal>({
    resolver: zodResolver(insertConsejoComunalSchema),
    defaultValues: {
      nombre: consejo?.nombre || "",
      apellido: consejo?.apellido || "",
      rif: consejo?.rif || "",
      fecha_eleccion: consejo?.fecha_eleccion || "",
      cantidad_electores: consejo?.cantidad_electores || 0,
      id_cc: consejo?.id_cc || undefined,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertConsejoComunal) => {
      const response = await apiRequest("POST", "/api/consejos-comunales", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consejos-comunales"] });
      toast({
        title: "Consejo comunal creado",
        description: "El consejo comunal ha sido creado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo crear el consejo comunal",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<InsertConsejoComunal>) => {
      const response = await apiRequest("PUT", `/api/consejos-comunales/${consejo!.id_consejo}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/consejos-comunales"] });
      toast({
        title: "Consejo comunal actualizado",
        description: "El consejo comunal ha sido actualizado exitosamente",
      });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo actualizar el consejo comunal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertConsejoComunal) => {
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
          <DialogTitle>{isEditing ? "Editar Consejo Comunal" : "Crear Consejo Comunal"}</DialogTitle>
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
                      <Input placeholder="María" {...field} />
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
                      <Input placeholder="González" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="rif"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RIF</FormLabel>
                  <FormControl>
                    <Input placeholder="J-12345678-9" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fecha_eleccion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Elección</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
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
                    <Input type="number" placeholder="150" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="id_cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Evento Comunitario</FormLabel>
                  <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar evento comunitario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {eventocc.map((evento) => (
                        <SelectItem key={evento.id_cc} value={evento.id_cc.toString()}>
                          {evento.nombre}
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
