// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/auth.ts
import bcrypt from "bcrypt";

// server/db.ts
import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();
var DATABASE_URL = process.env.DATABASE_URL || "postgres://postgres:Sce.2025@localhost:5432/sce";
var pool = new Pool({ connectionString: DATABASE_URL });
var testConnection = async () => {
  let client;
  try {
    client = await pool.connect();
    console.log("Conectado a la base de datos PostgreSQL");
  } catch (err) {
    console.error("Error de conexi\xF3n a la base de datos:", err.message);
    console.error("Verifica que PostgreSQL est\xE9 corriendo y que la cadena de conexi\xF3n sea correcta.");
  } finally {
    if (client) client.release();
  }
};
testConnection();

// server/storage.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({ pool, createTableIfMissing: true });
  }
  // User management
  async getUser(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM usuarios WHERE id = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async getUserByUsername(username) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM usuarios WHERE email = $1", [username]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async getUserByEmail(email) {
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
  async createUser(user) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO usuarios (id_rol, cedula, nombre, apellido, email, telefono, contrasena, estado) VALUES ($1, $2, $3, $4, $5, $6, crypt($7, gen_salt('bf')), TRUE) RETURNING *",
        [user.id_rol, user.cedula, user.nombre, user.apellido, user.email, user.telefono, user.contrasena]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateUser(id, user) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE usuarios SET cedula = $1, nombre = $2, apellido = $3, email = $4, telefono = $5, contrasena = crypt($6, gen_salt('bf')) WHERE id = $7 RETURNING *",
        [user.cedula, user.nombre, user.apellido, user.email, user.telefono, user.contrasena, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteUser(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE usuarios SET estado = FALSE WHERE id = $1", [id]);
    } finally {
      client.release();
    }
  }
  async getUsers() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM usuarios WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  // Role management
  async getRole(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM roles WHERE id_rol = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async getRoles() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM roles WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async createRole(role) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO roles (nombre, descripcion, nivel_acceso, estado) VALUES ($1, $2, $3, TRUE) RETURNING *",
        [role.nombre, role.descripcion, role.nivel_acceso]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateRole(id, role) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE roles SET nombre = $1, descripcion = $2, nivel_acceso = $3 WHERE id_rol = $4 RETURNING *",
        [role.nombre, role.descripcion, role.nivel_acceso, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteRole(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE roles SET estado = FALSE WHERE id_rol = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Estado management
  async getEstados() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM estados WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getEstado(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM estados WHERE id_estado = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createEstado(estado) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO estados (nombre, descripcion) VALUES ($1, $2) RETURNING *",
        [estado.nombre, estado.descripcion]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateEstado(id, estado) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE estados SET nombre = $1, descripcion = $2 WHERE id_estado = $3 RETURNING *",
        [estado.nombre, estado.descripcion, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteEstado(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE estados SET estado = FALSE WHERE id_estado = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Municipio management
  async getMunicipios() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM municipios WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getMunicipiosByEstado(id_estado) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM municipios WHERE id_estado = $1 AND estado = TRUE", [id_estado]);
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getMunicipio(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM municipios WHERE id_municipio = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createMunicipio(municipio) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO municipios (id_estado, nombre) VALUES ($1, $2) RETURNING *",
        [municipio.id_estado, municipio.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateMunicipio(id, municipio) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE municipios SET id_estado = $1, nombre = $2 WHERE id_municipio = $3 RETURNING *",
        [municipio.id_estado, municipio.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteMunicipio(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE municipios SET estado = FALSE WHERE id_municipio = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Parroquia management
  async getParroquias() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM parroquias WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getParroquiasByMunicipio(id_municipio) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM parroquias WHERE id_municipio = $1 AND estado = TRUE", [id_municipio]);
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getParroquia(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM parroquias WHERE id_parroquia = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createParroquia(parroquia) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO parroquias (id_municipio, nombre) VALUES ($1, $2) RETURNING *",
        [parroquia.id_municipio, parroquia.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateParroquia(id, parroquia) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE parroquias SET id_municipio = $1, nombre = $2 WHERE id_parroquia = $3 RETURNING *",
        [parroquia.id_municipio, parroquia.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteParroquia(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE parroquias SET estado = FALSE WHERE id_parroquia = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Comunidad management
  async getComunidades() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM comunidades WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getComunidadesByParroquia(id_parroquia) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM comunidades WHERE id_parroquia = $1 AND estado = TRUE", [id_parroquia]);
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getComunidad(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM comunidades WHERE id_comunidad = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createComunidad(comunidad) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO comunidades (id_parroquia, nombre) VALUES ($1, $2) RETURNING *",
        [comunidad.id_parroquia, comunidad.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateComunidad(id, comunidad) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE comunidades SET id_parroquia = $1, nombre = $2 WHERE id_comunidad = $3 RETURNING *",
        [comunidad.id_parroquia, comunidad.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteComunidad(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE comunidades SET estado = FALSE WHERE id_comunidad = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Ubicacion management
  async getUbicaciones() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM ubicaciones WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getUbicacionesByComunidad(id_comunidad) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM ubicaciones WHERE id_comunidad = $1 AND estado = TRUE", [id_comunidad]);
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getUbicacion(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM ubicaciones WHERE id_ubicacion = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createUbicacion(ubicacion) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO ubicaciones (id_comunidad, nombre, calle, avenida, referencia) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [ubicacion.id_comunidad, ubicacion.nombre, ubicacion.calle, ubicacion.avenida, ubicacion.referencia]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateUbicacion(id, ubicacion) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE ubicaciones SET id_comunidad = $1, nombre = $2, calle = $3, avenida = $4, referencia = $5 WHERE id_ubicacion = $6 RETURNING *",
        [ubicacion.id_comunidad, ubicacion.nombre, ubicacion.calle, ubicacion.avenida, ubicacion.referencia, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteUbicacion(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE ubicaciones SET estado = FALSE WHERE id_ubicacion = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Personal management
  async getPersonal() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM personal WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getPersona(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM personal WHERE id_persona = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createPersona(persona) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO personal (cedula, nombre, apellido, cuenta, telefono, cargo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [persona.cedula, persona.nombre, persona.apellido, persona.cuenta, persona.telefono, persona.cargo]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updatePersona(id, persona) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE personal SET cedula = $1, nombre = $2, apellido = $3, cuenta = $4, telefono = $5, cargo = $6 WHERE id_persona = $7 RETURNING *",
        [persona.cedula, persona.nombre, persona.apellido, persona.cuenta, persona.telefono, persona.cargo, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deletePersona(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE personal SET estado = FALSE WHERE id_persona = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Centro de Votacion management
  async getCentrosVotacion() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM centro_de_votacion WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getCentroVotacion(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM centro_de_votacion WHERE id_ce = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createCentroVotacion(centro) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO centro_de_votacion (id_persona, id_ubicacion, nombre, mesas, codigo) VALUES ($1, $2, $3, $4, $5) RETURNING *",
        [centro.id_persona, centro.id_ubicacion, centro.nombre, centro.mesas, centro.codigo]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateCentroVotacion(id, centro) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE centro_de_votacion SET id_persona = $1, id_ubicacion = $2, nombre = $3, mesas = $4, codigo = $5 WHERE id_ce = $6 RETURNING *",
        [centro.id_persona, centro.id_ubicacion, centro.nombre, centro.mesas, centro.codigo, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteCentroVotacion(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE centro_de_votacion SET estado = FALSE WHERE id_ce = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Evento management
  async getEventos() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM evento WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getEvento(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM evento WHERE id_evento = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createEvento(evento) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO evento (id_ce, nombre, fecha_evento) VALUES ($1, $2, $3) RETURNING *",
        [evento.id_ce, evento.nombre, evento.fecha_evento]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateEvento(id, evento) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE evento SET id_ce = $1, nombre = $2, fecha_evento = $3 WHERE id_evento = $4 RETURNING *",
        [evento.id_ce, evento.nombre, evento.fecha_evento, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteEvento(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE evento SET estado = FALSE WHERE id_evento = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Afluencia management
  async getAfluencia() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM afluencia WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getAfluenciaByEvento(id_evento) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM afluencia WHERE id_evento = $1 AND estado = TRUE", [id_evento]);
      return res.rows;
    } finally {
      client.release();
    }
  }
  async createAfluencia(afluencia2) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO afluencia (id_evento, cantidad, hora) VALUES ($1, $2, $3) RETURNING *",
        [afluencia2.id_evento, afluencia2.cantidad, afluencia2.hora]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateAfluencia(id, afluencia2) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE afluencia SET id_evento = $1, cantidad = $2, hora = $3 WHERE id_afluencia = $4 RETURNING *",
        [afluencia2.id_evento, afluencia2.cantidad, afluencia2.hora, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteAfluencia(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE afluencia SET estado = FALSE WHERE id_afluencia = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Comuna management
  async getComunas() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM comuna WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getComuna(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM comuna WHERE id_comuna = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createComuna(comuna) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO comuna (codigo, nombre, cantidad_electores) VALUES ($1, $2, $3) RETURNING *",
        [comuna.codigo, comuna.nombre, comuna.cantidad_electores]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateComuna(id, comuna) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE comuna SET codigo = $1, nombre = $2, cantidad_electores = $3 WHERE id_comuna = $4 RETURNING *",
        [comuna.codigo, comuna.nombre, comuna.cantidad_electores, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteComuna(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE comuna SET estado = FALSE WHERE id_comuna = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Proyecto management
  async getProyectos() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM proyecto WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getProyectosByComuna(id_comuna) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM proyecto WHERE id_comuna = $1 AND estado = TRUE", [id_comuna]);
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getProyecto(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM proyecto WHERE id_proyecto = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createProyecto(proyecto) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO proyecto (id_comuna, nombre) VALUES ($1, $2) RETURNING *",
        [proyecto.id_comuna, proyecto.nombre]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateProyecto(id, proyecto) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE proyecto SET id_comuna = $1, nombre = $2 WHERE id_proyecto = $3 RETURNING *",
        [proyecto.id_comuna, proyecto.nombre, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteProyecto(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE proyecto SET estado = FALSE WHERE id_proyecto = $1", [id]);
    } finally {
      client.release();
    }
  }
  // T_Comunal management
  async getTComunal() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM t_comunal WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async createTComunal(tComunal2) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO t_comunal (id_proyecto, id_evento, resultado) VALUES ($1, $2, $3) RETURNING *",
        [tComunal2.id_proyecto, tComunal2.id_evento, tComunal2.resultado]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateTComunal(id, tComunal2) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE t_comunal SET id_proyecto = $1, id_evento = $2, resultado = $3 WHERE id_comunal = $4 RETURNING *",
        [tComunal2.id_proyecto, tComunal2.id_evento, tComunal2.resultado, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteTComunal(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE t_comunal SET estado = FALSE WHERE id_comunal = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Eventocc management
  async getEventocc() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM eventocc WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getEventoccByEvento(id_evento) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM eventocc WHERE id_evento = $1 AND estado = TRUE", [id_evento]);
      return res.rows;
    } finally {
      client.release();
    }
  }
  async createEventocc(eventocc2) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO eventocc (id_evento, codigo, nombre, voceria, resultado, cantidad_electores) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [eventocc2.id_evento, eventocc2.codigo, eventocc2.nombre, eventocc2.voceria, eventocc2.resultado, eventocc2.cantidad_electores]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateEventocc(id, eventocc2) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE eventocc SET id_evento = $1, codigo = $2, nombre = $3, voceria = $4, resultado = $5, cantidad_electores = $6 WHERE id_cc = $7 RETURNING *",
        [eventocc2.id_evento, eventocc2.codigo, eventocc2.nombre, eventocc2.voceria, eventocc2.resultado, eventocc2.cantidad_electores, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteEventocc(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE eventocc SET estado = FALSE WHERE id_cc = $1", [id]);
    } finally {
      client.release();
    }
  }
  // Consejo Comunal management
  async getConsejosComunales() {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM consejo_comunal WHERE estado = TRUE");
      return res.rows;
    } finally {
      client.release();
    }
  }
  async getConsejoComunal(id) {
    const client = await pool.connect();
    try {
      const res = await client.query("SELECT * FROM consejo_comunal WHERE id_consejo = $1", [id]);
      return res.rows[0] || void 0;
    } finally {
      client.release();
    }
  }
  async createConsejoComunal(consejo) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "INSERT INTO consejo_comunal (id_cc, nombre, apellido, rif, fecha_eleccion, cantidad_electores) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [consejo.id_cc, consejo.nombre, consejo.apellido, consejo.rif, consejo.fecha_eleccion, consejo.cantidad_electores]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async updateConsejoComunal(id, consejo) {
    const client = await pool.connect();
    try {
      const res = await client.query(
        "UPDATE consejo_comunal SET id_cc = $1, nombre = $2, apellido = $3, rif = $4, fecha_eleccion = $5, cantidad_electores = $6 WHERE id_consejo = $7 RETURNING *",
        [consejo.id_cc, consejo.nombre, consejo.apellido, consejo.rif, consejo.fecha_eleccion, consejo.cantidad_electores, id]
      );
      return res.rows[0];
    } finally {
      client.release();
    }
  }
  async deleteConsejoComunal(id) {
    const client = await pool.connect();
    try {
      await client.query("UPDATE consejo_comunal SET estado = FALSE WHERE id_consejo = $1", [id]);
    } finally {
      client.release();
    }
  }
};
var storage = new DatabaseStorage();

// server/auth.ts
async function hashPassword(password) {
  if (!password) {
    throw new Error("Password is required");
  }
  return await bcrypt.hash(password, 12);
}
async function comparePasswords(password, storedHash) {
  if (!password || !storedHash) {
    throw new Error("Password and stored hash are required");
  }
  return await bcrypt.compare(password, storedHash);
}
function setupAuth(app2) {
  app2.post("/api/register", async (req, res) => {
    try {
      if (!req.body) {
        return res.status(400).json({
          success: false,
          error: "REQUEST_BODY_MISSING",
          message: "Request body is required",
          details: "Please provide user details in JSON format"
        });
      }
      const { email, password, ...rest } = req.body;
      if (!email || !password) {
        const missingFields = [];
        if (!email) missingFields.push("email");
        if (!password) missingFields.push("password");
        return res.status(400).json({
          success: false,
          error: "MISSING_REQUIRED_FIELDS",
          message: "Validation failed",
          details: `The following fields are required: ${missingFields.join(", ")}`,
          missingFields
        });
      }
      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          error: "PASSWORD_TOO_SHORT",
          message: "Password doesn't meet requirements",
          details: "Password must be at least 8 characters long"
        });
      }
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: "EMAIL_EXISTS",
          message: "Registration failed",
          details: "The email is already registered",
          suggestion: "Please use a different email"
        });
      }
      const newUser = await storage.createUser({
        email,
        ...rest,
        contrasena: await hashPassword(password)
      });
      return res.status(201).json({
        success: true,
        message: "Registration successful",
        user: newUser
      });
    } catch (error) {
      console.error("Registration error:", error);
      const errorResponse = {
        success: false,
        error: "REGISTRATION_FAILED",
        message: "Internal server error during registration"
      };
      if (error.message.includes("Password")) {
        errorResponse.error = "PASSWORD_VALIDATION_FAILED";
        errorResponse.message = error.message;
      } else if (error.message.includes("database") || error.message.includes("storage")) {
        errorResponse.error = "DATABASE_ERROR";
      }
      res.status(500).json({
        ...errorResponse,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        details: process.env.NODE_ENV === "development" ? error.message : void 0,
        // Línea corregida
        errorType: error.constructor.name
      });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ success: false, message: "Usuario no encontrado" });
      }
      const isPasswordValid = await comparePasswords(password, user.contrasena);
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Contrase\xF1a incorrecta" });
      }
      res.json({ success: true, user });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ success: false, message: "Error interno", error: error.message });
    }
  });
  app2.post("/api/logout", (req, res) => {
    res.status(200).json({ success: true, message: "Sesi\xF3n cerrada" });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });
}

// shared/schema.ts
import { pgTable, serial, integer, boolean, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
var roles = pgTable("roles", {
  id_rol: serial("id_rol").primaryKey(),
  nombre: varchar("nombre", { length: 60 }).notNull().unique(),
  descripcion: varchar("descripcion", { length: 255 }),
  nivel_acceso: integer("nivel_acceso").notNull(),
  estado: boolean("estado").default(true)
});
var usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  id_rol: integer("id_rol").references(() => roles.id_rol),
  cedula: varchar("cedula", { length: 20 }).notNull(),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  apellido: varchar("apellido", { length: 60 }).notNull(),
  email: varchar("email", { length: 60 }).notNull().unique(),
  telefono: varchar("telefono", { length: 15 }).notNull(),
  contrasena: varchar("contrasena", { length: 255 }).notNull(),
  token: varchar("token", { length: 255 }),
  fecha_token: timestamp("fecha_token"),
  fecha_registro: timestamp("fecha_registro").defaultNow(),
  estado: boolean("estado").default(true)
});
var estados = pgTable("estado", {
  id_estado: serial("id_estado").primaryKey(),
  nombre: varchar("nombre", { length: 60 }).notNull().unique(),
  estado: boolean("estado").default(true)
});
var municipios = pgTable("municipio", {
  id_municipio: serial("id_municipio").primaryKey(),
  id_estado: integer("id_estado").references(() => estados.id_estado),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});
var parroquias = pgTable("parroquia", {
  id_parroquia: serial("id_parroquia").primaryKey(),
  id_municipio: integer("id_municipio").references(() => municipios.id_municipio),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});
var comunidades = pgTable("comunidad", {
  id_comunidad: serial("id_comunidad").primaryKey(),
  id_parroquia: integer("id_parroquia").references(() => parroquias.id_parroquia),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});
var ubicaciones = pgTable("ubicacion", {
  id_ubicacion: serial("id_ubicacion").primaryKey(),
  id_comunidad: integer("id_comunidad").references(() => comunidades.id_comunidad),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  calle: varchar("calle", { length: 120 }).notNull(),
  avenida: varchar("avenida", { length: 120 }).notNull(),
  referencia: varchar("referencia", { length: 200 }).notNull(),
  estado: boolean("estado").default(true)
});
var personal = pgTable("personal", {
  id_persona: serial("id_persona").primaryKey(),
  cedula: varchar("cedula", { length: 20 }).notNull(),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  apellido: varchar("apellido", { length: 120 }).notNull(),
  cuenta: varchar("cuenta", { length: 60 }).notNull().unique(),
  telefono: varchar("telefono", { length: 17 }).notNull(),
  cargo: varchar("cargo", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});
var centrosVotacion = pgTable("centro_de_votacion", {
  id_ce: serial("id_ce").primaryKey(),
  id_persona: integer("id_persona").references(() => personal.id_persona),
  id_ubicacion: integer("id_ubicacion").references(() => ubicaciones.id_ubicacion),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  mesas: integer("mesas").notNull(),
  codigo: integer("codigo").notNull().unique(),
  estado: boolean("estado").default(true)
});
var eventos = pgTable("evento", {
  id_evento: serial("id_evento").primaryKey(),
  id_ce: integer("id_ce").references(() => centrosVotacion.id_ce),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  fecha_evento: timestamp("fecha_evento").notNull(),
  estado: boolean("estado").default(true)
});
var afluencia = pgTable("afluencia", {
  id_afluencia: serial("id_afluencia").primaryKey(),
  id_evento: integer("id_evento").references(() => eventos.id_evento),
  cantidad: integer("cantidad").notNull(),
  hora: timestamp("hora"),
  estado: boolean("estado").default(true)
});
var comunas = pgTable("comuna", {
  id_comuna: serial("id_comuna").primaryKey(),
  codigo: integer("codigo").unique(),
  nombre: varchar("nombre", { length: 120 }).notNull(),
  cantidad_electores: integer("cantidad_electores").notNull(),
  estado: boolean("estado").default(true)
});
var proyectos = pgTable("proyecto", {
  id_proyecto: serial("id_proyecto").primaryKey(),
  id_comuna: integer("id_comuna").references(() => comunas.id_comuna),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});
var tComunal = pgTable("t_comunal", {
  id_comunal: serial("id_comunal").primaryKey(),
  id_proyecto: integer("id_proyecto").references(() => proyectos.id_proyecto),
  id_evento: integer("id_evento").references(() => eventos.id_evento),
  resultado: integer("resultado").notNull(),
  estado: boolean("estado").default(true)
});
var eventocc = pgTable("eventocc", {
  id_cc: serial("id_cc").primaryKey(),
  id_evento: integer("id_evento").references(() => eventos.id_evento),
  codigo: integer("codigo").notNull().unique(),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  voceria: varchar("voceria", { length: 60 }).notNull(),
  resultado: integer("resultado").notNull(),
  cantidad_electores: integer("cantidad_electores").notNull(),
  estado: boolean("estado").default(true)
});
var consejosComunales = pgTable("consejo_comunal", {
  id_consejo: serial("id_consejo").primaryKey(),
  id_cc: integer("id_cc").references(() => eventocc.id_cc),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  apellido: varchar("apellido", { length: 60 }).notNull(),
  rif: varchar("rif", { length: 25 }).notNull().unique(),
  fecha_eleccion: date("fecha_eleccion"),
  cantidad_electores: integer("cantidad_electores").notNull(),
  estado: boolean("estado").default(true)
});
var rolesRelations = relations(roles, ({ many }) => ({
  usuarios: many(usuarios)
}));
var usuariosRelations = relations(usuarios, ({ one }) => ({
  rol: one(roles, { fields: [usuarios.id_rol], references: [roles.id_rol] })
}));
var estadosRelations = relations(estados, ({ many }) => ({
  municipios: many(municipios)
}));
var municipiosRelations = relations(municipios, ({ one, many }) => ({
  estado: one(estados, { fields: [municipios.id_estado], references: [estados.id_estado] }),
  parroquias: many(parroquias)
}));
var parroquiasRelations = relations(parroquias, ({ one, many }) => ({
  municipio: one(municipios, { fields: [parroquias.id_municipio], references: [municipios.id_municipio] }),
  comunidades: many(comunidades)
}));
var comunidadesRelations = relations(comunidades, ({ one, many }) => ({
  parroquia: one(parroquias, { fields: [comunidades.id_parroquia], references: [parroquias.id_parroquia] }),
  ubicaciones: many(ubicaciones)
}));
var ubicacionesRelations = relations(ubicaciones, ({ one, many }) => ({
  comunidad: one(comunidades, { fields: [ubicaciones.id_comunidad], references: [comunidades.id_comunidad] }),
  centrosVotacion: many(centrosVotacion)
}));
var personalRelations = relations(personal, ({ many }) => ({
  centrosVotacion: many(centrosVotacion)
}));
var centrosVotacionRelations = relations(centrosVotacion, ({ one, many }) => ({
  persona: one(personal, { fields: [centrosVotacion.id_persona], references: [personal.id_persona] }),
  ubicacion: one(ubicaciones, { fields: [centrosVotacion.id_ubicacion], references: [ubicaciones.id_ubicacion] }),
  eventos: many(eventos)
}));
var eventosRelations = relations(eventos, ({ one, many }) => ({
  centroVotacion: one(centrosVotacion, { fields: [eventos.id_ce], references: [centrosVotacion.id_ce] }),
  afluencia: many(afluencia),
  tComunal: many(tComunal),
  eventocc: many(eventocc)
}));
var afluenciaRelations = relations(afluencia, ({ one }) => ({
  evento: one(eventos, { fields: [afluencia.id_evento], references: [eventos.id_evento] })
}));
var comunasRelations = relations(comunas, ({ many }) => ({
  proyectos: many(proyectos)
}));
var proyectosRelations = relations(proyectos, ({ one, many }) => ({
  comuna: one(comunas, { fields: [proyectos.id_comuna], references: [comunas.id_comuna] }),
  tComunal: many(tComunal)
}));
var tComunalRelations = relations(tComunal, ({ one }) => ({
  proyecto: one(proyectos, { fields: [tComunal.id_proyecto], references: [proyectos.id_proyecto] }),
  evento: one(eventos, { fields: [tComunal.id_evento], references: [eventos.id_evento] })
}));
var eventoccRelations = relations(eventocc, ({ one, many }) => ({
  evento: one(eventos, { fields: [eventocc.id_evento], references: [eventos.id_evento] }),
  consejosComunales: many(consejosComunales)
}));
var consejosComunalesRelations = relations(consejosComunales, ({ one }) => ({
  eventocc: one(eventocc, { fields: [consejosComunales.id_cc], references: [eventocc.id_cc] })
}));
var insertRoleSchema = createInsertSchema(roles).omit({
  id_rol: true,
  estado: true
});
var insertUserSchema = createInsertSchema(usuarios).omit({
  id: true,
  token: true,
  fecha_token: true,
  fecha_registro: true,
  estado: true
});
var insertEstadoSchema = createInsertSchema(estados).omit({
  id_estado: true,
  estado: true
});
var insertMunicipioSchema = createInsertSchema(municipios).omit({
  id_municipio: true,
  estado: true
});
var insertParroquiaSchema = createInsertSchema(parroquias).omit({
  id_parroquia: true,
  estado: true
});
var insertComunidadSchema = createInsertSchema(comunidades).omit({
  id_comunidad: true,
  estado: true
});
var insertUbicacionSchema = createInsertSchema(ubicaciones).omit({
  id_ubicacion: true,
  estado: true
});
var insertPersonalSchema = createInsertSchema(personal).omit({
  id_persona: true,
  estado: true
});
var insertCentroVotacionSchema = createInsertSchema(centrosVotacion).omit({
  id_ce: true,
  estado: true
});
var insertEventoSchema = createInsertSchema(eventos).omit({
  id_evento: true,
  estado: true
});
var insertAfluenciaSchema = createInsertSchema(afluencia).omit({
  id_afluencia: true,
  estado: true
});
var insertComunaSchema = createInsertSchema(comunas).omit({
  id_comuna: true,
  estado: true
});
var insertProyectoSchema = createInsertSchema(proyectos).omit({
  id_proyecto: true,
  estado: true
});
var insertTComunalSchema = createInsertSchema(tComunal).omit({
  id_comunal: true,
  estado: true
});
var insertEventoccSchema = createInsertSchema(eventocc).omit({
  id_cc: true,
  estado: true
});
var insertConsejoComunalSchema = createInsertSchema(consejosComunales).omit({
  id_consejo: true,
  estado: true
});

// server/routes.ts
function registerRoutes(app2) {
  setupAuth(app2);
  app2.get("/api/roles", async (req, res) => {
    try {
      const roles2 = await storage.getRoles();
      res.json(roles2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch roles" });
    }
  });
  app2.post("/api/roles", async (req, res) => {
    try {
      const validatedData = insertRoleSchema.parse(req.body);
      const role = await storage.createRole(validatedData);
      res.status(201).json(role);
    } catch (error) {
      res.status(400).json({ error: "Invalid role data" });
    }
  });
  app2.put("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertRoleSchema.partial().parse(req.body);
      const role = await storage.updateRole(id, validatedData);
      res.json(role);
    } catch (error) {
      res.status(400).json({ error: "Invalid role data" });
    }
  });
  app2.delete("/api/roles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteRole(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete role" });
    }
  });
  app2.get("/api/users", async (req, res) => {
    try {
      const users = await storage.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  app2.put("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUserSchema.partial().parse(req.body);
      const user = await storage.updateUser(id, validatedData);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: "Invalid user data" });
    }
  });
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUser(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  app2.get("/api/estados", async (req, res) => {
    try {
      const estados2 = await storage.getEstados();
      res.json(estados2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch estados" });
    }
  });
  app2.post("/api/estados", async (req, res) => {
    try {
      const validatedData = insertEstadoSchema.parse(req.body);
      const estado = await storage.createEstado(validatedData);
      res.status(201).json(estado);
    } catch (error) {
      res.status(400).json({ error: "Invalid estado data" });
    }
  });
  app2.put("/api/estados/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEstadoSchema.partial().parse(req.body);
      const estado = await storage.updateEstado(id, validatedData);
      res.json(estado);
    } catch (error) {
      res.status(400).json({ error: "Invalid estado data" });
    }
  });
  app2.delete("/api/estados/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEstado(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete estado" });
    }
  });
  app2.get("/api/municipios", async (req, res) => {
    try {
      const municipios2 = await storage.getMunicipios();
      res.json(municipios2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch municipios" });
    }
  });
  app2.get("/api/municipios/estado/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const municipios2 = await storage.getMunicipiosByEstado(id);
      res.json(municipios2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch municipios" });
    }
  });
  app2.post("/api/municipios", async (req, res) => {
    try {
      const validatedData = insertMunicipioSchema.parse(req.body);
      const municipio = await storage.createMunicipio(validatedData);
      res.status(201).json(municipio);
    } catch (error) {
      res.status(400).json({ error: "Invalid municipio data" });
    }
  });
  app2.put("/api/municipios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertMunicipioSchema.partial().parse(req.body);
      const municipio = await storage.updateMunicipio(id, validatedData);
      res.json(municipio);
    } catch (error) {
      res.status(400).json({ error: "Invalid municipio data" });
    }
  });
  app2.delete("/api/municipios/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMunicipio(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete municipio" });
    }
  });
  app2.get("/api/parroquias", async (req, res) => {
    try {
      const parroquias2 = await storage.getParroquias();
      res.json(parroquias2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parroquias" });
    }
  });
  app2.get("/api/parroquias/municipio/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const parroquias2 = await storage.getParroquiasByMunicipio(id);
      res.json(parroquias2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch parroquias" });
    }
  });
  app2.post("/api/parroquias", async (req, res) => {
    try {
      const validatedData = insertParroquiaSchema.parse(req.body);
      const parroquia = await storage.createParroquia(validatedData);
      res.status(201).json(parroquia);
    } catch (error) {
      res.status(400).json({ error: "Invalid parroquia data" });
    }
  });
  app2.put("/api/parroquias/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertParroquiaSchema.partial().parse(req.body);
      const parroquia = await storage.updateParroquia(id, validatedData);
      res.json(parroquia);
    } catch (error) {
      res.status(400).json({ error: "Invalid parroquia data" });
    }
  });
  app2.delete("/api/parroquias/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteParroquia(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete parroquia" });
    }
  });
  app2.get("/api/comunidades", async (req, res) => {
    try {
      const comunidades2 = await storage.getComunidades();
      res.json(comunidades2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comunidades" });
    }
  });
  app2.get("/api/comunidades/parroquia/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const comunidades2 = await storage.getComunidadesByParroquia(id);
      res.json(comunidades2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comunidades" });
    }
  });
  app2.post("/api/comunidades", async (req, res) => {
    try {
      const validatedData = insertComunidadSchema.parse(req.body);
      const comunidad = await storage.createComunidad(validatedData);
      res.status(201).json(comunidad);
    } catch (error) {
      res.status(400).json({ error: "Invalid comunidad data" });
    }
  });
  app2.put("/api/comunidades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertComunidadSchema.partial().parse(req.body);
      const comunidad = await storage.updateComunidad(id, validatedData);
      res.json(comunidad);
    } catch (error) {
      res.status(400).json({ error: "Invalid comunidad data" });
    }
  });
  app2.delete("/api/comunidades/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComunidad(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comunidad" });
    }
  });
  app2.get("/api/ubicaciones", async (req, res) => {
    try {
      const ubicaciones2 = await storage.getUbicaciones();
      res.json(ubicaciones2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ubicaciones" });
    }
  });
  app2.get("/api/ubicaciones/comunidad/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const ubicaciones2 = await storage.getUbicacionesByComunidad(id);
      res.json(ubicaciones2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ubicaciones" });
    }
  });
  app2.post("/api/ubicaciones", async (req, res) => {
    try {
      const validatedData = insertUbicacionSchema.parse(req.body);
      const ubicacion = await storage.createUbicacion(validatedData);
      res.status(201).json(ubicacion);
    } catch (error) {
      res.status(400).json({ error: "Invalid ubicacion data" });
    }
  });
  app2.put("/api/ubicaciones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertUbicacionSchema.partial().parse(req.body);
      const ubicacion = await storage.updateUbicacion(id, validatedData);
      res.json(ubicacion);
    } catch (error) {
      res.status(400).json({ error: "Invalid ubicacion data" });
    }
  });
  app2.delete("/api/ubicaciones/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteUbicacion(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete ubicacion" });
    }
  });
  app2.get("/api/personal", async (req, res) => {
    try {
      const personal2 = await storage.getPersonal();
      res.json(personal2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch personal" });
    }
  });
  app2.post("/api/personal", async (req, res) => {
    try {
      const validatedData = insertPersonalSchema.parse(req.body);
      const persona = await storage.createPersona(validatedData);
      res.status(201).json(persona);
    } catch (error) {
      res.status(400).json({ error: "Invalid personal data" });
    }
  });
  app2.put("/api/personal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPersonalSchema.partial().parse(req.body);
      const persona = await storage.updatePersona(id, validatedData);
      res.json(persona);
    } catch (error) {
      res.status(400).json({ error: "Invalid personal data" });
    }
  });
  app2.delete("/api/personal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deletePersona(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete personal" });
    }
  });
  app2.get("/api/centros-votacion", async (req, res) => {
    try {
      const centros = await storage.getCentrosVotacion();
      res.json(centros);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch centros de votacion" });
    }
  });
  app2.post("/api/centros-votacion", async (req, res) => {
    try {
      const validatedData = insertCentroVotacionSchema.parse(req.body);
      const centro = await storage.createCentroVotacion(validatedData);
      res.status(201).json(centro);
    } catch (error) {
      res.status(400).json({ error: "Invalid centro de votacion data" });
    }
  });
  app2.put("/api/centros-votacion/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCentroVotacionSchema.partial().parse(req.body);
      const centro = await storage.updateCentroVotacion(id, validatedData);
      res.json(centro);
    } catch (error) {
      res.status(400).json({ error: "Invalid centro de votacion data" });
    }
  });
  app2.delete("/api/centros-votacion/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCentroVotacion(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete centro de votacion" });
    }
  });
  app2.get("/api/eventos", async (req, res) => {
    try {
      const eventos2 = await storage.getEventos();
      res.json(eventos2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch eventos" });
    }
  });
  app2.post("/api/eventos", async (req, res) => {
    try {
      const validatedData = insertEventoSchema.parse(req.body);
      const evento = await storage.createEvento(validatedData);
      res.status(201).json(evento);
    } catch (error) {
      res.status(400).json({ error: "Invalid evento data" });
    }
  });
  app2.put("/api/eventos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventoSchema.partial().parse(req.body);
      const evento = await storage.updateEvento(id, validatedData);
      res.json(evento);
    } catch (error) {
      res.status(400).json({ error: "Invalid evento data" });
    }
  });
  app2.delete("/api/eventos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEvento(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete evento" });
    }
  });
  app2.get("/api/afluencia", async (req, res) => {
    try {
      const afluencia2 = await storage.getAfluencia();
      res.json(afluencia2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch afluencia" });
    }
  });
  app2.get("/api/afluencia/evento/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const afluencia2 = await storage.getAfluenciaByEvento(id);
      res.json(afluencia2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch afluencia" });
    }
  });
  app2.post("/api/afluencia", async (req, res) => {
    try {
      const validatedData = insertAfluenciaSchema.parse(req.body);
      const afluencia2 = await storage.createAfluencia(validatedData);
      res.status(201).json(afluencia2);
    } catch (error) {
      res.status(400).json({ error: "Invalid afluencia data" });
    }
  });
  app2.put("/api/afluencia/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertAfluenciaSchema.partial().parse(req.body);
      const afluencia2 = await storage.updateAfluencia(id, validatedData);
      res.json(afluencia2);
    } catch (error) {
      res.status(400).json({ error: "Invalid afluencia data" });
    }
  });
  app2.delete("/api/afluencia/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAfluencia(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete afluencia" });
    }
  });
  app2.get("/api/comunas", async (req, res) => {
    try {
      const comunas2 = await storage.getComunas();
      res.json(comunas2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch comunas" });
    }
  });
  app2.post("/api/comunas", async (req, res) => {
    try {
      const validatedData = insertComunaSchema.parse(req.body);
      const comuna = await storage.createComuna(validatedData);
      res.status(201).json(comuna);
    } catch (error) {
      res.status(400).json({ error: "Invalid comuna data" });
    }
  });
  app2.put("/api/comunas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertComunaSchema.partial().parse(req.body);
      const comuna = await storage.updateComuna(id, validatedData);
      res.json(comuna);
    } catch (error) {
      res.status(400).json({ error: "Invalid comuna data" });
    }
  });
  app2.delete("/api/comunas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteComuna(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete comuna" });
    }
  });
  app2.get("/api/proyectos", async (req, res) => {
    try {
      const proyectos2 = await storage.getProyectos();
      res.json(proyectos2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proyectos" });
    }
  });
  app2.get("/api/proyectos/comuna/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const proyectos2 = await storage.getProyectosByComuna(id);
      res.json(proyectos2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch proyectos" });
    }
  });
  app2.post("/api/proyectos", async (req, res) => {
    try {
      const validatedData = insertProyectoSchema.parse(req.body);
      const proyecto = await storage.createProyecto(validatedData);
      res.status(201).json(proyecto);
    } catch (error) {
      res.status(400).json({ error: "Invalid proyecto data" });
    }
  });
  app2.put("/api/proyectos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProyectoSchema.partial().parse(req.body);
      const proyecto = await storage.updateProyecto(id, validatedData);
      res.json(proyecto);
    } catch (error) {
      res.status(400).json({ error: "Invalid proyecto data" });
    }
  });
  app2.delete("/api/proyectos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProyecto(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete proyecto" });
    }
  });
  app2.get("/api/t-comunal", async (req, res) => {
    try {
      const tComunal2 = await storage.getTComunal();
      res.json(tComunal2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch t-comunal" });
    }
  });
  app2.post("/api/t-comunal", async (req, res) => {
    try {
      const validatedData = insertTComunalSchema.parse(req.body);
      const tComunal2 = await storage.createTComunal(validatedData);
      res.status(201).json(tComunal2);
    } catch (error) {
      res.status(400).json({ error: "Invalid t-comunal data" });
    }
  });
  app2.put("/api/t-comunal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertTComunalSchema.partial().parse(req.body);
      const tComunal2 = await storage.updateTComunal(id, validatedData);
      res.json(tComunal2);
    } catch (error) {
      res.status(400).json({ error: "Invalid t-comunal data" });
    }
  });
  app2.delete("/api/t-comunal/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteTComunal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete t-comunal" });
    }
  });
  app2.get("/api/eventocc", async (req, res) => {
    try {
      const eventocc2 = await storage.getEventocc();
      res.json(eventocc2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch eventocc" });
    }
  });
  app2.get("/api/eventocc/evento/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventocc2 = await storage.getEventoccByEvento(id);
      res.json(eventocc2);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch eventocc" });
    }
  });
  app2.post("/api/eventocc", async (req, res) => {
    try {
      const validatedData = insertEventoccSchema.parse(req.body);
      const eventocc2 = await storage.createEventocc(validatedData);
      res.status(201).json(eventocc2);
    } catch (error) {
      res.status(400).json({ error: "Invalid eventocc data" });
    }
  });
  app2.put("/api/eventocc/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertEventoccSchema.partial().parse(req.body);
      const eventocc2 = await storage.updateEventocc(id, validatedData);
      res.json(eventocc2);
    } catch (error) {
      res.status(400).json({ error: "Invalid eventocc data" });
    }
  });
  app2.delete("/api/eventocc/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEventocc(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete eventocc" });
    }
  });
  app2.get("/api/consejos-comunales", async (req, res) => {
    try {
      const consejos = await storage.getConsejosComunales();
      res.json(consejos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consejos comunales" });
    }
  });
  app2.post("/api/consejos-comunales", async (req, res) => {
    try {
      const validatedData = insertConsejoComunalSchema.parse(req.body);
      const consejo = await storage.createConsejoComunal(validatedData);
      res.status(201).json(consejo);
    } catch (error) {
      res.status(400).json({ error: "Invalid consejo comunal data" });
    }
  });
  app2.put("/api/consejos-comunales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertConsejoComunalSchema.partial().parse(req.body);
      const consejo = await storage.updateConsejoComunal(id, validatedData);
      res.json(consejo);
    } catch (error) {
      res.status(400).json({ error: "Invalid consejo comunal data" });
    }
  });
  app2.delete("/api/consejos-comunales/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteConsejoComunal(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete consejo comunal" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  optimizeDeps: {
    entries: [
      path.resolve(__dirname, "client/src/main.tsx")
    ],
    include: [
      "react",
      "react-dom",
      "zod",
      "@tanstack/react-query",
      "wouter",
      "use-sync-external-store",
      "@radix-ui/react-avatar"
      // Agrega más si necesitas
    ],
    exclude: [
      "drizzle-zod",
      "drizzle-orm"
    ],
    force: true,
    esbuildOptions: {
      target: "es2020",
      sourcemap: false
    }
  },
  plugins: [
    react()
    // Si necesitas Tailwind, descomenta: import tailwindcss from '@tailwindcss/vite'; y agrega: tailwindcss(),
  ],
  resolve: {
    conditions: ["browser", "development", "import", "default"],
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    },
    dedupe: ["use-sync-external-store", "react", "react-dom", "wouter"]
  },
  root: path.resolve(__dirname, "client"),
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1e3,
    rollupOptions: {
      input: path.resolve(__dirname, "client/src/main.tsx"),
      output: {
        sourcemapExcludeSources: true,
        manualChunks: (id) => {
          if (id.includes("node_modules/@radix-ui")) return "radix-ui";
          if (id.includes("node_modules/@tanstack")) return "react-query";
          if (id.includes("node_modules/wouter")) return "wouter";
          if (id.includes("node_modules/recharts")) return "recharts";
        },
        sourcemapPathTransform: (relativeSource) => {
          if (relativeSource.includes("node_modules")) {
            return relativeSource.replace(/node_modules\/[^\/]+\/src/, "");
          }
          return relativeSource;
        }
      },
      onwarn(warning, warn) {
        if (warning.code === "SOURCEMAP_BROKEN" || warning.message.includes("sourcemap") || warning.message.includes("drizzle-zod") || warning.message.includes("missing source files")) {
          return;
        }
        warn(warning);
      }
    }
  },
  //La sección server se ha comentado porque no es necesaria en Vercel.
  server: {
    fs: {
      strict: false,
      deny: ["**/.*"],
      allow: [
        "..",
        "/@fs",
        "/home",
        path.resolve(__dirname, "node_modules")
      ]
    },
    watch: {
      ignored: ["**/node_modules/**", "**/.git/**"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        rewrite: (path3) => path3.replace(/^\/api/, "")
      }
    },
    hmr: {
      port: 443,
      host: "localhost"
    }
  },
  esbuild: {
    sourcemap: false
  },
  css: {
    devSourcemap: false
  },
  envPrefix: "VITE_",
  define: {
    global: "globalThis"
  },
  logLevel: "info"
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = path2.dirname(__filename2);
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
