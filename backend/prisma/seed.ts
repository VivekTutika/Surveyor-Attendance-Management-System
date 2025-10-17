import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default admin users
  const hashedPasswordA = await bcrypt.hash('AA@SAMS', 12);
  const adminA = await prisma.user.upsert({
    where: { mobileNumber: '1234567890' },
    update: {},
    create: {
      role: Role.ADMIN,
      name: 'Attendance Admin',
      mobileNumber: '1234567890',
      passwordHash: hashedPasswordA,
      isActive: true,
    },
  });
  
  const hashedPasswordB = await bcrypt.hash('BRA@SAMS', 12);
  console.log('✅ Created Admin A:', {
    id: adminA.id,
    name: adminA.name,
    mobileNumber: adminA.mobileNumber,
    role: adminA.role,
  });

  const adminB = await prisma.user.upsert({
    where: { mobileNumber: '1234567891' },
    update: {},
    create: {
      role: Role.ADMIN,
      name: 'Bike Readings Admin',
      mobileNumber: '1234567891',
      passwordHash: hashedPasswordB,
      isActive: true,
    },
  });

  console.log('✅ Created Admin B:', {
    id: adminB.id,
    name: adminB.name,
    mobileNumber: adminB.mobileNumber,
    role: adminB.role,
  });

  // Create single project
  const project = await prisma.project.upsert({
    where: { name: 'Office' },
    update: {},
    create: {
      name: 'Office',
    },
  });

  console.log('✅ Created project:', {
    id: project.id,
    name: project.name,
  });

  // Create single location
  const location = await prisma.location.upsert({
    where: { name: 'Head Quarters' },
    update: {},
    create: {
      name: 'Head Quarters',
    },
  });

  console.log('✅ Created location:', {
    id: location.id,
    name: location.name,
  });

  // Create sample surveyor users
  const surveyorPassword1 = await bcrypt.hash('AT1@LRMC', 12);
  const surveyorPassword2 = await bcrypt.hash('AT2@LRMC', 12);
  
  const sampleSurveyors = [
    {
      name: 'LRMC Developer',
      employeeId: 'LRMCT001',
      mobileNumber: '9876543210',
      aadharNumber: '123456789012',
      passwordHash: surveyorPassword1,
      projectId: project.id,
      locationId: location.id,
      hasBike: true,
    },
    {
      name: 'LRMC Tester',
      employeeId: 'LRMCT002',
      mobileNumber: '8765432109',
      aadharNumber: '987654321098',
      passwordHash: surveyorPassword2,
      projectId: project.id,
      locationId: location.id,
      hasBike: false,
    },
  ];

  for (const surveyor of sampleSurveyors) {
    const surveyorUser = await prisma.user.upsert({
      where: { mobileNumber: surveyor.mobileNumber },
      update: {},
      create: {
        role: Role.SURVEYOR,
        name: surveyor.name,
        employeeId: surveyor.employeeId,
        mobileNumber: surveyor.mobileNumber,
        aadharNumber: surveyor.aadharNumber,
        passwordHash: surveyor.passwordHash,
        projectId: surveyor.projectId,
        locationId: surveyor.locationId,
        hasBike: surveyor.hasBike,
        isActive: true,
      },
    });

    console.log('✅ Created surveyor user:', {
      id: surveyorUser.id,
      name: surveyorUser.name,
      employeeId: surveyorUser.employeeId,
      mobileNumber: surveyorUser.mobileNumber,
      projectId: surveyorUser.projectId,
      locationId: surveyorUser.locationId,
      hasBike: surveyorUser.hasBike,
    });
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Default Login Credentials:');
  console.log('👨‍💼 Attendance Admin: 1234567890 / AA@SAMS');
  console.log('👨‍💼 Bike Readings Admin: +1234567891 / BRA@SAMS');
  console.log('👷‍♂️ LRMC Developer: +9876543210 / AT1@LRMC (Employee ID: LRMCT001, Has Bike: Yes)');
  console.log('👷‍♀️ LRMC Tester: +8765432109 / AT2@LRMC (Employee ID: LRMCT002, Has Bike: No)');
  console.log('');
  console.log('🏢 Created Project:', project.name);
  console.log('📍 Created Location:', location.name);
  console.log('👥 Created Users:', sampleSurveyors.length + 2, '(including 2 admins)');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });