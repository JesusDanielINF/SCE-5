import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { VenezuelaMap } from "@/components/venezuela-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download } from "lucide-react";

export default function Map() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="p-6 pt-20">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Mapa de Venezuela</h1>
            <p className="text-gray-600">Visualización interactiva del territorio nacional</p>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Mapa Interactivo</CardTitle>
                <div className="flex items-center space-x-4">
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Seleccionar Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DC">Distrito Capital</SelectItem>
                      <SelectItem value="MI">Miranda</SelectItem>
                      <SelectItem value="CA">Carabobo</SelectItem>
                      <SelectItem value="ZU">Zulia</SelectItem>
                      <SelectItem value="LA">Lara</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Seleccionar Municipio" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Seleccione un estado primero</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <VenezuelaMap />
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Centros Activos</span>
                      <span className="text-lg font-bold text-blue-600">0</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Eventos Hoy</span>
                      <span className="text-lg font-bold text-green-600">0</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-yellow-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-yellow-800">Participación</span>
                      <span className="text-lg font-bold text-yellow-600">0%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
