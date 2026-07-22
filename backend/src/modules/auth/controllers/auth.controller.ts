import {
  Controller,
  Post,
  Get,
  Body,
  UseFilters,
  UseGuards,
  Request,
  Response,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { AllExceptionsFilter } from '../../../common/filters/http-exception.filter';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/** How long the httpOnly cookie stays valid (seconds) */
const ACCESS_TOKEN_COOKIE_MAX_AGE = 60 * 60; // 1 hour
const REFRESH_TOKEN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/** Base cookie options — httpOnly prevents JS access (XSS protection) */
const cookieOptions = (maxAge: number) => ({
  httpOnly: true, // Not readable by JS (XSS protection)
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax' as const, // CSRF protection
  maxAge,
  path: '/',
});

@ApiTags('Authentication')
@Controller('auth')
@UseFilters(AllExceptionsFilter)
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body(ValidationPipe) loginDto: LoginDto, @Response({ passthrough: true }) res: any) {
    const result = await this.authService.login(loginDto);

    // Set tokens as httpOnly cookies (invisible to JavaScript — XSS safe)
    res.cookie('accessToken', result.accessToken, cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE));
    res.cookie('refreshToken', result.refreshToken, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE));

    // Also return tokens in response body for backward compat (localStorage clients)
    return result;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed' })
  async refreshToken(
    @Body() body: { refreshToken?: string },
    @Request() req: any,
    @Response({ passthrough: true }) res: any
  ) {
    // Accept refresh token from either cookie or request body
    const token = req.cookies?.refreshToken || body.refreshToken;
    const result = await this.authService.refreshToken(token);

    // Update cookies with new tokens
    res.cookie('accessToken', result.accessToken, cookieOptions(ACCESS_TOKEN_COOKIE_MAX_AGE));
    res.cookie('refreshToken', result.refreshToken, cookieOptions(REFRESH_TOKEN_COOKIE_MAX_AGE));

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Logout user — clears auth cookies' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(@Response({ passthrough: true }) res: any) {
    // Clear both auth cookies
    res.clearCookie('accessToken', { httpOnly: true, path: '/' });
    res.clearCookie('refreshToken', { httpOnly: true, path: '/' });
    return { message: 'Logged out successfully' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user info' })
  async getMe(@Request() req: any) {
    return req.user;
  }
}
