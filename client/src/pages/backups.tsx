import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { setCSRFHeader, isUnauthorizedError } from "@/lib/authUtils";
import { Play, Download, Settings, CloudUpload, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

interface Backup {
  id: number;
  filename: string;
  size: number | null;
  status: string;
  type: string;
  destination: string;
  createdAt: string;
  completedAt: string | null;
  metadata: any;
}

export default function Backups() {
  const [scheduleForm, setScheduleForm] = useState({
    frequency: "daily",
    time: "02:00",
    destination: "google_drive",
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: backups, isLoading } = useQuery<Backup[]>({
    queryKey: ["/api/backups"],
  });

  const manualBackupMutation = useMutation({
    mutationFn: async () => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("POST", "/api/backups/manual", {}, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/backups"] });
      toast({
        title: "Respaldo iniciado",
        description: "El respaldo manual se ha iniciado exitosamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para crear respaldos",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo iniciar el respaldo",
        variant: "destructive",
      });
    },
  });

  const scheduleBackupMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("POST", "/api/backups/schedule", scheduleData, headers);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Respaldo programado",
        description: "El respaldo se ha programado exitosamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para programar respaldos",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo programar el respaldo",
        variant: "destructive",
      });
    },
  });

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    scheduleBackupMutation.mutate(scheduleForm);
  };

  const handleManualBackup = () => {
    manualBackupMutation.mutate();
  };

  const handleDownload = (backup: Backup) => {
    if (backup.status === "completed") {
      // Create a download link
      const link = document.createElement("a");
      link.href = `/api/backups/${backup.id}/download`;
      link.download = backup.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-yellow-500 animate-spin" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "in_progress":
        return "En progreso";
      case "failed":
        return "Fallido";
      default:
        return "Pendiente";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return "badge-success";
      case "in_progress":
        return "badge-warning";
      case "failed":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  const getTypeText = (type: string) => {
    return type === "manual" ? "Manual" : "Automático";
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <CloudUpload className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">Solo los administradores pueden acceder a la gestión de respaldos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Backup Configuration */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Respaldos</h3>
            
            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia
                </Label>
                <Select 
                  value={scheduleForm.frequency} 
                  onValueChange={(value) => setScheduleForm(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar frecuencia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diario</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensual</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                  Hora de Respaldo
                </Label>
                <Input
                  id="time"
                  type="time"
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-2">
                  Destino
                </Label>
                <div className="flex items-center space-x-2">
                  <Select 
                    value={scheduleForm.destination} 
                    onValueChange={(value) => setScheduleForm(prev => ({ ...prev, destination: value }))}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar destino" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google_drive">Google Drive</SelectItem>
                      <SelectItem value="dropbox">Dropbox</SelectItem>
                      <SelectItem value="aws_s3">AWS S3</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" variant="outline" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={scheduleBackupMutation.isPending}
              >
                {scheduleBackupMutation.isPending ? "Programando..." : "Programar Respaldo"}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button 
                onClick={handleManualBackup}
                className="w-full btn-success"
                disabled={manualBackupMutation.isPending}
              >
                {manualBackupMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Creando respaldo...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Ejecutar Respaldo Manual
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backup Statistics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de Respaldos</h3>
            
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Último Respaldo</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {backups?.[0]?.completedAt ? 
                        new Date(backups[0].completedAt).toLocaleString() : 
                        "No disponible"
                      }
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Estado</p>
                    <div className="flex items-center space-x-2">
                      {backups?.[0] && getStatusIcon(backups[0].status)}
                      <span className={`badge ${getStatusBadge(backups?.[0]?.status || "pending")}`}>
                        {getStatusText(backups?.[0]?.status || "pending")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600">Total Respaldos</p>
                  <p className="text-2xl font-bold text-gray-800">{backups?.length || 0}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600">Exitosos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {backups?.filter(b => b.status === "completed").length || 0}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Historial de Respaldos</h3>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : backups?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CloudUpload className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No hay respaldos disponibles</p>
              </div>
            ) : (
              backups?.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(backup.status)}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{backup.filename}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{new Date(backup.createdAt).toLocaleString()}</span>
                        <span>•</span>
                        <span>{formatFileSize(backup.size)}</span>
                        <span>•</span>
                        <span>{getTypeText(backup.type)}</span>
                        <span>•</span>
                        <span>{backup.destination.replace("_", " ").toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`badge ${getStatusBadge(backup.status)}`}>
                      {getStatusText(backup.status)}
                    </span>
                    {backup.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(backup)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
