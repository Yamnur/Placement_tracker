const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Company = require('./models/Company');
const Job = require('./models/Job');
const Drive = require('./models/Drive');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clean
  await Promise.all([User.deleteMany(), Company.deleteMany(), Job.deleteMany(), Drive.deleteMany()]);

  // Admin
  const admin = await User.create({
    name: 'Placement Admin',
    email: 'admin@college.edu',
    password: 'admin123',
    role: 'admin',
  });
  console.log('✅ Admin created: admin@college.edu / admin123');

  // Students
  const s1 = await User.create({ name: 'Rahul Sharma', email: 'rahul@college.edu', password: 'student123', role: 'student', rollNumber: '20CS001', branch: 'CSE', cgpa: 8.5, phone: '9876543210', graduationYear: 2024, skills: ['React', 'Node.js', 'MongoDB'], isProfileComplete: true });
  const s2 = await User.create({ name: 'Priya Patel', email: 'priya@college.edu', password: 'student123', role: 'student', rollNumber: '20ECE001', branch: 'ECE', cgpa: 7.8, phone: '9876543211', graduationYear: 2024, skills: ['Python', 'ML', 'C++'], isProfileComplete: true });
  const s3 = await User.create({ name: 'Amit Kumar', email: 'amit@college.edu', password: 'student123', role: 'student', rollNumber: '20CS002', branch: 'CSE', cgpa: 6.5, phone: '9876543212', graduationYear: 2024, skills: ['Java', 'SQL'], isProfileComplete: true });
  console.log('✅ 3 students created (password: student123)');

  // Companies
  const infosys = await Company.create({ name: 'Infosys', industry: 'IT Services', location: 'Bangalore', website: 'https://infosys.com', description: 'Leading global IT company.', createdBy: admin._id });
  const tcs = await Company.create({ name: 'TCS', industry: 'IT Services', location: 'Mumbai', website: 'https://tcs.com', description: 'Tata Consultancy Services.', createdBy: admin._id });
  const wipro = await Company.create({ name: 'Wipro', industry: 'IT Services', location: 'Bangalore', website: 'https://wipro.com', description: 'Global information technology company.', createdBy: admin._id });
  console.log('✅ 3 companies created');

  // Jobs
  const job1 = await Job.create({ title: 'Systems Engineer', company: infosys._id, role: 'Systems Engineer', salary: 6.5, type: 'Full-time', minCGPA: 7.0, eligibleBranches: ['CSE', 'IT', 'ECE'], skills: ['Java', 'SQL', 'Communication'], createdBy: admin._id });
  const job2 = await Job.create({ title: 'Software Developer', company: tcs._id, role: 'Software Developer', salary: 7.0, type: 'Full-time', minCGPA: 7.5, eligibleBranches: ['CSE', 'IT'], skills: ['Python', 'Django', 'SQL'], createdBy: admin._id });
  const job3 = await Job.create({ title: 'Project Engineer', company: wipro._id, role: 'Project Engineer', salary: 6.0, type: 'Full-time', minCGPA: 6.0, eligibleBranches: ['CSE', 'ECE', 'EEE', 'IT', 'ME', 'CE'], skills: ['C++', 'Python'], createdBy: admin._id });
  console.log('✅ 3 jobs created');

  // Drives
  const deadline1 = new Date(); deadline1.setDate(deadline1.getDate() + 14);
  const date1 = new Date(); date1.setDate(date1.getDate() + 20);
  await Drive.create({ title: 'Infosys Campus Drive 2024', job: job1._id, driveDate: date1, deadline: deadline1, venue: 'Main Auditorium', status: 'active', createdBy: admin._id });

  const deadline2 = new Date(); deadline2.setDate(deadline2.getDate() + 7);
  const date2 = new Date(); date2.setDate(date2.getDate() + 15);
  await Drive.create({ title: 'TCS NQT 2024', job: job2._id, driveDate: date2, deadline: deadline2, venue: 'Seminar Hall B', status: 'active', createdBy: admin._id });

  const deadline3 = new Date(); deadline3.setDate(deadline3.getDate() + 21);
  const date3 = new Date(); date3.setDate(date3.getDate() + 30);
  await Drive.create({ title: 'Wipro Talent Drive', job: job3._id, driveDate: date3, deadline: deadline3, venue: 'Online', status: 'upcoming', createdBy: admin._id });

  console.log('✅ 3 drives created');
  console.log('\n🎉 Seed complete!');
  console.log('\nLogin credentials:');
  console.log('  Admin:   admin@college.edu    / admin123');
  console.log('  Student: rahul@college.edu    / student123  (CSE, CGPA 8.5)');
  console.log('  Student: priya@college.edu    / student123  (ECE, CGPA 7.8)');
  console.log('  Student: amit@college.edu     / student123  (CSE, CGPA 6.5)');

  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
