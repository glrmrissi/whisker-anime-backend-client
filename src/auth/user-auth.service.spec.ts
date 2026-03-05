import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserAuthService } from './user-auth.service';
import { UserEntity } from 'src/shared/entities/UserEntity';
import { NotifierService } from 'src/modules/notifier/notifier.service';
import { RolesEnum } from 'src/shared/enum/roles.enum';

jest.mock('bcrypt');

const mockUser: UserEntity = {
  id: 'uuid-1',
  username: 'test@example.com',
  password: 'hashedPassword',
  nickName: 'testUser',
  role: RolesEnum.USER,
  isAdmin: false,
  isDeleted: false,
  deletedAt: null as any,
  updatedAt: new Date(),
  createdAt: new Date(),
  bio: null,
  isEmailVerified: false,
  verificationToken: null,
  tokenExpiry: null,
  lastLogin: null,
  profileVisibility: 'public',
  twoFactorEnabled: false,
  preferredLanguage: 'en',
  favoriteAnimes: [],
  lastUserAgent: null as any,
  lastIpAddress: null as any,
  avatarUrl: '',
};

describe('UserAuthService', () => {
  let service: UserAuthService;
  let jwtService: jest.Mocked<JwtService>;
  let userRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    update: jest.Mock;
  };
  let notifierService: jest.Mocked<NotifierService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserAuthService,
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
            decode: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-pepper'),
          },
        },
        {
          provide: NotifierService,
          useValue: {
            notify: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    service = module.get<UserAuthService>(UserAuthService);
    jwtService = module.get(JwtService);
    userRepository = module.get(getRepositoryToken(UserEntity));
    notifierService = module.get(NotifierService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const registerDto = {
      username: 'new@example.com',
      password: 'Password1!',
      nickName: 'newUser',
    };

    it('should register a user successfully', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.create.mockReturnValue({ ...registerDto, password: 'hashedPassword' });
      userRepository.save.mockResolvedValue(undefined);

      const result = await service.register(registerDto);

      expect(result).toEqual({ message: 'User registered successfully' });
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashedPassword' }),
      );
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should throw Error when username already exists', async () => {
      // username check returns existing user
      userRepository.findOne.mockResolvedValueOnce(mockUser);

      await expect(service.register(registerDto)).rejects.toThrow('Registration failed');
    });

    it('should throw Error when nickName already exists', async () => {
      userRepository.findOne
        .mockResolvedValueOnce(null) // username not found
        .mockResolvedValueOnce(mockUser); // nickName found

      await expect(service.register(registerDto)).rejects.toThrow('Registration failed');
    });

    it('should throw Error when save fails', async () => {
      userRepository.findOne.mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      userRepository.create.mockReturnValue({ ...registerDto, password: 'hashedPassword' });
      userRepository.save.mockRejectedValue(new Error('db error'));

      await expect(service.register(registerDto)).rejects.toThrow('Registration failed');
    });
  });

  describe('login', () => {
    const loginDto = { username: 'test@example.com', password: 'Password1!' };

    it('should return tokens on successful login', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.update.mockResolvedValue(undefined);
      jwtService.signAsync.mockResolvedValue('token' as any);

      const result = await service.login(loginDto);

      expect(result).toEqual({
        access_token: 'token',
        refresh_token: 'token',
        userId: mockUser.id,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException when username is undefined', async () => {
      await expect(
        service.login({ username: undefined as any, password: 'Password1!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is undefined', async () => {
      await expect(
        service.login({ username: 'test@example.com', password: undefined as any }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refreshToken', () => {
    it('should return a new access token for a valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        username: 'test@example.com',
        password: 'pass',
      } as any);
      userRepository.findOne.mockResolvedValue(mockUser);
      jwtService.decode.mockReturnValue({ username: 'test@example.com', password: 'pass' } as any);
      jwtService.signAsync.mockResolvedValue('new-access-token' as any);

      const result = await service.refreshToken('valid-refresh-token');

      expect(result).toEqual({ access_token: 'new-access-token' });
    });

    it('should throw UnauthorizedException for an invalid refresh token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid token'));

      await expect(service.refreshToken('invalid-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('verifyUser', () => {
    it('should return login response for valid credentials', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      userRepository.update.mockResolvedValue(undefined);
      jwtService.signAsync.mockResolvedValue('token' as any);

      const result = await service.verifyUser('test@example.com', 'Password1!');

      expect(result).toEqual({
        access_token: 'token',
        refresh_token: 'token',
        userId: mockUser.id,
        role: mockUser.role,
      });
      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        { lastLogin: expect.any(Date) },
      );
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.verifyUser('ghost@example.com', 'Password1!')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.verifyUser('test@example.com', 'WrongPassword!')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('verifyToken', () => {
    it('should return the jwt payload for a valid token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ username: 'test@example.com' } as any);
      userRepository.findOne.mockResolvedValue(mockUser);
      jwtService.decode.mockReturnValue({ username: 'test@example.com', password: 'pass' } as any);

      const result = await service.verifyToken('valid-token');

      expect(result).toEqual({ username: 'test@example.com', password: 'pass' });
    });

    it('should throw UnauthorizedException for an empty token', async () => {
      await expect(service.verifyToken('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when payload is missing username', async () => {
      jwtService.verifyAsync.mockResolvedValue({ username: 'test@example.com' } as any);
      userRepository.findOne.mockResolvedValue(mockUser);
      jwtService.decode.mockReturnValue({ username: null, password: 'pass' } as any);

      await expect(service.verifyToken('token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when payload is missing password', async () => {
      jwtService.verifyAsync.mockResolvedValue({ username: 'test@example.com' } as any);
      userRepository.findOne.mockResolvedValue(mockUser);
      jwtService.decode.mockReturnValue({ username: 'test@example.com', password: null } as any);

      await expect(service.verifyToken('token')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when jwtService.verifyAsync fails', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('invalid'));

      await expect(service.verifyToken('bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
    it('should update user with a verification token', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedCode');
      notifierService.notify.mockResolvedValue(undefined as any);
      userRepository.update.mockResolvedValue(undefined);

      await service.forgotPassword('test@example.com');

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        {
          verificationToken: 'hashedCode',
          tokenExpiry: expect.any(Date),
        },
      );
    });

    it('should throw BadRequestException when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword('ghost@example.com')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when repository update fails', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedCode');
      notifierService.notify.mockResolvedValue(undefined as any);
      userRepository.update.mockRejectedValue(new Error('db error'));

      await expect(service.forgotPassword('test@example.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('generateCode', () => {
    it('should return a hashed code and notify the user', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      notifierService.notify.mockResolvedValue(undefined as any);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedCode');

      const result = await service.generateCode('test@example.com');

      expect(result).toBe('hashedCode');
      expect(notifierService.notify).toHaveBeenCalledWith(
        expect.objectContaining({ subject: 'Password Reset Attempt' }),
        expect.objectContaining({ clientEmail: mockUser.username }),
      );
    });

    it('should throw BadRequestException when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.generateCode('ghost@example.com')).rejects.toThrow(BadRequestException);
    });
  });

  describe('newPassword', () => {
    const userWithToken = {
      ...mockUser,
      verificationToken: 'hashedCode',
      tokenExpiry: new Date(Date.now() + 3_600_000),
    };

    it('should update the password when code is valid', async () => {
      userRepository.findOne.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');
      userRepository.update.mockResolvedValue(undefined);

      await service.newPassword('test@example.com', 'NewPassword1!', '123456');

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        { password: 'newHashedPassword' },
      );
    });

    it('should throw BadRequestException when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.newPassword('ghost@example.com', 'NewPassword1!', '123456'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when code is invalid', async () => {
      userRepository.findOne.mockResolvedValue(userWithToken);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.newPassword('test@example.com', 'NewPassword1!', 'wrongCode'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('verifyCode', () => {
    it('should return true for a valid non-expired code', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        verificationToken: 'hashedCode',
        tokenExpiry: new Date(Date.now() + 3_600_000),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.verifyCode('test@example.com', '123456');

      expect(result).toBe(true);
    });

    it('should return false when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.verifyCode('ghost@example.com', '123456');

      expect(result).toBe(false);
    });

    it('should return false when verificationToken is missing', async () => {
      userRepository.findOne.mockResolvedValue({ ...mockUser, verificationToken: null });

      const result = await service.verifyCode('test@example.com', '123456');

      expect(result).toBe(false);
    });

    it('should return false when token is expired', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        verificationToken: 'hashedCode',
        tokenExpiry: new Date(Date.now() - 1000),
      });

      const result = await service.verifyCode('test@example.com', '123456');

      expect(result).toBe(false);
    });

    it('should return false when code does not match', async () => {
      userRepository.findOne.mockResolvedValue({
        ...mockUser,
        verificationToken: 'hashedCode',
        tokenExpiry: new Date(Date.now() + 3_600_000),
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.verifyCode('test@example.com', 'wrongCode');

      expect(result).toBe(false);
    });
  });

  describe('saveUserAgent', () => {
    beforeEach(() => {
      userRepository.findOne.mockResolvedValue(mockUser);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedIp');
      notifierService.notify.mockResolvedValue(undefined as any);
      userRepository.update.mockResolvedValue(undefined);
    });

    it('should save the user agent successfully', async () => {
      await service.saveUserAgent('Mozilla/5.0', mockUser.id, '127.0.0.1');

      expect(userRepository.update).toHaveBeenCalledWith(
        { id: mockUser.id },
        { lastUserAgent: 'Mozilla/5.0' },
      );
    });

    it('should throw BadRequestException when final update fails', async () => {
      // First update call (void, fire-and-forget in saveIpOfUserAgent) resolves fine;
      // second update call (awaited in saveUserAgent) rejects.
      userRepository.update
        .mockResolvedValueOnce(undefined) // saveIpOfUserAgent's void update
        .mockRejectedValueOnce(new Error('db error')); // saveUserAgent's awaited update

      await expect(
        service.saveUserAgent('Mozilla/5.0', mockUser.id, '127.0.0.1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw when user is not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.saveUserAgent('Mozilla/5.0', 'unknown-id', '127.0.0.1'),
      ).rejects.toThrow();
    });
  });
});
