import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertRoleSchema, insertUserSchema, insertEstadoSchema, insertMunicipioSchema,
  insertParroquiaSchema, insertComunidadSchema, insertUbicacionSchema, insertPersonalSchema,
  insertCentroVotacionSchema, insertEventoSchema, insertAfluenciaSchema, insertComunaSchema,
  insertProyectoSchema, insertTComunalSchema, insertEventoccSchema, insertConsejoComunalSchema
} from "@shared/schema";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Role management routes
  app.get("/api/roles", async (req, res) => {
    try {
      const roles = await storage.getRoles();
      res.json(roles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });

  app.post("/api/roles", async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: "Invalid role data" });
    }
  });

  app.put("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(id, validatedData);
      res.json(role);
    } catch (error) {
      res.status(400).json({ error: "Invalid role data" });
    }
  });

  app.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  });

  // User management routes
  app.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });

  app.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Geographic entities routes
  app.get("/api/estados", async (req, res) => {
    try {
      const estados = await storage.getEstados();
      res.json(estados);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch estados" });
    }
  });

  app.post("/api/estados", async (req, res) => {
    try {
      const validatedData = insertEstadoSchema.parse(req.body);
      const estado = await storage.createEstado(validatedData);
      res.status(201).json(estado);
    } catch (error) {
      res.status(400).json({ error: "Invalid estado data" });
    }
  });

  app.put("/api/estados/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEstadoSchema.partial().parse(req.body);
      const estado = await storage.updateEstado(id, validatedData);
      res.json(estado);
    } catch (error) {
      res.status(400).json({ error: "Invalid estado data" });
    }
  });

  app.delete("/api/estados/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEstado(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete estado" });
    }
  });

  // Municipios routes
  app.get("/api/municipios", async (req, res) => {
    try {
      const municipios = await storage.getMunicipios();
      res.json(municipios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch municipios" });
    }
  });

  app.get("/api/municipios/estado/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const municipios = await storage.getMunicipiosByEstado(id);
      res.json(municipios);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch municipios" });
    }
  });

  app.post("/api/municipios", async (req, res) => {
    try {
      const validatedData = insertMunicipioSchema.parse(req.body);
      const municipio = await storage.createMunicipio(validatedData);
      res.status(201).json(municipio);
    } catch (error) {
      res.status(400).json({ error: "Invalid municipio data" });
    }
  });

  app.put("/api/municipios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMunicipioSchema.partial().parse(req.body);
      const municipio = await storage.updateMunicipio(id, validatedData);
      res.json(municipio);
    } catch (error) {
      res.status(400).json({ error: "Invalid municipio data" });
    }
  });

  app.delete("/api/municipios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMunicipio(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete municipio" });
    }
  });

  // Parroquias routes
  app.get("/api/parroquias", async (req, res) => {
    try {
      const parroquias = await storage.getParroquias();
      res.json(parroquias);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parroquias" });
    }
  });

  app.get("/api/parroquias/municipio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parroquias = await storage.getParroquiasByMunicipio(id);
      res.json(parroquias);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parroquias" });
    }
  });

  app.post("/api/parroquias", async (req, res) => {
    try {
      const validatedData = insertParroquiaSchema.parse(req.body);
      const parroquia = await storage.createParroquia(validatedData);
      res.status(201).json(parroquia);
    } catch (error) {
      res.status(400).json({ error: "Invalid parroquia data" });
    }
  });

  app.put("/api/parroquias/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertParroquiaSchema.partial().parse(req.body);
      const parroquia = await storage.updateParroquia(id, validatedData);
      res.json(parroquia);
    } catch (error) {
      res.status(400).json({ error: "Invalid parroquia data" });
    }
  });

  app.delete("/api/parroquias/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteParroquia(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete parroquia" });
    }
  });

  // Comunidades routes
  app.get("/api/comunidades", async (req, res) => {
    try {
      const comunidades = await storage.getComunidades();
      res.json(comunidades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comunidades" });
    }
  });

  app.get("/api/comunidades/parroquia/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comunidades = await storage.getComunidadesByParroquia(id);
      res.json(comunidades);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comunidades" });
    }
  });

  app.post("/api/comunidades", async (req, res) => {
    try {
      const validatedData = insertComunidadSchema.parse(req.body);
      const comunidad = await storage.createComunidad(validatedData);
      res.status(201).json(comunidad);
    } catch (error) {
      res.status(400).json({ error: "Invalid comunidad data" });
    }
  });

  app.put("/api/comunidades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertComunidadSchema.partial().parse(req.body);
      const comunidad = await storage.updateComunidad(id, validatedData);
      res.json(comunidad);
    } catch (error) {
      res.status(400).json({ error: "Invalid comunidad data" });
    }
  });

  app.delete("/api/comunidades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComunidad(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comunidad" });
    }
  });

  // Ubicaciones routes
  app.get("/api/ubicaciones", async (req, res) => {
    try {
      const ubicaciones = await storage.getUbicaciones();
      res.json(ubicaciones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ubicaciones" });
    }
  });

  app.get("/api/ubicaciones/comunidad/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ubicaciones = await storage.getUbicacionesByComunidad(id);
      res.json(ubicaciones);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ubicaciones" });
    }
  });

  app.post("/api/ubicaciones", async (req, res) => {
    try {
      const validatedData = insertUbicacionSchema.parse(req.body);
      const ubicacion = await storage.createUbicacion(validatedData);
      res.status(201).json(ubicacion);
    } catch (error) {
      res.status(400).json({ error: "Invalid ubicacion data" });
    }
  });

  app.put("/api/ubicaciones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUbicacionSchema.partial().parse(req.body);
      const ubicacion = await storage.updateUbicacion(id, validatedData);
      res.json(ubicacion);
    } catch (error) {
      res.status(400).json({ error: "Invalid ubicacion data" });
    }
  });

  app.delete("/api/ubicaciones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUbicacion(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ubicacion" });
    }
  });

  // Personal routes
  app.get("/api/personal", async (req, res) => {
    try {
      const personal = await storage.getPersonal();
      res.json(personal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personal" });
    }
  });

  app.post("/api/personal", async (req, res) => {
    try {
      const validatedData = insertPersonalSchema.parse(req.body);
      const persona = await storage.createPersona(validatedData);
      res.status(201).json(persona);
    } catch (error) {
      res.status(400).json({ error: "Invalid personal data" });
    }
  });

  app.put("/api/personal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPersonalSchema.partial().parse(req.body);
      const persona = await storage.updatePersona(id, validatedData);
      res.json(persona);
    } catch (error) {
      res.status(400).json({ error: "Invalid personal data" });
    }
  });

  app.delete("/api/personal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePersona(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete personal" });
    }
  });

  // Centro de Votacion routes
  app.get("/api/centros-votacion", async (req, res) => {
    try {
      const centros = await storage.getCentrosVotacion();
      res.json(centros);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch centros de votacion" });
    }
  });

  app.post("/api/centros-votacion", async (req, res) => {
    try {
      const validatedData = insertCentroVotacionSchema.parse(req.body);
      const centro = await storage.createCentroVotacion(validatedData);
      res.status(201).json(centro);
    } catch (error) {
      res.status(400).json({ error: "Invalid centro de votacion data" });
    }
  });

  app.put("/api/centros-votacion/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCentroVotacionSchema.partial().parse(req.body);
      const centro = await storage.updateCentroVotacion(id, validatedData);
      res.json(centro);
    } catch (error) {
      res.status(400).json({ error: "Invalid centro de votacion data" });
    }
  });

  app.delete("/api/centros-votacion/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCentroVotacion(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete centro de votacion" });
    }
  });

  // Eventos routes
  app.get("/api/eventos", async (req, res) => {
    try {
      const eventos = await storage.getEventos();
      res.json(eventos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch eventos" });
    }
  });

  app.post("/api/eventos", async (req, res) => {
    try {
      const validatedData = insertEventoSchema.parse(req.body);
      const evento = await storage.createEvento(validatedData);
      res.status(201).json(evento);
    } catch (error) {
      res.status(400).json({ error: "Invalid evento data" });
    }
  });

  app.put("/api/eventos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventoSchema.partial().parse(req.body);
      const evento = await storage.updateEvento(id, validatedData);
      res.json(evento);
    } catch (error) {
      res.status(400).json({ error: "Invalid evento data" });
    }
  });

  app.delete("/api/eventos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvento(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete evento" });
    }
  });

  // Afluencia routes
  app.get("/api/afluencia", async (req, res) => {
    try {
      const afluencia = await storage.getAfluencia();
      res.json(afluencia);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch afluencia" });
    }
  });

  app.get("/api/afluencia/evento/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const afluencia = await storage.getAfluenciaByEvento(id);
      res.json(afluencia);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch afluencia" });
    }
  });

  app.post("/api/afluencia", async (req, res) => {
    try {
      const validatedData = insertAfluenciaSchema.parse(req.body);
      const afluencia = await storage.createAfluencia(validatedData);
      res.status(201).json(afluencia);
    } catch (error) {
      res.status(400).json({ error: "Invalid afluencia data" });
    }
  });

  app.put("/api/afluencia/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAfluenciaSchema.partial().parse(req.body);
      const afluencia = await storage.updateAfluencia(id, validatedData);
      res.json(afluencia);
    } catch (error) {
      res.status(400).json({ error: "Invalid afluencia data" });
    }
  });

  app.delete("/api/afluencia/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAfluencia(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete afluencia" });
    }
  });

  // Comunas routes
  app.get("/api/comunas", async (req, res) => {
    try {
      const comunas = await storage.getComunas();
      res.json(comunas);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comunas" });
    }
  });

  app.post("/api/comunas", async (req, res) => {
    try {
      const validatedData = insertComunaSchema.parse(req.body);
      const comuna = await storage.createComuna(validatedData);
      res.status(201).json(comuna);
    } catch (error) {
      res.status(400).json({ error: "Invalid comuna data" });
    }
  });

  app.put("/api/comunas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertComunaSchema.partial().parse(req.body);
      const comuna = await storage.updateComuna(id, validatedData);
      res.json(comuna);
    } catch (error) {
      res.status(400).json({ error: "Invalid comuna data" });
    }
  });

  app.delete("/api/comunas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComuna(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comuna" });
    }
  });

  // Proyectos routes
  app.get("/api/proyectos", async (req, res) => {
    try {
      const proyectos = await storage.getProyectos();
      res.json(proyectos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proyectos" });
    }
  });

  app.get("/api/proyectos/comuna/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const proyectos = await storage.getProyectosByComuna(id);
      res.json(proyectos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proyectos" });
    }
  });

  app.post("/api/proyectos", async (req, res) => {
    try {
      const validatedData = insertProyectoSchema.parse(req.body);
      const proyecto = await storage.createProyecto(validatedData);
      res.status(201).json(proyecto);
    } catch (error) {
      res.status(400).json({ error: "Invalid proyecto data" });
    }
  });

  app.put("/api/proyectos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProyectoSchema.partial().parse(req.body);
      const proyecto = await storage.updateProyecto(id, validatedData);
      res.json(proyecto);
    } catch (error) {
      res.status(400).json({ error: "Invalid proyecto data" });
    }
  });

  app.delete("/api/proyectos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProyecto(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete proyecto" });
    }
  });

  // T_Comunal routes
  app.get("/api/t-comunal", async (req, res) => {
    try {
      const tComunal = await storage.getTComunal();
      res.json(tComunal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch t-comunal" });
    }
  });

  app.post("/api/t-comunal", async (req, res) => {
    try {
      const validatedData = insertTComunalSchema.parse(req.body);
      const tComunal = await storage.createTComunal(validatedData);
      res.status(201).json(tComunal);
    } catch (error) {
      res.status(400).json({ error: "Invalid t-comunal data" });
    }
  });

  app.put("/api/t-comunal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTComunalSchema.partial().parse(req.body);
      const tComunal = await storage.updateTComunal(id, validatedData);
      res.json(tComunal);
    } catch (error) {
      res.status(400).json({ error: "Invalid t-comunal data" });
    }
  });

  app.delete("/api/t-comunal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTComunal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete t-comunal" });
    }
  });

  // Eventocc routes
  app.get("/api/eventocc", async (req, res) => {
    try {
      const eventocc = await storage.getEventocc();
      res.json(eventocc);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch eventocc" });
    }
  });

  app.get("/api/eventocc/evento/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventocc = await storage.getEventoccByEvento(id);
      res.json(eventocc);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch eventocc" });
    }
  });

  app.post("/api/eventocc", async (req, res) => {
    try {
      const validatedData = insertEventoccSchema.parse(req.body);
      const eventocc = await storage.createEventocc(validatedData);
      res.status(201).json(eventocc);
    } catch (error) {
      res.status(400).json({ error: "Invalid eventocc data" });
    }
  });

  app.put("/api/eventocc/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventoccSchema.partial().parse(req.body);
      const eventocc = await storage.updateEventocc(id, validatedData);
      res.json(eventocc);
    } catch (error) {
      res.status(400).json({ error: "Invalid eventocc data" });
    }
  });

  app.delete("/api/eventocc/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEventocc(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete eventocc" });
    }
  });

  // Consejos Comunales routes
  app.get("/api/consejos-comunales", async (req, res) => {
    try {
      const consejos = await storage.getConsejosComunales();
      res.json(consejos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consejos comunales" });
    }
  });

  app.post("/api/consejos-comunales", async (req, res) => {
    try {
      const validatedData = insertConsejoComunalSchema.parse(req.body);
      const consejo = await storage.createConsejoComunal(validatedData);
      res.status(201).json(consejo);
    } catch (error) {
      res.status(400).json({ error: "Invalid consejo comunal data" });
    }
  });

  app.put("/api/consejos-comunales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertConsejoComunalSchema.partial().parse(req.body);
      const consejo = await storage.updateConsejoComunal(id, validatedData);
      res.json(consejo);
    } catch (error) {
      res.status(400).json({ error: "Invalid consejo comunal data" });
    }
  });

  app.delete("/api/consejos-comunales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConsejoComunal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete consejo comunal" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
