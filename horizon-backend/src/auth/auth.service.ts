import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { SignUpDto, SignInDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async signUp(dto: SignUpDto) {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    // Hash the password before saving — never store plain text passwords
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create the user in the database without the plain text password
    const { password, ...userWithoutPassword } = dto;
    const user = await this.prisma.user.create({
      data: {
        ...userWithoutPassword,
        password: hashedPassword,
      },
    });

    // Generate a JWT token for the newly created user
    const token = this.generateToken(user.id, user.email);

    return { user, token };
  }

  async signIn(dto: SignInDto) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Compare the incoming password with the hashed one in the database
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    // Generate a JWT token for the authenticated user
    const token = this.generateToken(user.id, user.email);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async getLoggedInUser(userId: string) {
    const user = await this.usersService.findById(userId);
    const { password, ...userWithoutPassword } = user as any;
    return userWithoutPassword;
  }

  private generateToken(userId: string, email: string) {
    // The payload is what gets encoded inside the JWT token
    // 'sub' is standard JWT for the subject (user ID)
    return this.jwtService.sign({ sub: userId, email });
  }
}