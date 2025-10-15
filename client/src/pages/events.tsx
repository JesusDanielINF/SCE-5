import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Calendar, User, MapPin } from "lucide-react";

interface Eventocc {
  id_cc: number;
  id_evento: number;
  codigo: number;
  nombre: string;
  voceria: string;
  resultado: number;
  cantidad_electores: number;
  estado: boolean;
}

interface Evento {
  id_evento: number;
  nombre: string;
}

export default function EventoccPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEventocc, setEditingEventocc] = useState<Eventocc | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: eventoccs, isLoading } = useQuery<Eventocc[]>({
    queryKey: ["/api/eventocc"],
  });

  const { data: eventos } = useQuery<Evento[]>({
    queryKey: ["/api/eventos"],
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Eventocc>) => apiRequest("POST", "/api/eventocc", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventocc"] });
      setIsModalOpen(false);
      toast({ title: "Evento comunal creado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al crear evento comunal", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id_cc, data }: { id_cc: number; data: Partial<Eventocc> }) =>
      apiRequest("PUT", `/api/eventocc/${id_cc}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventocc"] });
      setEditingEventocc(null);
      toast({ title: "Evento comunal actualizado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al actualizar evento comunal", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id_cc: number) => apiRequest("DELETE", `/api/eventocc/${id_cc}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/eventocc"] });
      toast({ title: "Evento comunal eliminado exitosamente" });
    },
    onError: () => {
      toast({ title: "Error al eliminar evento comunal", variant: "destructive" });
    },
  });

  const [form, setForm] = useState<Partial<Eventocc>>({
    id_evento: 0,
    codigo: 0,
    nombre: "",
    voceria: "",
    resultado: 0,
    cantidad_electores: 0,
    estado: true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingEventocc) {
      updateMutation.mutate({ id_cc: editingEventocc.id_cc, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleEdit = (eventocc: Eventocc) => {
    setEditingEventocc(eventocc);
    setForm({
      id_evento: eventocc.id_evento,
      codigo: eventocc.codigo,
      nombre: eventocc.nombre,
      voceria: eventocc.voceria,
      resultado: eventocc.resultado,
      cantidad_electores: eventocc.cantidad_electores,
      estado: eventocc.estado,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id_cc: number) => {
    if (window.confirm("¿Está seguro de que desea eliminar este evento comunal?")) {
      deleteMutation.mutate(id_cc);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingEventocc(null);
    setForm({
      id_evento: 0,
      codigo: 0,
      nombre: "",
      voceria: "",
      resultado: 0,
      cantidad_electores: 0,
      estado: true,
    });
  };

  return (
    <div className="space-y-6 fade-in">
      <Card>
        <CardContent className="p-0">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Eventos Comunales</h3>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Evento Comunal
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Evento</th>
                  <th className="px-6 py-3">Código</th>
                  <th className="px-6 py-3">Nombre</th>
                  <th className="px-6 py-3">Vocería</th>
                  <th className="px-6 py-3">Resultado</th>
                  <th className="px-6 py-3">Cantidad Electores</th>
                  <th className="px-6 py-3">Estado</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Cargando eventos comunales...</p>
                    </td>
                  </tr>
                ) : eventoccs?.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No hay eventos comunales registrados</p>
                    </td>
                  </tr>
                ) : (
                  eventoccs?.map((eventocc) => (
                    <tr key={eventocc.id_cc} className="hover:bg-gray-50">
                      <td className="px-6 py-4">{eventos?.find(e => e.id_evento === eventocc.id_evento)?.nombre || "N/A"}</td>
                      <td className="px-6 py-4">{eventocc.codigo}</td>
                      <td className="px-6 py-4">{eventocc.nombre}</td>
                      <td className="px-6 py-4">{eventocc.voceria}</td>
                      <td className="px-6 py-4">{eventocc.resultado}</td>
                      <td className="px-6 py-4">{eventocc.cantidad_electores}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${eventocc.estado ? "badge-success" : "badge-danger"}`}>
                          {eventocc.estado ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(eventocc)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(eventocc.id_cc)}
                            className="text-red-600 hover:text-red-700"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal para crear/editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Evento</Label>
                <Select
                  value={form.id_evento?.toString() || ""}
                  onValueChange={v => setForm(f => ({ ...f, id_evento: parseInt(v) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventos?.map(e => (
                      <SelectItem key={e.id_evento} value={e.id_evento.toString()}>
                        {e.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Código</Label>
                <Input
                  type="number"
                  value={form.codigo || ""}
                  onChange={e => setForm(f => ({ ...f, codigo: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label>Nombre</Label>
                <Input
                  value={form.nombre || ""}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Vocería</Label>
                <Input
                  value={form.voceria || ""}
                  onChange={e => setForm(f => ({ ...f, voceria: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Label>Resultado</Label>
                <Input
                  type="number"
                  value={form.resultado || ""}
                  onChange={e => setForm(f => ({ ...f, resultado: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label>Cantidad Electores</Label>
                <Input
                  type="number"
                  value={form.cantidad_electores || ""}
                  onChange={e => setForm(f => ({ ...f, cantidad_electores: parseInt(e.target.value) }))}
                  required
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Select
                  value={form.estado ? "true" : "false"}
                  onValueChange={v => setForm(f => ({ ...f, estado: v === "true" }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Activo</SelectItem>
                    <SelectItem value="false">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleModalClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingEventocc ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}