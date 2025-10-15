import { 
  usuarios, roles, estados, municipios, parroquias, comunidades, ubicaciones,
  personal, centrosVotacion, eventos, afluencia, comunas, proyectos, tComunal,
  eventocc, consejosComunales,
  type User, type InsertUser , type Role, type InsertRole,
  type Estado, type InsertEstado, type Municipio, type InsertMunicipio,
  type Parroquia, type InsertParroquia, type Comunidad, type InsertComunidad,
  type Ubicacion, type InsertUbicacion, type Personal, type InsertPersonal,
  type CentroVotacion, type InsertCentroVotacion, type Evento, type InsertEvento,
  type Afluencia, type InsertAfluencia, type Comuna, type InsertComuna,
  type Proyecto, type InsertProyecto, type TComunal, type InsertTComunal,
  type Eventocc, type InsertEventocc, type ConsejoComunal, type InsertConsejoComunal
} from "@shared/schema";
import { pool } from "./db"; // Importar el pool de conexiones
import session from "express-session";
import connectPg from "connect-pg-simple";

type SessionStore = session.Store;

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User management
  getUser (id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser (user: InsertUser ): Promise<User>;
  updateUser (id: number, user: Partial<InsertUser >): Promise<User>;
  deleteUser (id: number): Promise<void>;
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
  async getUser (id: number): Promise<User | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM usuarios WHERE id = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM usuarios WHERE email = $1', [username]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

   async getUserByEmail(email: string) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "SELECT * FROM usuarios WHERE email = $1",
        [email]
      );
      return res.rows[0] || null;
    } finally {
      client.release();
    }
  }


  async createUser (user: InsertUser ): Promise<User> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO usuarios (id_rol, cedula, nombre, apellido, email, telefono, contrasena, estado) VALUES ($1, $2, $3, $4, $5, $6, crypt($7, gen_salt(\'bf\')), TRUE) RETURNING *',
        [user.id_rol, user.cedula, user.nombre, user.apellido, user.email, user.telefono, user.contrasena]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateUser (id: number, user: Partial<InsertUser >): Promise<User> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE usuarios SET cedula = $1, nombre = $2, apellido = $3, email = $4, telefono = $5, contrasena = crypt($6, gen_salt(\'bf\')) WHERE id = $7 RETURNING *',
        [user.cedula, user.nombre, user.apellido, user.email, user.telefono, user.contrasena, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteUser (id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE usuarios SET estado = FALSE WHERE id = $1', [id]);
    } finally {
      client.release();
    }
  }

  async getUsers(): Promise<User[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM usuarios WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  // Role management
  async getRole(id: number): Promise<Role | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM roles WHERE id_rol = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async getRoles(): Promise<Role[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM roles WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async createRole(role: InsertRole): Promise<Role> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO roles (nombre, descripcion, nivel_acceso, estado) VALUES ($1, $2, $3, TRUE) RETURNING *',
        [role.nombre, role.descripcion, role.nivel_acceso]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateRole(id: number, role: Partial<InsertRole>): Promise<Role> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE roles SET nombre = $1, descripcion = $2, nivel_acceso = $3 WHERE id_rol = $4 RETURNING *',
        [role.nombre, role.descripcion, role.nivel_acceso, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteRole(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE roles SET estado = FALSE WHERE id_rol = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Estado management
  async getEstados(): Promise<Estado[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM estados WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getEstado(id: number): Promise<Estado | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM estados WHERE id_estado = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createEstado(estado: InsertEstado): Promise<Estado> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO estados (nombre, descripcion) VALUES ($1, $2) RETURNING *',
        [estado.nombre, estado.descripcion]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateEstado(id: number, estado: Partial<InsertEstado>): Promise<Estado> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE estados SET nombre = $1, descripcion = $2 WHERE id_estado = $3 RETURNING *',
        [estado.nombre, estado.descripcion, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteEstado(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE estados SET estado = FALSE WHERE id_estado = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Municipio management
  async getMunicipios(): Promise<Municipio[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM municipios WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getMunicipiosByEstado(id_estado: number): Promise<Municipio[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM municipios WHERE id_estado = $1 AND estado = TRUE', [id_estado]);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getMunicipio(id: number): Promise<Municipio | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM municipios WHERE id_municipio = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createMunicipio(municipio: InsertMunicipio): Promise<Municipio> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO municipios (id_estado, nombre) VALUES ($1, $2) RETURNING *',
        [municipio.id_estado, municipio.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateMunicipio(id: number, municipio: Partial<InsertMunicipio>): Promise<Municipio> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE municipios SET id_estado = $1, nombre = $2 WHERE id_municipio = $3 RETURNING *',
        [municipio.id_estado, municipio.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteMunicipio(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE municipios SET estado = FALSE WHERE id_municipio = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Parroquia management
  async getParroquias(): Promise<Parroquia[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM parroquias WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getParroquiasByMunicipio(id_municipio: number): Promise<Parroquia[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM parroquias WHERE id_municipio = $1 AND estado = TRUE', [id_municipio]);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getParroquia(id: number): Promise<Parroquia | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM parroquias WHERE id_parroquia = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createParroquia(parroquia: InsertParroquia): Promise<Parroquia> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO parroquias (id_municipio, nombre) VALUES ($1, $2) RETURNING *',
        [parroquia.id_municipio, parroquia.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateParroquia(id: number, parroquia: Partial<InsertParroquia>): Promise<Parroquia> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE parroquias SET id_municipio = $1, nombre = $2 WHERE id_parroquia = $3 RETURNING *',
        [parroquia.id_municipio, parroquia.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteParroquia(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE parroquias SET estado = FALSE WHERE id_parroquia = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Comunidad management
  async getComunidades(): Promise<Comunidad[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM comunidades WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getComunidadesByParroquia(id_parroquia: number): Promise<Comunidad[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM comunidades WHERE id_parroquia = $1 AND estado = TRUE', [id_parroquia]);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getComunidad(id: number): Promise<Comunidad | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM comunidades WHERE id_comunidad = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createComunidad(comunidad: InsertComunidad): Promise<Comunidad> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO comunidades (id_parroquia, nombre) VALUES ($1, $2) RETURNING *',
        [comunidad.id_parroquia, comunidad.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateComunidad(id: number, comunidad: Partial<InsertComunidad>): Promise<Comunidad> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE comunidades SET id_parroquia = $1, nombre = $2 WHERE id_comunidad = $3 RETURNING *',
        [comunidad.id_parroquia, comunidad.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteComunidad(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE comunidades SET estado = FALSE WHERE id_comunidad = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Ubicacion management
  async getUbicaciones(): Promise<Ubicacion[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM ubicaciones WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getUbicacionesByComunidad(id_comunidad: number): Promise<Ubicacion[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM ubicaciones WHERE id_comunidad = $1 AND estado = TRUE', [id_comunidad]);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getUbicacion(id: number): Promise<Ubicacion | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM ubicaciones WHERE id_ubicacion = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createUbicacion(ubicacion: InsertUbicacion): Promise<Ubicacion> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO ubicaciones (id_comunidad, nombre, calle, avenida, referencia) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [ubicacion.id_comunidad, ubicacion.nombre, ubicacion.calle, ubicacion.avenida, ubicacion.referencia]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateUbicacion(id: number, ubicacion: Partial<InsertUbicacion>): Promise<Ubicacion> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE ubicaciones SET id_comunidad = $1, nombre = $2, calle = $3, avenida = $4, referencia = $5 WHERE id_ubicacion = $6 RETURNING *',
        [ubicacion.id_comunidad, ubicacion.nombre, ubicacion.calle, ubicacion.avenida, ubicacion.referencia, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteUbicacion(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE ubicaciones SET estado = FALSE WHERE id_ubicacion = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Personal management
  async getPersonal(): Promise<Personal[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM personal WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getPersona(id: number): Promise<Personal | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM personal WHERE id_persona = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createPersona(persona: InsertPersonal): Promise<Personal> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO personal (cedula, nombre, apellido, cuenta, telefono, cargo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [persona.cedula, persona.nombre, persona.apellido, persona.cuenta, persona.telefono, persona.cargo]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updatePersona(id: number, persona: Partial<InsertPersonal>): Promise<Personal> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE personal SET cedula = $1, nombre = $2, apellido = $3, cuenta = $4, telefono = $5, cargo = $6 WHERE id_persona = $7 RETURNING *',
        [persona.cedula, persona.nombre, persona.apellido, persona.cuenta, persona.telefono, persona.cargo, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deletePersona(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE personal SET estado = FALSE WHERE id_persona = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Centro de Votacion management
  async getCentrosVotacion(): Promise<CentroVotacion[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM centro_de_votacion WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getCentroVotacion(id: number): Promise<CentroVotacion | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM centro_de_votacion WHERE id_ce = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createCentroVotacion(centro: InsertCentroVotacion): Promise<CentroVotacion> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO centro_de_votacion (id_persona, id_ubicacion, nombre, mesas, codigo) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [centro.id_persona, centro.id_ubicacion, centro.nombre, centro.mesas, centro.codigo]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateCentroVotacion(id: number, centro: Partial<InsertCentroVotacion>): Promise<CentroVotacion> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE centro_de_votacion SET id_persona = $1, id_ubicacion = $2, nombre = $3, mesas = $4, codigo = $5 WHERE id_ce = $6 RETURNING *',
        [centro.id_persona, centro.id_ubicacion, centro.nombre, centro.mesas, centro.codigo, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteCentroVotacion(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE centro_de_votacion SET estado = FALSE WHERE id_ce = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Evento management
  async getEventos(): Promise<Evento[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM evento WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getEvento(id: number): Promise<Evento | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM evento WHERE id_evento = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createEvento(evento: InsertEvento): Promise<Evento> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO evento (id_ce, nombre, fecha_evento) VALUES ($1, $2, $3) RETURNING *',
        [evento.id_ce, evento.nombre, evento.fecha_evento]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateEvento(id: number, evento: Partial<InsertEvento>): Promise<Evento> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE evento SET id_ce = $1, nombre = $2, fecha_evento = $3 WHERE id_evento = $4 RETURNING *',
        [evento.id_ce, evento.nombre, evento.fecha_evento, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteEvento(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE evento SET estado = FALSE WHERE id_evento = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Afluencia management
  async getAfluencia(): Promise<Afluencia[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM afluencia WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getAfluenciaByEvento(id_evento: number): Promise<Afluencia[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM afluencia WHERE id_evento = $1 AND estado = TRUE', [id_evento]);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async createAfluencia(afluencia: InsertAfluencia): Promise<Afluencia> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO afluencia (id_evento, cantidad, hora) VALUES ($1, $2, $3) RETURNING *',
        [afluencia.id_evento, afluencia.cantidad, afluencia.hora]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateAfluencia(id: number, afluencia: Partial<InsertAfluencia>): Promise<Afluencia> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE afluencia SET id_evento = $1, cantidad = $2, hora = $3 WHERE id_afluencia = $4 RETURNING *',
        [afluencia.id_evento, afluencia.cantidad, afluencia.hora, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteAfluencia(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE afluencia SET estado = FALSE WHERE id_afluencia = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Comuna management
  async getComunas(): Promise<Comuna[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM comuna WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getComuna(id: number): Promise<Comuna | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM comuna WHERE id_comuna = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createComuna(comuna: InsertComuna): Promise<Comuna> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO comuna (codigo, nombre, cantidad_electores) VALUES ($1, $2, $3) RETURNING *',
        [comuna.codigo, comuna.nombre, comuna.cantidad_electores]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateComuna(id: number, comuna: Partial<InsertComuna>): Promise<Comuna> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE comuna SET codigo = $1, nombre = $2, cantidad_electores = $3 WHERE id_comuna = $4 RETURNING *',
        [comuna.codigo, comuna.nombre, comuna.cantidad_electores, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteComuna(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE comuna SET estado = FALSE WHERE id_comuna = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Proyecto management
  async getProyectos(): Promise<Proyecto[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM proyecto WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getProyectosByComuna(id_comuna: number): Promise<Proyecto[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM proyecto WHERE id_comuna = $1 AND estado = TRUE', [id_comuna]);
      return res.rows;
    } finally {
      client.release ();
    }
  }

  async getProyecto(id: number): Promise<Proyecto | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM proyecto WHERE id_proyecto = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createProyecto(proyecto: InsertProyecto): Promise<Proyecto> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO proyecto (id_comuna, nombre) VALUES ($1, $2) RETURNING *',
        [proyecto.id_comuna, proyecto.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateProyecto(id: number, proyecto: Partial<InsertProyecto>): Promise<Proyecto> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE proyecto SET id_comuna = $1, nombre = $2 WHERE id_proyecto = $3 RETURNING *',
        [proyecto.id_comuna, proyecto.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteProyecto(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE proyecto SET estado = FALSE WHERE id_proyecto = $1', [id]);
    } finally {
      client.release();
    }
  }

  // T_Comunal management
  async getTComunal(): Promise<TComunal[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM t_comunal WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async createTComunal(tComunal: InsertTComunal): Promise<TComunal> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO t_comunal (id_proyecto, id_evento, resultado) VALUES ($1, $2, $3) RETURNING *',
        [tComunal.id_proyecto, tComunal.id_evento, tComunal.resultado]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateTComunal(id: number, tComunal: Partial<InsertTComunal>): Promise<TComunal> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE t_comunal SET id_proyecto = $1, id_evento = $2, resultado = $3 WHERE id_comunal = $4 RETURNING *',
        [tComunal.id_proyecto, tComunal.id_evento, tComunal.resultado, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteTComunal(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE t_comunal SET estado = FALSE WHERE id_comunal = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Eventocc management
  async getEventocc(): Promise<Eventocc[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM eventocc WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getEventoccByEvento(id_evento: number): Promise<Eventocc[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM eventocc WHERE id_evento = $1 AND estado = TRUE', [id_evento]);
      return res.rows;
    } finally {
      client.release();
    }
  }

  async createEventocc(eventocc: InsertEventocc): Promise<Eventocc> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO eventocc (id_evento, codigo, nombre, voceria, resultado, cantidad_electores) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [eventocc.id_evento, eventocc.codigo, eventocc.nombre, eventocc.voceria, eventocc.resultado, eventocc.cantidad_electores]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateEventocc(id: number, eventocc: Partial<InsertEventocc>): Promise<Eventocc> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE eventocc SET id_evento = $1, codigo = $2, nombre = $3, voceria = $4, resultado = $5, cantidad_electores = $6 WHERE id_cc = $7 RETURNING *',
        [eventocc.id_evento, eventocc.codigo, eventocc.nombre, eventocc.voceria, eventocc.resultado, eventocc.cantidad_electores, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteEventocc(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE eventocc SET estado = FALSE WHERE id_cc = $1', [id]);
    } finally {
      client.release();
    }
  }

  // Consejo Comunal management
  async getConsejosComunales(): Promise<ConsejoComunal[]> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM consejo_comunal WHERE estado = TRUE');
      return res.rows;
    } finally {
      client.release();
    }
  }

  async getConsejoComunal(id: number): Promise<ConsejoComunal | undefined> {
    const client = await pool.connect();
    try {
      const res = await client.query('SELECT * FROM consejo_comunal WHERE id_consejo = $1', [id]);
      return res.rows[0] || undefined;
    } finally {
      client.release();
    }
  }

  async createConsejoComunal(consejo: InsertConsejoComunal): Promise<ConsejoComunal> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'INSERT INTO consejo_comunal (id_cc, nombre, apellido, rif, fecha_eleccion, cantidad_electores) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [consejo.id_cc, consejo.nombre, consejo.apellido, consejo.rif, consejo.fecha_eleccion, consejo.cantidad_electores]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async updateConsejoComunal(id: number, consejo: Partial<InsertConsejoComunal>): Promise<ConsejoComunal> {
    const client = await pool.connect();
    try {
      const res = await client.query(
        'UPDATE consejo_comunal SET id_cc = $1, nombre = $2, apellido = $3, rif = $4, fecha_eleccion = $5, cantidad_electores = $6 WHERE id_consejo = $7 RETURNING *',
        [consejo.id_cc, consejo.nombre, consejo.apellido, consejo.rif, consejo.fecha_eleccion, consejo.cantidad_electores, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }

  async deleteConsejoComunal(id: number): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('UPDATE consejo_comunal SET estado = FALSE WHERE id_consejo = $1', [id]);
    } finally {
      client.release();
    }
  }
}

export const storage = new DatabaseStorage();
