// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../entities/user.entity'; // Import User entity
import { JwtStrategy } from './jwt.strategy'; // Will create this next

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // Register User entity with this module
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretjwtkey', // Use environment variable for secret
      signOptions: { expiresIn: '1h' }, // Token expiration time
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy], // Provide JwtStrategy
  exports: [AuthService, PassportModule, JwtModule], // Export for other modules to use auth
})
export class AuthModule {}
