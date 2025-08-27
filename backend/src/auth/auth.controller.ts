// backend/src/auth/auth.controller.ts

import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
// Import the new, validated DTOs
import { CreateUserDto, LoginUserDto } from './dto/user.dto';

@Controller('auth') // Base route for this controller
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Set HTTP status to 201 Created
  // Use the validated CreateUserDto
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(
      createUserDto.email,
      createUserDto.password,
    );
  }

  @Post('login')
  @HttpCode(HttpStatus.OK) // Set HTTP status to 200 OK
  // Use the validated LoginUserDto
  async login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto.email, loginUserDto.password);
  }
}
