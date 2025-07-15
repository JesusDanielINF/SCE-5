import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  Vote, 
  BarChart3, 
  MapPin, 
  Users, 
  Tags, 
  Map, 
  Building, 
  Home, 
  MapPinOff,
  Bus,
  School,
  Calendar,
  TrendingUp,
  Settings,
  Handshake,
  FolderOpen,
  Menu,
  X
} from "lucide-react";

const navigation = [
  {
    name: "Principal",
    items: [
      { name: "Dashboard", href: "/", icon: BarChart3 },
      { name: "Mapa de Venezuela", href: "/map", icon: Map },
    ]
  },
  {
    name: "Usuarios y Roles",
    items: [
      { name: "Usuarios", href: "/users", icon: Users },
      { name: "Roles", href: "/roles", icon: Tags },
    ]
  },
  {
    name: "Geografía",
    items: [
      { name: "Estados", href: "/estados", icon: MapPin },
      { name: "Municipios", href: "/municipios", icon: Building },
      { name: "Parroquias", href: "/parroquias", icon: Building },
      { name: "Comunidades", href: "/comunidades", icon: Home },
      { name: "Ubicaciones", href: "/ubicaciones", icon: MapPinOff },
    ]
  },
  {
    name: "Electoral",
    items: [
      { name: "Personal", href: "/personal", icon: Bus },
      { name: "Centros de Votación", href: "/centros", icon: School },
      { name: "Eventos", href: "/eventos", icon: Calendar },
      { name: "Afluencia", href: "/afluencia", icon: TrendingUp },
    ]
  },
  {
    name: "Comunal",
    items: [
      { name: "Comunas", href: "/comunas", icon: Settings },
      { name: "Proyectos", href: "/proyectos", icon: FolderOpen },
      { name: "Consejos Comunales", href: "/consejos", icon: Handshake },
    ]
  }
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  const { user } = useAuth();

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleSidebar}
          className="bg-white"
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-40",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0"
      )}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Vote className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">SCE</h1>
              <p className="text-xs text-gray-500">Sistema de Control Electoral</p>
            </div>
          </div>
        </div>
        
        <nav className="mt-4 h-full overflow-y-auto pb-20">
          {navigation.map((section) => (
            <div key={section.name}>
              <div className="px-4 py-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  {section.name}
                </span>
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center px-4 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-primary text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
