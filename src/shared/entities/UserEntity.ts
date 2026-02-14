import { IsStrongPassword, IsUUID } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Roles } from "../enum/roles.enum";
import { Exclude } from "class-transformer";


@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID('4')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    @IsStrongPassword(
        {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }
    )
    @Exclude()
    password: string;

    @Column()
    avatarUrl: string;

    @Column({ unique: true })
    nickName: string;

    @Column({ type: 'varchar', default: Roles.USER })
    role: Roles;

    @Column({ default: false })
    isAdmin: boolean;

    @Column({ default: false })
    isDeleted: boolean;

    @DeleteDateColumn()
    deletedAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @CreateDateColumn()
    createdAt: Date;

    @Column({ type: 'text', nullable: true })
    bio: string | null;

    @Column({ default: false })
    isEmailVerified: boolean;

    @Exclude()
    @Column({ type: 'varchar', length: 255, nullable: true })
    verificationToken: string | null;

    @Exclude()
    @Column({ type: 'timestamp', nullable: true })
    tokenExpiry: Date | null;

    @Column({ type: 'timestamp', nullable: true })
    lastLogin: Date | null;

    @Column({ type: 'varchar', length: 50, default: 'public' })
    profileVisibility: string;

    @Column({ default: false })
    twoFactorEnabled: boolean;

    @Column({ type: 'varchar', length: 10, default: 'en' })
    preferredLanguage: string;

    @OneToMany('FavoritesAnimeEntity', 'user')
    favoriteAnimes: any[];

    @Exclude()
    @Column({ type: 'varchar', length: 255, nullable: true })
    lastUserAgent: string;

    @Exclude()
    @Column({ type: 'varchar', length: 255, nullable: true })
    lastIpAddress: string;
}