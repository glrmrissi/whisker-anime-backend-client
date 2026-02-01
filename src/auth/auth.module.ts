import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenStorage } from './token.storage';
import { AuthBootstrapService } from './auth-bootstrap.service';
import { UserAuthService } from './user-auth.service';
import { UserAuthController } from './user-auth.controller';
import { JwtModule } from '@nestjs/jwt';
import * as env from 'dotenv';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../shared/UserEntity'
env.config();
@Module({
  imports: [ConfigModule, JwtModule.register({
    secret: process.env.JWT_SECRET_KEY, 
    signOptions: { expiresIn: '6h' }, 
  }), TypeOrmModule.forFeature([UserEntity])],
  controllers: [AuthController, UserAuthController],
  providers: [AuthService, TokenStorage, AuthBootstrapService, UserAuthService],
  exports: [AuthService, TokenStorage, AuthBootstrapService, UserAuthService, JwtModule],
})
export class AuthModule {}
