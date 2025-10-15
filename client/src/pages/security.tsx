import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { setCSRFHeader, isUnauthorizedError } from "@/lib/authUtils";
import { Shield, User, Lock, AlertTriangle, CheckCircle, XCircle, Clock, Activity } from "lucide-react";

interface SecuritySetting {
  id: number;
  key: string;
  value: string;
  description: string;
  updatedAt: string;
}

interface AuditLog {
  id: number;
  userId: number | null;
  action: string;
  resource: string;
  resourceId: string;
  details: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default function Security() {
  const [securitySettings, setSecuritySettings] = useState({
    two_factor_enabled: false,
    login_attempts_limit: 3,
    session_timeout: 120,
    audit_enabled: true,
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading: settingsLoading } = useQuery<SecuritySetting[]>({
    queryKey: ["/api/security/settings"],
  });

  const { data: auditLogs, isLoading: logsLoading } = useQuery<AuditLog[]>({
    queryKey: ["/api/security/audit-logs"],
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("PUT", "/api/security/settings", { key, value }, headers);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security/settings"] });
      toast({
        title: "Configuración actualizada",
        description: "La configuración de seguridad se ha actualizado exitosamente",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para actualizar la configuración de seguridad",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    },
  });

  // Load settings into local state
  React.useEffect(() => {
    if (settings) {
      const settingsObj = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.key.includes("enabled") ? setting.value === "true" : setting.value;
        return acc;
      }, {} as any);
      setSecuritySettings(prev => ({ ...prev, ...settingsObj }));
    }
  }, [settings]);

  const handleSettingChange = (key: string, value: any) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value,
    }));

    // Update setting in backend
    updateSettingMutation.mutate({
      key,
      value: value.toString(),
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN_SUCCESS")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (action.includes("LOGIN_FAILED")) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (action.includes("USER")) {
      return <User className="h-4 w-4 text-blue-500" />;
    } else if (action.includes("BACKUP")) {
      return <Shield className="h-4 w-4 text-purple-500" />;
    } else {
      return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActionText = (action: string) => {
    const actionMap: Record<string, string> = {
      LOGIN_SUCCESS: "Inicio de sesión exitoso",
      LOGIN_FAILED: "Inicio de sesión fallido",
      LOGOUT: "Cierre de sesión",
      USER_CREATED: "Usuario creado",
      USER_UPDATED: "Usuario actualizado",
      USER_DELETED: "Usuario eliminado",
      EVENT_CREATED: "Evento creado",
      EVENT_UPDATED: "Evento actualizado",
      EVENT_DELETED: "Evento eliminado",
      BACKUP_COMPLETED: "Respaldo completado",
      BACKUP_FAILED: "Respaldo fallido",
      REPORT_GENERATED: "Reporte generado",
    };
    return actionMap[action] || action;
  };

  const getActionBadge = (action: string) => {
    if (action.includes("SUCCESS") || action.includes("COMPLETED")) {
      return "badge-success";
    } else if (action.includes("FAILED")) {
      return "badge-danger";
    } else if (action.includes("CREATED")) {
      return "badge-primary";
    } else if (action.includes("UPDATED")) {
      return "badge-warning";
    } else if (action.includes("DELETED")) {
      return "badge-danger";
    } else {
      return "badge-secondary";
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="text-center py-12">
        <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Acceso Restringido</h2>
        <p className="text-gray-600">Solo los administradores pueden acceder a la configuración de seguridad</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuración de Seguridad</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Autenticación de Dos Factores</p>
                  <p className="text-xs text-gray-500">Protección adicional para cuentas</p>
                </div>
                <Switch
                  checked={securitySettings.two_factor_enabled}
                  onCheckedChange={(checked) => handleSettingChange("two_factor_enabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Límite de Intentos de Login</p>
                  <p className="text-xs text-gray-500">Bloquear después de fallos</p>
                </div>
                <Input
                  type="number"
                  value={securitySettings.login_attempts_limit}
                  onChange={(e) => handleSettingChange("login_attempts_limit", parseInt(e.target.value))}
                  className="w-16 text-sm"
                  min="1"
                  max="10"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Tiempo de Sesión</p>
                  <p className="text-xs text-gray-500">Minutos antes de expirar</p>
                </div>
                <Input
                  type="number"
                  value={securitySettings.session_timeout}
                  onChange={(e) => handleSettingChange("session_timeout", parseInt(e.target.value))}
                  className="w-20 text-sm"
                  min="30"
                  max="480"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-800">Auditoría de Acceso</p>
                  <p className="text-xs text-gray-500">Registrar todas las acciones</p>
                </div>
                <Switch
                  checked={securitySettings.audit_enabled}
                  onCheckedChange={(checked) => handleSettingChange("audit_enabled", checked)}
                />
              </div>
            </div>

            {settingsLoading && (
              <div className="mt-4 text-center text-gray-500">
                <Clock className="h-5 w-5 mx-auto mb-2 animate-spin" />
                <p className="text-sm">Cargando configuración...</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Statistics */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Estadísticas de Seguridad</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600">Logins Exitosos</p>
                  <p className="text-2xl font-bold text-green-600">
                    {auditLogs?.filter(log => log.action === "LOGIN_SUCCESS").length || 0}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <p className="text-sm font-medium text-gray-600">Intentos Fallidos</p>
                  <p className="text-2xl font-bold text-red-600">
                    {auditLogs?.filter(log => log.action === "LOGIN_FAILED").length || 0}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-sm font-medium text-gray-600">Total de Eventos de Seguridad</p>
                <p className="text-3xl font-bold text-gray-800">{auditLogs?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Eventos de Seguridad Recientes</h3>
          
          <div className="space-y-3">
            {logsLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-200 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : auditLogs?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No hay eventos de seguridad disponibles</p>
              </div>
            ) : (
              auditLogs?.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(log.action)}
                    <div>
                      <p className="text-sm font-medium text-gray-800">{getActionText(log.action)}</p>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Usuario: {log.userId || "Sistema"}</span>
                        <span>•</span>
                        <span>IP: {log.ipAddress || "N/A"}</span>
                        <span>•</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${getActionBadge(log.action)}`}>
                    {log.resource}
                  </span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
