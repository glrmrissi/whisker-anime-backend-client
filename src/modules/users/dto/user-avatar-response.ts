import { IsUUID } from "class-validator";
import { Column, PrimaryGeneratedColumn,  } from "typeorm";


export class UserAvatarResponse {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID('4')
    id: string;

    @Column({ unique: true })
    username: string;

    @Column()
    avatarUrl: string;

    @Column({ unique: true })
    nickName: string;

    @Column({ default: false })
    isDeleted: boolean;
}