/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../../providers/auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { LoginRequestDto } from '../../dto/login-request.dto';
import { LoginResponseDto } from '../../dto/login-response.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiBody({ type: LoginRequestDto })
  @Post('login')
  async login(@Body() dto: LoginRequestDto): Promise<LoginResponseDto> {
    return this.authService.login(dto);
  }
}
