import { 
  usuarios, roles, estados, municipios, parroquias, comunidades, ubicaciones,
  personal, centrosVotacion, eventos, afluencia, comunas, proyectos, tComunal,
  eventocc, consejosComunales,
  type User, type InsertUser, type Role, type InsertRole,
  type Estado, type InsertEstado, type Municipio, type InsertMunicipio,
  type Parroquia, type InsertParroquia, type Comunidad, type InsertComunidad,
  type Ubicacion, type InsertUbicacion, type Personal, type InsertPersonal,
  type CentroVotacion, type InsertCentroVotacion, type Evento, type InsertEvento,
  type Afluencia, type InsertAfluencia, type Comuna, type InsertComuna,
  type Proyecto, type InsertProyecto, type TComunal, type InsertTComunal,
  type Eventocc, type InsertEventocc, type ConsejoComunal, type InsertConsejoComunal
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

type SessionStore = session.Store;

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<void>;
  getUsers(): Promise<User[]>;

  // Role management
  getRole(id: number): Promise<Role | undefined>;
  getRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, role: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: number): Promise<void>;

  // Geographic entities
  getEstados(): Promise<Estado[]>;
  getEstado(id: number): Promise<Estado | undefined>;
  createEstado(estado: InsertEstado): Promise<Estado>;
  updateEstado(id: number, estado: Partial<InsertEstado>): Promise<Estado>;
  deleteEstado(id: number): Promise<void>;

  getMunicipios(): Promise<Municipio[]>;
  getMunicipiosByEstado(id_estado: number): Promise<Municipio[]>;
  getMunicipio(id: number): Promise<Municipio | undefined>;
  createMunicipio(municipio: InsertMunicipio): Promise<Municipio>;
  updateMunicipio(id: number, municipio: Partial<InsertMunicipio>): Promise<Municipio>;
  deleteMunicipio(id: number): Promise<void>;

  getParroquias(): Promise<Parroquia[]>;
  getParroquiasByMunicipio(id_municipio: number): Promise<Parroquia[]>;
  getParroquia(id: number): Promise<Parroquia | undefined>;
  createParroquia(parroquia: InsertParroquia): Promise<Parroquia>;
  updateParroquia(id: number, parroquia: Partial<InsertParroquia>): Promise<Parroquia>;
  deleteParroquia(id: number): Promise<void>;

  getComunidades(): Promise<Comunidad[]>;
  getComunidadesByParroquia(id_parroquia: number): Promise<Comunidad[]>;
  getComunidad(id: number): Promise<Comunidad | undefined>;
  createComunidad(comunidad: InsertComunidad): Promise<Comunidad>;
  updateComunidad(id: number, comunidad: Partial<InsertComunidad>): Promise<Comunidad>;
  deleteComunidad(id: number): Promise<void>;

  getUbicaciones(): Promise<Ubicacion[]>;
  getUbicacionesByComunidad(id_comunidad: number): Promise<Ubicacion[]>;
  getUbicacion(id: number): Promise<Ubicacion | undefined>;
  createUbicacion(ubicacion: InsertUbicacion): Promise<Ubicacion>;
  updateUbicacion(id: number, ubicacion: Partial<InsertUbicacion>): Promise<Ubicacion>;
  deleteUbicacion(id: number): Promise<void>;

  // Personnel
  getPersonal(): Promise<Personal[]>;
  getPersona(id: number): Promise<Personal | undefined>;
  createPersona(persona: InsertPersonal): Promise<Personal>;
  updatePersona(id: number, persona: Partial<InsertPersonal>): Promise<Personal>;
  deletePersona(id: number): Promise<void>;

  // Voting centers
  getCentrosVotacion(): Promise<CentroVotacion[]>;
  getCentroVotacion(id: number): Promise<CentroVotacion | undefined>;
  createCentroVotacion(centro: InsertCentroVotacion): Promise<CentroVotacion>;
  updateCentroVotacion(id: number, centro: Partial<InsertCentroVotacion>): Promise<CentroVotacion>;
  deleteCentroVotacion(id: number): Promise<void>;

  // Events
  getEventos(): Promise<Evento[]>;
  getEvento(id: number): Promise<Evento | undefined>;
  createEvento(evento: InsertEvento): Promise<Evento>;
  updateEvento(id: number, evento: Partial<InsertEvento>): Promise<Evento>;
  deleteEvento(id: number): Promise<void>;

  // Afluencia
  getAfluencia(): Promise<Afluencia[]>;
  getAfluenciaByEvento(id_evento: number): Promise<Afluencia[]>;
  createAfluencia(afluencia: InsertAfluencia): Promise<Afluencia>;
  updateAfluencia(id: number, afluencia: Partial<InsertAfluencia>): Promise<Afluencia>;
  deleteAfluencia(id: number): Promise<void>;

  // Comunas
  getComunas(): Promise<Comuna[]>;
  getComuna(id: number): Promise<Comuna | undefined>;
  createComuna(comuna: InsertComuna): Promise<Comuna>;
  updateComuna(id: number, comuna: Partial<InsertComuna>): Promise<Comuna>;
  deleteComuna(id: number): Promise<void>;

  // Proyectos
  getProyectos(): Promise<Proyecto[]>;
  getProyectosByComuna(id_comuna: number): Promise<Proyecto[]>;
  getProyecto(id: number): Promise<Proyecto | undefined>;
  createProyecto(proyecto: InsertProyecto): Promise<Proyecto>;
  updateProyecto(id: number, proyecto: Partial<InsertProyecto>): Promise<Proyecto>;
  deleteProyecto(id: number): Promise<void>;

  // T_Comunal
  getTComunal(): Promise<TComunal[]>;
  createTComunal(tComunal: InsertTComunal): Promise<TComunal>;
  updateTComunal(id: number, tComunal: Partial<InsertTComunal>): Promise<TComunal>;
  deleteTComunal(id: number): Promise<void>;

  // Eventocc
  getEventocc(): Promise<Eventocc[]>;
  getEventoccByEvento(id_evento: number): Promise<Eventocc[]>;
  createEventocc(eventocc: InsertEventocc): Promise<Eventocc>;
  updateEventocc(id: number, eventocc: Partial<InsertEventocc>): Promise<Eventocc>;
  deleteEventocc(id: number): Promise<void>;

  // Consejos Comunales
  getConsejosComunales(): Promise<ConsejoComunal[]>;
  getConsejoComunal(id: number): Promise<ConsejoComunal | undefined>;
  createConsejoComunal(consejo: InsertConsejoComunal): Promise<ConsejoComunal>;
  updateConsejoComunal(id: number, consejo: Partial<InsertConsejoComunal>): Promise<ConsejoComunal>;
  deleteConsejoComunal(id: number): Promise<void>;

  sessionStore: SessionStore;
}

