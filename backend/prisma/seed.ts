import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default admin users
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminA = await prisma.user.upsert({
    where: { mobileNumber: '+1234567890' },
    update: {},
    create: {
      role: Role.ADMIN,
      name: 'Admin A',
      mobileNumber: '+1234567890',
      passwordHash: hashedPassword,
      isActive: true,
    },
  });

  console.log('✅ Created Admin A:', {
    id: adminA.id,
    name: adminA.name,
    mobileNumber: adminA.mobileNumber,
    role: adminA.role,
  });

  const adminB = await prisma.user.upsert({
    where: { mobileNumber: '+1234567891' },
    update: {},
    create: {
      role: Role.ADMIN,
      name: 'Admin B',
      mobileNumber: '+1234567891',
      passwordHash: hashedPassword,
      isActive: true,
    },
  });

  console.log('✅ Created Admin B:', {
    id: adminB.id,
    name: adminB.name,
    mobileNumber: adminB.mobileNumber,
    role: adminB.role,
  });

  // Create sample projects
  const sampleProjects = [
    {
      name: 'Highway Survey Project',
      description: 'Survey and mapping of national highway infrastructure',
    },
    {
      name: 'Urban Planning Survey',
      description: 'Comprehensive urban development and planning survey',
    },
    {
      name: 'Rural Development Survey',
      description: 'Rural infrastructure and development assessment',
    },
    {
      name: 'Coastal Area Survey',
      description: 'Environmental and infrastructure survey of coastal regions',
    },
  ];

  const createdProjects = [];
  for (const project of sampleProjects) {
    const createdProject = await prisma.project.upsert({
      where: { name: project.name },
      update: {},
      create: project,
    });
    createdProjects.push(createdProject);
    console.log('✅ Created project:', {
      id: createdProject.id,
      name: createdProject.name,
    });
  }

  // Create sample locations
  const sampleLocations = [
    {
      name: 'Zone A - North District',
    },
    {
      name: 'Zone B - Central District',
    },
    {
      name: 'Zone C - South District',
    },
    {
      name: 'Zone D - East District',
    },
    {
      name: 'Zone E - West District',
    },
  ];

  const createdLocations = [];
  for (const location of sampleLocations) {
    const createdLocation = await prisma.location.upsert({
      where: { name: location.name },
      update: {},
      create: location,
    });
    createdLocations.push(createdLocation);
    console.log('✅ Created location:', {
      id: createdLocation.id,
      name: createdLocation.name,
    });
  }

  // Create sample surveyor users with project and location assignments
  const sampleSurveyors = [
    {
      name: 'John Smith',
      mobileNumber: '+1234567892',
      projectId: createdProjects[0].id, // Highway Survey Project
      locationId: createdLocations[0].id, // Zone A - North District
    },
    {
      name: 'Sarah Johnson',
      mobileNumber: '+1234567893',
      projectId: createdProjects[1].id, // Urban Planning Survey
      locationId: createdLocations[1].id, // Zone B - Central District
    },
    {
      name: 'Mike Wilson',
      mobileNumber: '+1234567894',
      projectId: createdProjects[2].id, // Rural Development Survey
      locationId: createdLocations[2].id, // Zone C - South District
    },
    {
      name: 'Emily Davis',
      mobileNumber: '+1234567895',
      projectId: createdProjects[3].id, // Coastal Area Survey
      locationId: createdLocations[3].id, // Zone D - East District
    },
    {
      name: 'David Brown',
      mobileNumber: '+1234567896',
      projectId: createdProjects[0].id, // Highway Survey Project
      locationId: createdLocations[4].id, // Zone E - West District
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
        projectId: surveyor.projectId,
        locationId: surveyor.locationId,
        isActive: true,
      },
    });

    console.log('✅ Created surveyor user:', {
      id: surveyorUser.id,
      name: surveyorUser.name,
      mobileNumber: surveyorUser.mobileNumber,
      projectId: surveyorUser.projectId,
      locationId: surveyorUser.locationId,
    });
  }

  console.log('🎉 Database seeding completed successfully!');
  console.log('');
  console.log('📋 Default Login Credentials:');
  console.log('👨‍💼 Admin A: +1234567890 / admin123');
  console.log('👨‍💼 Admin B: +1234567891 / admin123');
  console.log('👷‍♂️ Surveyor (John): +1234567892 / surveyor123');
  console.log('👷‍♀️ Surveyor (Sarah): +1234567893 / surveyor123');
  console.log('👷‍♂️ Surveyor (Mike): +1234567894 / surveyor123');
  console.log('👷‍♀️ Surveyor (Emily): +1234567895 / surveyor123');
  console.log('👷‍♂️ Surveyor (David): +1234567896 / surveyor123');
  console.log('');
  console.log('🏢 Created Projects:', createdProjects.length);
  console.log('📍 Created Locations:', createdLocations.length);
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
