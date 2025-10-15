import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setCSRFHeader, isUnauthorizedError } from "@/lib/authUtils";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  location: string;
  categoryId: number;
  responsibleUserId: number;
  status: string;
}

interface Category {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  username: string;
  cedula: string;
}

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: Event | null;
  categories: Category[];
  users: User[];
}

export default function EventModal({ isOpen, onClose, event, categories, users }: EventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    categoryId: "",
    responsibleUserId: "",
    status: "active",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        startDate: event.startDate || "",
        startTime: event.startTime || "",
        endDate: event.endDate || "",
        endTime: event.endTime || "",
        location: event.location || "",
        categoryId: event.categoryId?.toString() || "",
        responsibleUserId: event.responsibleUserId?.toString() || "",
        status: event.status || "active",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        startDate: "",
        startTime: "",
        endDate: "",
        endTime: "",
        location: "",
        categoryId: "",
        responsibleUserId: "",
        status: "active",
      });
    }
  }, [event]);

  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("POST", "/api/events", eventData, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Evento creado",
        description: "El evento se ha creado exitosamente",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para crear eventos",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo crear el evento",
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("PUT", `/api/events/${event?.id}`, eventData, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      toast({
        title: "Evento actualizado",
        description: "El evento se ha actualizado exitosamente",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para actualizar eventos",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar el evento",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.startDate || !formData.startTime) {
      toast({
        title: "Error",
        description: "Por favor completa los campos requeridos",
        variant: "destructive",
      });
      return;
    }

    const eventData = {
      ...formData,
      categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
      responsibleUserId: formData.responsibleUserId ? parseInt(formData.responsibleUserId) : null,
    };

    if (event) {
      updateEventMutation.mutate(eventData);
    } else {
      createEventMutation.mutate(eventData);
    }
  };

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const isLoading = createEventMutation.isPending || updateEventMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="Título del evento"
                required
              />
            </div>

            <div>
              <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </Label>
              <Select value={formData.categoryId} onValueChange={(value) => handleChange("categoryId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Inicio *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                Hora Inicio *
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Fin
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                Hora Fin
              </Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleChange("location", e.target.value)}
              placeholder="Ubicación del evento"
            />
          </div>

          <div>
            <Label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-2">
              Responsable
            </Label>
            <Select value={formData.responsibleUserId} onValueChange={(value) => handleChange("responsibleUserId", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar responsable" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </Label>
            <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Activo</SelectItem>
                <SelectItem value="completed">Completado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Descripción del evento"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" className="btn-primary" disabled={isLoading}>
              {isLoading ? "Guardando..." : event ? "Actualizar" : "Crear"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
