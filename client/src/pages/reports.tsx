import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { setCSRFHeader, isUnauthorizedError } from "@/lib/authUtils";
import { Download, FileText, File, Calendar, Users, Activity, Clock } from "lucide-react";

interface Report {
  id: number;
  name: string;
  type: string;
  format: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  filePath: string | null;
  fileSize: number | null;
}

export default function Reports() {
  const [reportForm, setReportForm] = useState({
    type: "events",
    startDate: "",
    endDate: "",
    format: "pdf",
    categoryId: "",
    userId: "",
  });

  const { toast } = useToast();

  const { data: reports, isLoading: reportsLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: users } = useQuery({
    queryKey: ["/api/users"],
  });

  const generateReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const headers = setCSRFHeader({ "Content-Type": "application/json" });
      const response = await apiRequest("POST", "/api/reports/generate", reportData, headers);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Reporte generado",
        description: "El reporte se ha generado exitosamente",
      });
      // Refetch reports
      window.location.reload();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "No autorizado",
          description: "No tienes permisos para generar reportes",
          variant: "destructive",
        });
        return;
      }
      toast({
        title: "Error",
        description: "No se pudo generar el reporte",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reportForm.startDate || !reportForm.endDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona las fechas de inicio y fin",
        variant: "destructive",
      });
      return;
    }

    const parameters = {
      startDate: reportForm.startDate,
      endDate: reportForm.endDate,
      ...(reportForm.categoryId && { categoryId: parseInt(reportForm.categoryId) }),
      ...(reportForm.userId && { userId: parseInt(reportForm.userId) }),
    };

    generateReportMutation.mutate({
      type: reportForm.type,
      format: reportForm.format,
      parameters,
    });
  };

  const handleDownload = (report: Report) => {
    if (report.filePath) {
      // Create a download link
      const link = document.createElement("a");
      link.href = `/api/reports/${report.id}/download`;
      link.download = report.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case "events":
        return Calendar;
      case "users":
        return Users;
      case "activity":
        return Activity;
      default:
        return FileText;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case "pdf":
        return FileText;
      case "word":
        return File;
      case "excel":
        return FileText;
      default:
        return FileText;
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

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "N/A";
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Report Form */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Generar Reporte</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Reporte
                </Label>
                <Select 
                  value={reportForm.type} 
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="events">Reporte de Eventos</SelectItem>
                    <SelectItem value="users">Reporte de Usuarios</SelectItem>
                    <SelectItem value="activity">Reporte de Actividad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={reportForm.startDate}
                    onChange={(e) => setReportForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={reportForm.endDate}
                    onChange={(e) => setReportForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
              </div>

              {reportForm.type === "events" && (
                <div>
                  <Label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Categoría (Opcional)
                  </Label>
                  <Select 
                    value={reportForm.categoryId} 
                    onValueChange={(value) => setReportForm(prev => ({ ...prev, categoryId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reportForm.type === "activity" && (
                <div>
                  <Label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-2">
                    Filtrar por Usuario (Opcional)
                  </Label>
                  <Select 
                    value={reportForm.userId} 
                    onValueChange={(value) => setReportForm(prev => ({ ...prev, userId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todos los usuarios</SelectItem>
                      {users?.map((user: any) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label className="block text-sm font-medium text-gray-700 mb-2">
                  Formato
                </Label>
                <RadioGroup
                  value={reportForm.format}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, format: value }))}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pdf" id="pdf" />
                    <Label htmlFor="pdf">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="word" id="word" />
                    <Label htmlFor="word">Word</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excel" id="excel" />
                    <Label htmlFor="excel">Excel</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={generateReportMutation.isPending}
              >
                {generateReportMutation.isPending ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Generando...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Generar Reporte
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Recent Reports */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reportes Recientes</h3>
            <div className="space-y-3">
              {reportsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-gray-200 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              ) : reports?.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>No hay reportes disponibles</p>
                </div>
              ) : (
                reports?.slice(0, 5).map((report) => {
                  const ReportIcon = getReportIcon(report.type);
                  const FormatIcon = getFormatIcon(report.format);
                  
                  return (
                    <div key={report.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center">
                          <ReportIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{report.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <FormatIcon className="h-3 w-3" />
                            <span>{report.format.toUpperCase()}</span>
                            <span>•</span>
                            <span>{formatFileSize(report.fileSize)}</span>
                            <span>•</span>
                            <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${getStatusBadge(report.status)}`}>
                          {getStatusText(report.status)}
                        </span>
                        {report.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownload(report)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
