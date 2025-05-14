import bcrypt from 'bcrypt';

async function testHash() {
  // Hash from database
  const storedHash = '$2b$10$2b0KLBGm0bQJe3ImIa.K5OVGj6KPyDfAr1UhbfC5Pc.2KePBLCXLu';
  // Password from login attempt
  const password = 'password123';
  
  try {
    const match = await bcrypt.compare(password, storedHash);
    console.log('Password match with stored hash:', match);
    
    // Now let's generate a proper hash that will match
    const newHash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', newHash);
    
    const newMatch = await bcrypt.compare(password, newHash);
    console.log('Password match with new hash:', newMatch);
  } catch (error) {
    console.error('Error comparing passwords:', error);
  }
}

testHash();