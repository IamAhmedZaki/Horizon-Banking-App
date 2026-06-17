import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateUserDto {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  address1?: string;
  city?: string;
  postalCode?: string;
  dateOfBirth?: string;
  ssn?: string;
  dwollaCustomerId?: string;
  dwollaCustomerUrl?: string;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    return this.prisma.user.create({ data: dto });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: string, dto: Partial<CreateUserDto>) {
    await this.findById(id);
    return this.prisma.user.update({ where: { id }, data: dto });
  }
}