export class DatabaseStorage implements IStorage {
  sessionStore: SessionStore;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }

  // User management
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(usuarios).where(eq(usuarios.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(usuarios).where(eq(usuarios.email, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(usuarios).where(eq(usuarios.email, email));
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(usuarios).values(user).returning();
    return newUser;
  }

  async updateUser(id: number, user: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db.update(usuarios).set(user).where(eq(usuarios.id, id)).returning();
    return updatedUser;
  }

  async deleteUser(id: number): Promise<void> {
    await db.update(usuarios).set({ estado: false }).where(eq(usuarios.id, id));
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(usuarios).where(eq(usuarios.estado, true));
  }

  // Role management
  async getRole(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id_rol, id));
    return role || undefined;
  }

  async getRoles(): Promise<Role[]> {
    return await db.select().from(roles).where(eq(roles.estado, true));
  }

  async createRole(role: InsertRole): Promise<Role> {
    const [newRole] = await db.insert(roles).values(role).returning();
    return newRole;
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role> {
    const [updatedRole] = await db.update(roles).set(role).where(eq(roles.id_rol, id)).returning();
    return updatedRole;
  }

  async deleteRole(id: number): Promise<void> {
    await db.update(roles).set({ estado: false }).where(eq(roles.id_rol, id));
  }

  // Geographic entities
  async getEstados(): Promise<Estado[]> {
    return await db.select().from(estados).where(eq(estados.estado, true));
  }

  async getEstado(id: number): Promise<Estado | undefined> {
    const [estado] = await db.select().from(estados).where(eq(estados.id_estado, id));
    return estado || undefined;
  }

  async createEstado(estado: InsertEstado): Promise<Estado> {
    const [newEstado] = await db.insert(estados).values(estado).returning();
    return newEstado;
  }

  async updateEstado(id: number, estado: Partial<InsertEstado>): Promise<Estado> {
    const [updatedEstado] = await db.update(estados).set(estado).where(eq(estados.id_estado, id)).returning();
    return updatedEstado;
  }

  async deleteEstado(id: number): Promise<void> {
    await db.update(estados).set({ estado: false }).where(eq(estados.id_estado, id));
  }

  async getMunicipios(): Promise<Municipio[]> {
    return await db.select().from(municipios).where(eq(municipios.estado, true));
  }

  async getMunicipiosByEstado(id_estado: number): Promise<Municipio[]> {
    return await db.select().from(municipios).where(and(eq(municipios.id_estado, id_estado), eq(municipios.estado, true)));
  }

  async getMunicipio(id: number): Promise<Municipio | undefined> {
    const [municipio] = await db.select().from(municipios).where(eq(municipios.id_municipio, id));
    return municipio || undefined;
  }

  async createMunicipio(municipio: InsertMunicipio): Promise<Municipio> {
    const [newMunicipio] = await db.insert(municipios).values(municipio).returning();
    return newMunicipio;
  }

  async updateMunicipio(id: number, municipio: Partial<InsertMunicipio>): Promise<Municipio> {
    const [updatedMunicipio] = await db.update(municipios).set(municipio).where(eq(municipios.id_municipio, id)).returning();
    return updatedMunicipio;
  }

  async deleteMunicipio(id: number): Promise<void> {
    await db.update(municipios).set({ estado: false }).where(eq(municipios.id_municipio, id));
  }

  async getParroquias(): Promise<Parroquia[]> {
    return await db.select().from(parroquias).where(eq(parroquias.estado, true));
  }

  async getParroquiasByMunicipio(id_municipio: number): Promise<Parroquia[]> {
    return await db.select().from(parroquias).where(and(eq(parroquias.id_municipio, id_municipio), eq(parroquias.estado, true)));
  }

  async getParroquia(id: number): Promise<Parroquia | undefined> {
    const [parroquia] = await db.select().from(parroquias).where(eq(parroquias.id_parroquia, id));
    return parroquia || undefined;
  }

  async createParroquia(parroquia: InsertParroquia): Promise<Parroquia> {
    const [newParroquia] = await db.insert(parroquias).values(parroquia).returning();
    return newParroquia;
  }

  async updateParroquia(id: number, parroquia: Partial<InsertParroquia>): Promise<Parroquia> {
    const [updatedParroquia] = await db.update(parroquias).set(parroquia).where(eq(parroquias.id_parroquia, id)).returning();
    return updatedParroquia;
  }

  async deleteParroquia(id: number): Promise<void> {
    await db.update(parroquias).set({ estado: false }).where(eq(parroquias.id_parroquia, id));
  }

  async getComunidades(): Promise<Comunidad[]> {
    return await db.select().from(comunidades).where(eq(comunidades.estado, true));
  }

  async getComunidadesByParroquia(id_parroquia: number): Promise<Comunidad[]> {
    return await db.select().from(comunidades).where(and(eq(comunidades.id_parroquia, id_parroquia), eq(comunidades.estado, true)));
  }

  async getComunidad(id: number): Promise<Comunidad | undefined> {
    const [comunidad] = await db.select().from(comunidades).where(eq(comunidades.id_comunidad, id));
    return comunidad || undefined;
  }

  async createComunidad(comunidad: InsertComunidad): Promise<Comunidad> {
    const [newComunidad] = await db.insert(comunidades).values(comunidad).returning();
    return newComunidad;
  }

  async updateComunidad(id: number, comunidad: Partial<InsertComunidad>): Promise<Comunidad> {
    const [updatedComunidad] = await db.update(comunidades).set(comunidad).where(eq(comunidades.id_comunidad, id)).returning();
    return updatedComunidad;
  }

  async deleteComunidad(id: number): Promise<void> {
    await db.update(comunidades).set({ estado: false }).where(eq(comunidades.id_comunidad, id));
  }

  async getUbicaciones(): Promise<Ubicacion[]> {
    return await db.select().from(ubicaciones).where(eq(ubicaciones.estado, true));
  }

  async getUbicacionesByComunidad(id_comunidad: number): Promise<Ubicacion[]> {
    return await db.select().from(ubicaciones).where(and(eq(ubicaciones.id_comunidad, id_comunidad), eq(ubicaciones.estado, true)));
  }

  async getUbicacion(id: number): Promise<Ubicacion | undefined> {
    const [ubicacion] = await db.select().from(ubicaciones).where(eq(ubicaciones.id_ubicacion, id));
    return ubicacion || undefined;
  }

  async createUbicacion(ubicacion: InsertUbicacion): Promise<Ubicacion> {
    const [newUbicacion] = await db.insert(ubicaciones).values(ubicacion).returning();
    return newUbicacion;
  }

  async updateUbicacion(id: number, ubicacion: Partial<InsertUbicacion>): Promise<Ubicacion> {
    const [updatedUbicacion] = await db.update(ubicaciones).set(ubicacion).where(eq(ubicaciones.id_ubicacion, id)).returning();
    return updatedUbicacion;
  }

  async deleteUbicacion(id: number): Promise<void> {
    await db.update(ubicaciones).set({ estado: false }).where(eq(ubicaciones.id_ubicacion, id));
  }

  // Personnel
  async getPersonal(): Promise<Personal[]> {
    return await db.select().from(personal).where(eq(personal.estado, true));
  }

  async getPersona(id: number): Promise<Personal | undefined> {
    const [persona] = await db.select().from(personal).where(eq(personal.id_persona, id));
    return persona || undefined;
  }

  async createPersona(persona: InsertPersonal): Promise<Personal> {
    const [newPersona] = await db.insert(personal).values(persona).returning();
    return newPersona;
  }

  async updatePersona(id: number, persona: Partial<InsertPersonal>): Promise<Personal> {
    const [updatedPersona] = await db.update(personal).set(persona).where(eq(personal.id_persona, id)).returning();
    return updatedPersona;
  }

  async deletePersona(id: number): Promise<void> {
    await db.update(personal).set({ estado: false }).where(eq(personal.id_persona, id));
  }

  // Voting centers
  async getCentrosVotacion(): Promise<CentroVotacion[]> {
    return await db.select().from(centrosVotacion).where(eq(centrosVotacion.estado, true));
  }

  async getCentroVotacion(id: number): Promise<CentroVotacion | undefined> {
    const [centro] = await db.select().from(centrosVotacion).where(eq(centrosVotacion.id_ce, id));
    return centro || undefined;
  }

  async createCentroVotacion(centro: InsertCentroVotacion): Promise<CentroVotacion> {
    const [newCentro] = await db.insert(centrosVotacion).values(centro).returning();
    return newCentro;
  }

  async updateCentroVotacion(id: number, centro: Partial<InsertCentroVotacion>): Promise<CentroVotacion> {
    const [updatedCentro] = await db.update(centrosVotacion).set(centro).where(eq(centrosVotacion.id_ce, id)).returning();
    return updatedCentro;
  }

  async deleteCentroVotacion(id: number): Promise<void> {
    await db.update(centrosVotacion).set({ estado: false }).where(eq(centrosVotacion.id_ce, id));
  }

  // Events
  async getEventos(): Promise<Evento[]> {
    return await db.select().from(eventos).where(eq(eventos.estado, true));
  }

  async getEvento(id: number): Promise<Evento | undefined> {
    const [evento] = await db.select().from(eventos).where(eq(eventos.id_evento, id));
    return evento || undefined;
  }

  async createEvento(evento: InsertEvento): Promise<Evento> {
    const [newEvento] = await db.insert(eventos).values(evento).returning();
    return newEvento;
  }

  async updateEvento(id: number, evento: Partial<InsertEvento>): Promise<Evento> {
    const [updatedEvento] = await db.update(eventos).set(evento).where(eq(eventos.id_evento, id)).returning();
    return updatedEvento;
  }

  async deleteEvento(id: number): Promise<void> {
    await db.update(eventos).set({ estado: false }).where(eq(eventos.id_evento, id));
  }

  // Afluencia
  async getAfluencia(): Promise<Afluencia[]> {
    return await db.select().from(afluencia).where(eq(afluencia.estado, true));
  }

  async getAfluenciaByEvento(id_evento: number): Promise<Afluencia[]> {
    return await db.select().from(afluencia).where(and(eq(afluencia.id_evento, id_evento), eq(afluencia.estado, true)));
  }

  async createAfluencia(afluenciaData: InsertAfluencia): Promise<Afluencia> {
    const [newAfluencia] = await db.insert(afluencia).values(afluenciaData).returning();
    return newAfluencia;
  }

  async updateAfluencia(id: number, afluenciaData: Partial<InsertAfluencia>): Promise<Afluencia> {
    const [updatedAfluencia] = await db.update(afluencia).set(afluenciaData).where(eq(afluencia.id_afluencia, id)).returning();
    return updatedAfluencia;
  }

  async deleteAfluencia(id: number): Promise<void> {
    await db.update(afluencia).set({ estado: false }).where(eq(afluencia.id_afluencia, id));
  }

  // Comunas
  async getComunas(): Promise<Comuna[]> {
    return await db.select().from(comunas).where(eq(comunas.estado, true));
  }

  async getComuna(id: number): Promise<Comuna | undefined> {
    const [comuna] = await db.select().from(comunas).where(eq(comunas.id_comuna, id));
    return comuna || undefined;
  }

  async createComuna(comuna: InsertComuna): Promise<Comuna> {
    const [newComuna] = await db.insert(comunas).values(comuna).returning();
    return newComuna;
  }

  async updateComuna(id: number, comuna: Partial<InsertComuna>): Promise<Comuna> {
    const [updatedComuna] = await db.update(comunas).set(comuna).where(eq(comunas.id_comuna, id)).returning();
    return updatedComuna;
  }

  async deleteComuna(id: number): Promise<void> {
    await db.update(comunas).set({ estado: false }).where(eq(comunas.id_comuna, id));
  }

  // Proyectos
  async getProyectos(): Promise<Proyecto[]> {
    return await db.select().from(proyectos).where(eq(proyectos.estado, true));
  }

  async getProyectosByComuna(id_comuna: number): Promise<Proyecto[]> {
    return await db.select().from(proyectos).where(and(eq(proyectos.id_comuna, id_comuna), eq(proyectos.estado, true)));
  }

  async getProyecto(id: number): Promise<Proyecto | undefined> {
    const [proyecto] = await db.select().from(proyectos).where(eq(proyectos.id_proyecto, id));
    return proyecto || undefined;
  }

  async createProyecto(proyecto: InsertProyecto): Promise<Proyecto> {
    const [newProyecto] = await db.insert(proyectos).values(proyecto).returning();
    return newProyecto;
  }

  async updateProyecto(id: number, proyecto: Partial<InsertProyecto>): Promise<Proyecto> {
    const [updatedProyecto] = await db.update(proyectos).set(proyecto).where(eq(proyectos.id_proyecto, id)).returning();
    return updatedProyecto;
  }

  async deleteProyecto(id: number): Promise<void> {
    await db.update(proyectos).set({ estado: false }).where(eq(proyectos.id_proyecto, id));
  }

  // T_Comunal
  async getTComunal(): Promise<TComunal[]> {
    return await db.select().from(tComunal).where(eq(tComunal.estado, true));
  }

  async createTComunal(tComunalData: InsertTComunal): Promise<TComunal> {
    const [newTComunal] = await db.insert(tComunal).values(tComunalData).returning();
    return newTComunal;
  }

  async updateTComunal(id: number, tComunalData: Partial<InsertTComunal>): Promise<TComunal> {
    const [updatedTComunal] = await db.update(tComunal).set(tComunalData).where(eq(tComunal.id_comunal, id)).returning();
    return updatedTComunal;
  }

  async deleteTComunal(id: number): Promise<void> {
    await db.update(tComunal).set({ estado: false }).where(eq(tComunal.id_comunal, id));
  }

  // Eventocc
  async getEventocc(): Promise<Eventocc[]> {
    return await db.select().from(eventocc).where(eq(eventocc.estado, true));
  }

  async getEventoccByEvento(id_evento: number): Promise<Eventocc[]> {
    return await db.select().from(eventocc).where(and(eq(eventocc.id_evento, id_evento), eq(eventocc.estado, true)));
  }

  async createEventocc(eventoccData: InsertEventocc): Promise<Eventocc> {
    const [newEventocc] = await db.insert(eventocc).values(eventoccData).returning();
    return newEventocc;
  }

  async updateEventocc(id: number, eventoccData: Partial<InsertEventocc>): Promise<Eventocc> {
    const [updatedEventocc] = await db.update(eventocc).set(eventoccData).where(eq(eventocc.id_cc, id)).returning();
    return updatedEventocc;
  }

  async deleteEventocc(id: number): Promise<void> {
    await db.update(eventocc).set({ estado: false }).where(eq(eventocc.id_cc, id));
  }

  // Consejos Comunales
  async getConsejosComunales(): Promise<ConsejoComunal[]> {
    return await db.select().from(consejosComunales).where(eq(consejosComunales.estado, true));
  }

  async getConsejoComunal(id: number): Promise<ConsejoComunal | undefined> {
    const [consejo] = await db.select().from(consejosComunales).where(eq(consejosComunales.id_consejo, id));
    return consejo || undefined;
  }

  async createConsejoComunal(consejo: InsertConsejoComunal): Promise<ConsejoComunal> {
    const [newConsejo] = await db.insert(consejosComunales).values(consejo).returning();
    return newConsejo;
  }

  async updateConsejoComunal(id: number, consejo: Partial<InsertConsejoComunal>): Promise<ConsejoComunal> {
    const [updatedConsejo] = await db.update(consejosComunales).set(consejo).where(eq(consejosComunales.id_consejo, id)).returning();
    return updatedConsejo;
  }

  async deleteConsejoComunal(id: number): Promise<void> {
    await db.update(consejosComunales).set({ estado: false }).where(eq(consejosComunales.id_consejo, id));
  }
}

export const storage = new DatabaseStorage();
