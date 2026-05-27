/**
 * Run once: npm run seed
 * Creates sample doctors, a patient, and an admin for Postman / UI testing.
 */
require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  console.log('Cleared users collection');

  await User.create({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@medibook.test',
    password: 'admin123',
    role: 'admin',
    isEmailVerified: true,
  });

  await User.create({
    firstName: 'Jane',
    lastName: 'Patient',
    email: 'patient@medibook.test',
    password: 'patient123',
    phone: '9800000001',
    role: 'patient',
    isEmailVerified: true,
  });

  const doctors = await User.create([
    {
      firstName: 'Arjun',
      lastName: 'Sharma',
      email: 'arjun@medibook.test',
      password: 'doctor123',
      role: 'doctor',
      isEmailVerified: true,
      doctorProfile: {
        specialization: 'Cardiologist',
        experience: '12 years',
        clinicName: 'Heart Care Clinic',
        city: 'Kathmandu',
        consultationFee: 1200,
        bio: 'Expert in preventive cardiology.',
        availableDays: ['Mon', 'Wed', 'Fri'],
      },
    },
    {
      firstName: 'Sita',
      lastName: 'Gurung',
      email: 'sita@medibook.test',
      password: 'doctor123',
      role: 'doctor',
      isEmailVerified: true,
      doctorProfile: {
        specialization: 'Dermatologist',
        experience: '8 years',
        clinicName: 'Skin Plus',
        city: 'Lalitpur',
        consultationFee: 900,
        bio: 'Skin, hair, and allergy treatments.',
        availableDays: ['Tue', 'Thu', 'Sat'],
      },
    },
    {
      firstName: 'Ravi',
      lastName: 'Patel',
      email: 'ravi@medibook.test',
      password: 'doctor123',
      role: 'doctor',
      isEmailVerified: true,
      doctorProfile: {
        specialization: 'Pediatrician',
        experience: '10 years',
        clinicName: 'Kids Wellness',
        city: 'Kathmandu',
        consultationFee: 800,
        bio: 'Child health and vaccinations.',
        availableDays: ['Mon', 'Tue', 'Wed', 'Thu'],
      },
    },
  ]);

  console.log('\n--- Seed complete ---');
  console.log('Admin:   admin@medibook.test / admin123');
  console.log('Patient: patient@medibook.test / patient123');
  console.log('Doctors: arjun@medibook.test, sita@medibook.test, ravi@medibook.test / doctor123');
  console.log('Doctor IDs (use in Postman booking):');
  doctors.forEach((d) => console.log(`  ${d.firstName}: ${d._id}`));
  console.log('---------------------\n');

  process.exit(0);
};

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
