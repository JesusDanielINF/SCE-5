import { pgTable, text, serial, integer, boolean, timestamp, date, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Roles table
export const roles = pgTable("roles", {
  id_rol: serial("id_rol").primaryKey(),
  nombre: varchar("nombre", { length: 60 }).notNull().unique(),
  descripcion: varchar("descripcion", { length: 255 }),
  nivel_acceso: integer("nivel_acceso").notNull(),
  estado: boolean("estado").default(true)
});

// Users table
export const usuarios = pgTable("usuarios", {
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

// Geographic tables
export const estados = pgTable("estado", {
  id_estado: serial("id_estado").primaryKey(),
  nombre: varchar("nombre", { length: 60 }).notNull().unique(),
  estado: boolean("estado").default(true)
});

export const municipios = pgTable("municipio", {
  id_municipio: serial("id_municipio").primaryKey(),
  id_estado: integer("id_estado").references(() => estados.id_estado),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});

export const parroquias = pgTable("parroquia", {
  id_parroquia: serial("id_parroquia").primaryKey(),
  id_municipio: integer("id_municipio").references(() => municipios.id_municipio),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});

export const comunidades = pgTable("comunidad", {
  id_comunidad: serial("id_comunidad").primaryKey(),
  id_parroquia: integer("id_parroquia").references(() => parroquias.id_parroquia),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});

export const ubicaciones = pgTable("ubicacion", {
  id_ubicacion: serial("id_ubicacion").primaryKey(),
  id_comunidad: integer("id_comunidad").references(() => comunidades.id_comunidad),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  calle: varchar("calle", { length: 120 }).notNull(),
  avenida: varchar("avenida", { length: 120 }).notNull(),
  referencia: varchar("referencia", { length: 200 }).notNull(),
  estado: boolean("estado").default(true)
});

// Personnel table
export const personal = pgTable("personal", {
  id_persona: serial("id_persona").primaryKey(),
  cedula: varchar("cedula", { length: 20 }).notNull(),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  apellido: varchar("apellido", { length: 120 }).notNull(),
  cuenta: varchar("cuenta", { length: 60 }).notNull().unique(),
  telefono: varchar("telefono", { length: 17 }).notNull(),
  cargo: varchar("cargo", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});

// Voting centers
export const centrosVotacion = pgTable("centro_de_votacion", {
  id_ce: serial("id_ce").primaryKey(),
  id_persona: integer("id_persona").references(() => personal.id_persona),
  id_ubicacion: integer("id_ubicacion").references(() => ubicaciones.id_ubicacion),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  mesas: integer("mesas").notNull(),
  codigo: integer("codigo").notNull().unique(),
  estado: boolean("estado").default(true)
});

// Events
export const eventos = pgTable("evento", {
  id_evento: serial("id_evento").primaryKey(),
  id_ce: integer("id_ce").references(() => centrosVotacion.id_ce),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  fecha_evento: timestamp("fecha_evento").notNull(),
  estado: boolean("estado").default(true)
});

// Afluencia
export const afluencia = pgTable("afluencia", {
  id_afluencia: serial("id_afluencia").primaryKey(),
  id_evento: integer("id_evento").references(() => eventos.id_evento),
  cantidad: integer("cantidad").notNull(),
  hora: timestamp("hora"),
  estado: boolean("estado").default(true)
});

// Comunas
export const comunas = pgTable("comuna", {
  id_comuna: serial("id_comuna").primaryKey(),
  codigo: integer("codigo").unique(),
  nombre: varchar("nombre", { length: 120 }).notNull(),
  cantidad_electores: integer("cantidad_electores").notNull(),
  estado: boolean("estado").default(true)
});

// Proyectos
export const proyectos = pgTable("proyecto", {
  id_proyecto: serial("id_proyecto").primaryKey(),
  id_comuna: integer("id_comuna").references(() => comunas.id_comuna),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  estado: boolean("estado").default(true)
});

// T_Comunal
export const tComunal = pgTable("t_comunal", {
  id_comunal: serial("id_comunal").primaryKey(),
  id_proyecto: integer("id_proyecto").references(() => proyectos.id_proyecto),
  id_evento: integer("id_evento").references(() => eventos.id_evento),
  resultado: integer("resultado").notNull(),
  estado: boolean("estado").default(true)
});

// Eventocc
export const eventocc = pgTable("eventocc", {
  id_cc: serial("id_cc").primaryKey(),
  id_evento: integer("id_evento").references(() => eventos.id_evento),
  codigo: integer("codigo").notNull().unique(),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  voceria: varchar("voceria", { length: 60 }).notNull(),
  resultado: integer("resultado").notNull(),
  cantidad_electores: integer("cantidad_electores").notNull(),
  estado: boolean("estado").default(true)
});

// Consejo Comunal
export const consejosComunales = pgTable("consejo_comunal", {
  id_consejo: serial("id_consejo").primaryKey(),
  id_cc: integer("id_cc").references(() => eventocc.id_cc),
  nombre: varchar("nombre", { length: 60 }).notNull(),
  apellido: varchar("apellido", { length: 60 }).notNull(),
  rif: varchar("rif", { length: 25 }).notNull().unique(),
  fecha_eleccion: date("fecha_eleccion"),
  cantidad_electores: integer("cantidad_electores").notNull(),
  estado: boolean("estado").default(true)
});

// Relations
export const rolesRelations = relations(roles, ({ many }) => ({
  usuarios: many(usuarios)
}));

export const usuariosRelations = relations(usuarios, ({ one }) => ({
  rol: one(roles, { fields: [usuarios.id_rol], references: [roles.id_rol] })
}));

export const estadosRelations = relations(estados, ({ many }) => ({
  municipios: many(municipios)
}));

export const municipiosRelations = relations(municipios, ({ one, many }) => ({
  estado: one(estados, { fields: [municipios.id_estado], references: [estados.id_estado] }),
  parroquias: many(parroquias)
}));

export const parroquiasRelations = relations(parroquias, ({ one, many }) => ({
  municipio: one(municipios, { fields: [parroquias.id_municipio], references: [municipios.id_municipio] }),
  comunidades: many(comunidades)
}));

export const comunidadesRelations = relations(comunidades, ({ one, many }) => ({
  parroquia: one(parroquias, { fields: [comunidades.id_parroquia], references: [parroquias.id_parroquia] }),
  ubicaciones: many(ubicaciones)
}));

export const ubicacionesRelations = relations(ubicaciones, ({ one, many }) => ({
  comunidad: one(comunidades, { fields: [ubicaciones.id_comunidad], references: [comunidades.id_comunidad] }),
  centrosVotacion: many(centrosVotacion)
}));

export const personalRelations = relations(personal, ({ many }) => ({
  centrosVotacion: many(centrosVotacion)
}));

export const centrosVotacionRelations = relations(centrosVotacion, ({ one, many }) => ({
  persona: one(personal, { fields: [centrosVotacion.id_persona], references: [personal.id_persona] }),
  ubicacion: one(ubicaciones, { fields: [centrosVotacion.id_ubicacion], references: [ubicaciones.id_ubicacion] }),
  eventos: many(eventos)
}));

export const eventosRelations = relations(eventos, ({ one, many }) => ({
  centroVotacion: one(centrosVotacion, { fields: [eventos.id_ce], references: [centrosVotacion.id_ce] }),
  afluencia: many(afluencia),
  tComunal: many(tComunal),
  eventocc: many(eventocc)
}));

export const afluenciaRelations = relations(afluencia, ({ one }) => ({
  evento: one(eventos, { fields: [afluencia.id_evento], references: [eventos.id_evento] })
}));

export const comunasRelations = relations(comunas, ({ many }) => ({
  proyectos: many(proyectos)
}));

export const proyectosRelations = relations(proyectos, ({ one, many }) => ({
  comuna: one(comunas, { fields: [proyectos.id_comuna], references: [comunas.id_comuna] }),
  tComunal: many(tComunal)
}));

export const tComunalRelations = relations(tComunal, ({ one }) => ({
  proyecto: one(proyectos, { fields: [tComunal.id_proyecto], references: [proyectos.id_proyecto] }),
  evento: one(eventos, { fields: [tComunal.id_evento], references: [eventos.id_evento] })
}));

export const eventoccRelations = relations(eventocc, ({ one, many }) => ({
  evento: one(eventos, { fields: [eventocc.id_evento], references: [eventos.id_evento] }),
  consejosComunales: many(consejosComunales)
}));

export const consejosComunalesRelations = relations(consejosComunales, ({ one }) => ({
  eventocc: one(eventocc, { fields: [consejosComunales.id_cc], references: [eventocc.id_cc] })
}));

// Schemas
export const insertRoleSchema = createInsertSchema(roles).omit({
  id_rol: true,
  estado: true
});

export const insertUserSchema = createInsertSchema(usuarios).omit({
  id: true,
  token: true,
  fecha_token: true,
  fecha_registro: true,
  estado: true
});

export const insertEstadoSchema = createInsertSchema(estados).omit({
  id_estado: true,
  estado: true
});

export const insertMunicipioSchema = createInsertSchema(municipios).omit({
  id_municipio: true,
  estado: true
});

export const insertParroquiaSchema = createInsertSchema(parroquias).omit({
  id_parroquia: true,
  estado: true
});

export const insertComunidadSchema = createInsertSchema(comunidades).omit({
  id_comunidad: true,
  estado: true
});

export const insertUbicacionSchema = createInsertSchema(ubicaciones).omit({
  id_ubicacion: true,
  estado: true
});

export const insertPersonalSchema = createInsertSchema(personal).omit({
  id_persona: true,
  estado: true
});

export const insertCentroVotacionSchema = createInsertSchema(centrosVotacion).omit({
  id_ce: true,
  estado: true
});

export const insertEventoSchema = createInsertSchema(eventos).omit({
  id_evento: true,
  estado: true
});

export const insertAfluenciaSchema = createInsertSchema(afluencia).omit({
  id_afluencia: true,
  estado: true
});

export const insertComunaSchema = createInsertSchema(comunas).omit({
  id_comuna: true,
  estado: true
});

export const insertProyectoSchema = createInsertSchema(proyectos).omit({
  id_proyecto: true,
  estado: true
});

export const insertTComunalSchema = createInsertSchema(tComunal).omit({
  id_comunal: true,
  estado: true
});

export const insertEventoccSchema = createInsertSchema(eventocc).omit({
  id_cc: true,
  estado: true
});

export const insertConsejoComunalSchema = createInsertSchema(consejosComunales).omit({
  id_consejo: true,
  estado: true
});

// Types
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type User = typeof usuarios.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Estado = typeof estados.$inferSelect;
export type InsertEstado = z.infer<typeof insertEstadoSchema>;
export type Municipio = typeof municipios.$inferSelect;
export type InsertMunicipio = z.infer<typeof insertMunicipioSchema>;
export type Parroquia = typeof parroquias.$inferSelect;
export type InsertParroquia = z.infer<typeof insertParroquiaSchema>;
export type Comunidad = typeof comunidades.$inferSelect;
export type InsertComunidad = z.infer<typeof insertComunidadSchema>;
export type Ubicacion = typeof ubicaciones.$inferSelect;
export type InsertUbicacion = z.infer<typeof insertUbicacionSchema>;
export type Personal = typeof personal.$inferSelect;
export type InsertPersonal = z.infer<typeof insertPersonalSchema>;
export type CentroVotacion = typeof centrosVotacion.$inferSelect;
export type InsertCentroVotacion = z.infer<typeof insertCentroVotacionSchema>;
export type Evento = typeof eventos.$inferSelect;
export type InsertEvento = z.infer<typeof insertEventoSchema>;
export type Afluencia = typeof afluencia.$inferSelect;
export type InsertAfluencia = z.infer<typeof insertAfluenciaSchema>;
export type Comuna = typeof comunas.$inferSelect;
export type InsertComuna = z.infer<typeof insertComunaSchema>;
export type Proyecto = typeof proyectos.$inferSelect;
export type InsertProyecto = z.infer<typeof insertProyectoSchema>;
export type TComunal = typeof tComunal.$inferSelect;
export type InsertTComunal = z.infer<typeof insertTComunalSchema>;
export type Eventocc = typeof eventocc.$inferSelect;
export type InsertEventocc = z.infer<typeof insertEventoccSchema>;
export type ConsejoComunal = typeof consejosComunales.$inferSelect;
export type InsertConsejoComunal = z.infer<typeof insertConsejoComunalSchema>;

// For authentication compatibility
export const users = usuarios;
