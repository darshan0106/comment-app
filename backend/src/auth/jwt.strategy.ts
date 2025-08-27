// backend/src/auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

// Define the shape of our JWT payload
export interface JwtPayload {
  id: string;
  email: string;
}

// Export the AuthenticatedRequest interface so it can be imported by other modules
export interface AuthenticatedRequest extends Request {
  user: { id: string; email: string }; // Matches JwtPayload structure
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from "Bearer <token>" header
      secretOrKey: process.env.JWT_SECRET || 'yourStrongJwtSecretKey', // Must match the secret in JwtModule.register
      ignoreExpiration: false, // Don't ignore token expiration
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new UnauthorizedException('User not found.');
    }
    return user; // The validated user object will be attached to req.user
  }
}
