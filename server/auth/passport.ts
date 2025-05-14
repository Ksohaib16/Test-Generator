import { Strategy as LocalStrategy } from 'passport-local';
import { PassportStatic } from 'passport';
import bcrypt from 'bcrypt';
import { IStorage } from '../storage';
import { User } from '@shared/schema';

// Add declaration for bcrypt module
declare module 'bcrypt' {
  export function compare(data: string, encrypted: string): Promise<boolean>;
  export function hash(data: string, saltOrRounds: string | number): Promise<string>;
}

export function initializePassport(passport: PassportStatic, storage: IStorage) {
  // Configure LocalStrategy for authentication
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' }, 
      async (email, password, done) => {
        try {
          // Find user by email
          const user = await storage.getUserByEmail(email);
          
          // If user not found
          if (!user) {
            return done(null, false, { message: 'No user with that email' });
          }
          
          // Check password
          const isMatch = await bcrypt.compare(password, user.password);
          
          if (isMatch) {
            // Create a user object that matches Express.User
            const userForAuth: Express.User = {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              institutionId: user.institutionId
            };
            return done(null, userForAuth);
          } else {
            return done(null, false, { message: 'Password incorrect' });
          }
        } catch (error) {
          return done(error);
        }
      }
    )
  );
  
  // Serialize user for session
  passport.serializeUser((user: Express.User, done) => {
    done(null, user.id);
  });
  
  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      
      // Create a user object that matches Express.User
      const userForAuth: Express.User = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institutionId: user.institutionId
      };
      done(null, userForAuth);
    } catch (error) {
      done(error);
    }
  });
}