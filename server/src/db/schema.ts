import { pgTable, uuid, varchar, text, timestamp, integer, boolean, pgEnum, customType } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const roleEnum = pgEnum('role', ['citizen', 'worker', 'supervisor', 'admin']);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high']);
export const statusEnum = pgEnum('status', ['submitted', 'assigned', 'in_progress', 'resolved']);

// PostGIS Geometry custom type
const geometry = customType<{ data: string; driverData: string }>({
  dataType() {
    return 'geometry';
  },
  toDriver(value: string) {
    return value;
  },
  fromDriver(value: unknown) {
    return value as string;
  },
});

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  role: roleEnum('role').default('citizen').notNull(),
  ecoPoints: integer('eco_points').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  complaints: many(complaints, { relationName: 'userComplaints' }),
  assignedComplaints: many(complaints, { relationName: 'workerComplaints' }),
}));

export const areas = pgTable('areas', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  boundary: geometry('boundary'), // Polygon
  supervisorId: uuid('supervisor_id').references(() => users.id),
});

export const bins = pgTable('bins', {
  id: uuid('id').defaultRandom().primaryKey(),
  location: geometry('location'), // Point
  type: varchar('type', { length: 50 }).notNull(), // wet, dry, mixed
  capacityLiters: integer('capacity_liters').notNull(),
  currentFillPercent: integer('current_fill_percent').default(0).notNull(),
  isOverflowing: boolean('is_overflowing').default(false).notNull(),
  lastEmptiedAt: timestamp('last_emptied_at').defaultNow().notNull(),
  areaId: uuid('area_id').references(() => areas.id),
});

export const complaints = pgTable('complaints', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  assignedWorkerId: uuid('assigned_worker_id').references(() => users.id),
  category: varchar('category', { length: 255 }).notNull(), // comma separated if multiple
  description: text('description'),
  severity: severityEnum('severity').default('medium').notNull(),
  status: statusEnum('status').default('submitted').notNull(),
  location: geometry('location'), // Point
  address: text('address'),
  photoUrl: text('photo_url'),
  resolutionPhotoUrl: text('resolution_photo_url'),
  rating: integer('rating'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

export const complaintsRelations = relations(complaints, ({ one }) => ({
  user: one(users, {
    fields: [complaints.userId],
    references: [users.id],
    relationName: 'userComplaints'
  }),
  assignedWorker: one(users, {
    fields: [complaints.assignedWorkerId],
    references: [users.id],
    relationName: 'workerComplaints'
  }),
}));
