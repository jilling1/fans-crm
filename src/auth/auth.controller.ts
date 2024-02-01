import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  NotFoundException,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RegisterDto } from './dtos/register.dto';
import { UserService } from 'src/user/user.service';
import * as bcryptjs from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { Response, Request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller({
  version: '1',
})
@UseInterceptors(ClassSerializerInterceptor)
export class AuthController {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const { password_confirm, ...data } = body;
    if (body.password !== password_confirm) {
      throw new BadRequestException('Passwords do not match');
    }

    const hashed = await bcryptjs.hash(body.password, 12);

    return this.userService.save({
      ...data,
      password: hashed,
    });
  }

  @Post('login')
  async login(
    @Body('email') email: string,
    @Body('password') password: string,
    @Res({ passthrough: true }) response: Response,
  ) {
    const user = this.userService.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcryptjs.compare(password, (await user).password))) {
      throw new BadRequestException('Invalid credential');
    }

    const jwt = await this.jwtService.signAsync({
      id: (await user).id,
    });

    response.cookie('jwt', jwt, { httpOnly: true });

    return {
      message: 'success',
      token: jwt,
    };
  }

  @UseGuards(AuthGuard)
  @Get('user')
  async user(@Req() request: Request) {
    const cookie = request.cookies['jwt'];
    const { id } = await this.jwtService.verifyAsync(cookie);
    const user = await this.userService.findOne({ where: { id } });

    return user;
  }

  @Get('users')
  async users() {
    const users = await this.userService.findAll();

    return users;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('jwt');

    return {
      message: 'success logout',
    };
  }
}
