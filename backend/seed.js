// Seed script. Wipes the four collections and reloads them with a small but
// useful set of demo data so the app is presentable straight out of the box.

require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./config/db');
const User = require('./models/User');
const Course = require('./models/Course');
const Result = require('./models/Result');

async function run() {
  await connectDB();
  console.log('[seed] connected');

  // Clean slate so re-running the seed is safe.
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Result.deleteMany({}),
  ]);
  console.log('[seed] cleared existing data');

  // --- Users -----------------------------------------------------------
  const admin = await User.create({
    name: 'School Admin',
    email: 'admin@school.gm',
    password: 'Admin123!',
    role: 'admin',
  });

  const lecturer1 = await User.create({
    name: 'Dr. Fatou Jallow',
    email: 'fatou@school.gm',
    password: 'Lecturer123!',
    role: 'lecturer',
  });
  const lecturer2 = await User.create({
    name: 'Mr. Lamin Touray',
    email: 'lamin@school.gm',
    password: 'Lecturer123!',
    role: 'lecturer',
  });

  const student1 = await User.create({
    name: 'Awa Sanneh',
    email: 'awa@school.gm',
    password: 'Student123!',
    role: 'student',
  });
  const student2 = await User.create({
    name: 'Modou Ceesay',
    email: 'modou@school.gm',
    password: 'Student123!',
    role: 'student',
  });
  const student3 = await User.create({
    name: 'Binta Bah',
    email: 'binta@school.gm',
    password: 'Student123!',
    role: 'student',
  });

  const parent = await User.create({
    name: 'Mama Bah',
    email: 'parent@school.gm',
    password: 'Parent123!',
    role: 'parent',
    linkedStudent: student3._id, // Parent sees Binta's results
  });

  console.log('[seed] users created');

  // --- Courses ---------------------------------------------------------
  const courses = await Course.insertMany([
    {
      code: 'CS101',
      title: 'Introduction to Computer Science',
      description: 'Foundations of computing, algorithms, and problem solving.',
      credits: 3,
      lecturer: lecturer1._id,
    },
    {
      code: 'CS201',
      title: 'Data Structures',
      description: 'Lists, trees, graphs and algorithm analysis.',
      credits: 4,
      lecturer: lecturer1._id,
    },
    {
      code: 'MTH110',
      title: 'Calculus I',
      description: 'Limits, derivatives and an intro to integration.',
      credits: 3,
      lecturer: lecturer2._id,
    },
    {
      code: 'ENG101',
      title: 'Academic Writing',
      description: 'Essay structure, citation and clear writing for university work.',
      credits: 2,
      lecturer: lecturer2._id,
    },
  ]);
  const [cs101, cs201, mth110, eng101] = courses;
  console.log('[seed] courses created');

  // --- Results ---------------------------------------------------------
  await Result.create([
    { student: student1._id, course: cs101._id, score: 82, semester: 'First', academicYear: '2024/2025', enteredBy: lecturer1._id },
    { student: student1._id, course: mth110._id, score: 67, semester: 'First', academicYear: '2024/2025', enteredBy: lecturer2._id },
    { student: student2._id, course: cs101._id, score: 55, semester: 'First', academicYear: '2024/2025', enteredBy: lecturer1._id },
    { student: student2._id, course: cs201._id, score: 71, semester: 'Second', academicYear: '2024/2025', enteredBy: lecturer1._id },
    { student: student3._id, course: eng101._id, score: 90, semester: 'First', academicYear: '2024/2025', enteredBy: lecturer2._id },
    { student: student3._id, course: mth110._id, score: 48, semester: 'First', academicYear: '2024/2025', enteredBy: lecturer2._id },
    { student: student3._id, course: cs101._id, score: 73, semester: 'Second', academicYear: '2024/2025', enteredBy: lecturer1._id },
  ]);
  console.log('[seed] results created');

  console.log('\n[seed] done. Sample logins:');
  console.log('  admin    -> admin@school.gm    / Admin123!');
  console.log('  lecturer -> fatou@school.gm    / Lecturer123!');
  console.log('  student  -> awa@school.gm      / Student123!');
  console.log('  parent   -> parent@school.gm   / Parent123!   (linked to Binta Bah)');

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
