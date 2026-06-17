import { Controller, Post, Get, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import type { SignInDto, SignUpDto } from './dto/auth.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // Replaces: account.create() + account.createEmailPasswordSession()
  @Post('sign-up')
  signUp(@Body() dto: SignUpDto) {
    return this.authService.signUp(dto);
  }

  // Replaces: account.createEmailPasswordSession()
  @Post('sign-in')
  signIn(@Body() dto: SignInDto) {
    return this.authService.signIn(dto);
  }

  // Replaces: account.get() — protected route, JWT required
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  getMe(@Request() req: any) {
    return this.authService.getLoggedInUser(req.user.id);
  }

  // Replaces: account.deleteSession('current')
  // JWT is stateless so logout is handled on the frontend by deleting the token
  @Post('sign-out')
  signOut() {
    return { message: 'Signed out successfully' };
  }
}