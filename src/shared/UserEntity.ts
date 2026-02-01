import { IsStrongPassword, IsUUID } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Roles } from "./enum/roles.enum";

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
}