import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ example: 'Bearer', description: 'Token type' })
  token_type: string;

  @ApiProperty({ example: 3600, description: 'Token lifetime in seconds' })
  expires_in: number;

  @ApiPropertyOptional({ description: 'Refresh token for obtaining new access tokens' })
  refresh_token?: string;

  @ApiPropertyOptional({ description: 'OAuth scopes granted' })
  scope?: string;

  @ApiPropertyOptional({ description: 'Unix timestamp of token creation' })
  created_at?: number;
}
