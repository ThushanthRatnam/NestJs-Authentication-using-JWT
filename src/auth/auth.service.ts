import { ConfigService } from '@nestjs/config';
import { ForbiddenException, Injectable } from '@nestjs/common';
import * as argon from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { JwtService } from '@nestjs/jwt';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: AuthDto) {
    // generate hashing password
    const hash = await argon.hash(dto.password);

    // create user to DB
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        // show details restriction
        // select: {
        //   id: true,
        //   email: true,
        //   createdAt: true,
        // },
      });

      // return the values
      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async login(dto: AuthDto) {
    // find the user
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    //  if user does not exists throw exception
    if (!user) throw new ForbiddenException('Credentials invalid');

    //compare password
    const checkPW = await argon.verify(user.hash, dto.password);

    if (!checkPW) throw new ForbiddenException('Credentials invalid');

    // delete user.hash;
    return this.signToken(user.id, user.email);
  }

  async signToken(userId: number, email: string) {
    const payload = { sub: userId, email };
    const secret = this.config.get('JWT_SECRET');
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    return { access_token: token };
  }
}
