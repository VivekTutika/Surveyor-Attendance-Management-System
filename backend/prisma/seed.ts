import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.upsert({
    where: { mobileNumber: '+1234567890' },
    update: {},
    create: {
      role: Role.ADMIN,
      name: 'System Administrator',
      mobileNumber: '+1234567890',
      passwordHash: hashedPassword,
      project: 'System Admin',
      location: 'Head Office',
      isActive: true,
    },
  });

  console.log('✅ Created admin user:', {
    id: adminUser.id,
    name: adminUser.name,
    mobileNumber: adminUser.mobileNumber,
    role: adminUser.role,
  });

  // Create sample surveyor users for testing
  const sampleSurveyors = [
    {
      name: 'John Smith',
      mobileNumber: '+1234567891',
      project: 'Highway Survey Project',
      location: 'Zone A - North District',
    },
    {
      name: 'Sarah Johnson',
      mobileNumber: '+1234567892',
      project: 'Urban Planning Survey',
      location: 'Zone B - Central District',
    },
    {
      name: 'Mike Wilson',
      mobileNumber: '+1234567893',
      project: 'Rural Development Survey',
      location: 'Zone C - South District',
    },
  ];

  for (const surveyor of sampleSurveyors) {
    const hashedSurveyorPassword = await bcrypt.hash('surveyor123', 12);
    
    const surveyorUser = await prisma.user.upsert({
      where: { mobileNumber: surveyor.mobileNumber },
      update: {},
      create: {
        role: Role.SURVEYOR,
        name: surveyor.name,
        mobileNumber: surveyor.mobileNumber,
        passwordHash: hashedSurveyorPassword,
        project: surveyor.project,
        location: surveyor.location,
        isActive: true,
      },
    });

    console.log('✅ Created surveyor user:', {
      id: surveyorUser.id,
      name: surveyorUser.name,
      mobileNumber: surveyorUser.mobileNumber,
      project: surveyorUser.project,
    });
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Default Login Credentials:');
  console.log('👨‍💼 Admin: +1234567890 / admin123');
  console.log('👷‍♂️ Surveyor (John): +1234567891 / surveyor123');
  console.log('👷‍♀️ Surveyor (Sarah): +1234567892 / surveyor123');
  console.log('👷‍♂️ Surveyor (Mike): +1234567893 / surveyor123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
