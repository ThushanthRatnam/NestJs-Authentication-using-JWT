import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@prisma/client';
import { Request } from 'express';
import { GetUser } from 'src/auth/decorator/get-user.decorator';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@Controller('users')
export class UserController {
  //  set guard for authentication here
  @UseGuards(JwtGuard)
  //  define route end points
  @Get('me')
  // function for defined route
  getMe(@GetUser() user: User) {
    // console.log({
    //   user: req.body,
    // });
    // return req.user;
    return user;
  }
}
