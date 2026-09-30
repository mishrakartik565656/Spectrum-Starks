import { db } from './index';
import { users, areas, bins, complaints } from './schema';
import crypto from 'crypto';

// Password hash for 'password' (simplified hashing for seed purposes, but normally we'd use something like bcrypt/argon2 or Bun.password)
// Actually Bun.password.hashSync works nicely here
const passwordHash = await Bun.password.hash('password');

async function seed() {
  console.log('Clearing database...');
  await db.delete(complaints);
  await db.delete(bins);
  await db.delete(areas);
  await db.delete(users);

  console.log('Seeding users...');
  const [admin] = await db.insert(users).values({
    email: 'admin@cleancity.com',
    passwordHash,
    name: 'Admin User',
    role: 'admin',
  }).returning();

  const [supervisor] = await db.insert(users).values({
    email: 'supervisor@cleancity.com',
    passwordHash,
    name: 'Area Supervisor',
    role: 'supervisor',
  }).returning();

  const [worker1] = await db.insert(users).values({
    email: 'worker1@cleancity.com',
    passwordHash,
    name: 'Worker One',
    role: 'worker',
  }).returning();

  const [citizen1] = await db.insert(users).values({
    email: 'citizen1@cleancity.com',
    passwordHash,
    name: 'Citizen One',
    role: 'citizen',
    ecoPoints: 50,
  }).returning();

  console.log('Seeding areas...');
  const [area1] = await db.insert(areas).values({
    name: 'Downtown Area',
    supervisorId: supervisor.id,
    boundary: 'POLYGON((80.33 26.45, 80.34 26.45, 80.34 26.46, 80.33 26.46, 80.33 26.45))'
  }).returning();

  console.log('Seeding bins...');
  await db.insert(bins).values([
    {
      location: 'POINT(80.335 26.455)',
      type: 'mixed',
      capacityLiters: 1000,
      currentFillPercent: 40,
      isOverflowing: false,
      areaId: area1.id
    },
    {
      location: 'POINT(80.332 26.458)',
      type: 'wet',
      capacityLiters: 500,
      currentFillPercent: 85,
      isOverflowing: true,
      areaId: area1.id
    }
  ]);

  console.log('Seeding complaints...');
  await db.insert(complaints).values([
    {
      userId: citizen1.id,
      category: 'Overflowing bin',
      description: 'The bin near the park is overflowing.',
      severity: 'high',
      status: 'submitted',
      location: 'POINT(80.335 26.455)',
      address: 'Central Park',
    },
    {
      userId: citizen1.id,
      assignedWorkerId: worker1.id,
      category: 'Illegal dumping',
      description: 'Some debris dumped on the sidewalk.',
      severity: 'medium',
      status: 'assigned',
      location: 'POINT(80.340 26.450)',
      address: 'Main St Sidewalk',
    }
  ]);

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
