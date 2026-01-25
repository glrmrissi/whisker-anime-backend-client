import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TokenStorage } from './token.storage';
import { AuthBootstrapService } from './auth-bootstrap.service';

@Module({
  imports: [ConfigModule],
  controllers: [AuthController],
  providers: [AuthService, TokenStorage, AuthBootstrapService],
  exports: [AuthService, TokenStorage, AuthBootstrapService],
})
export class AuthModule {}
