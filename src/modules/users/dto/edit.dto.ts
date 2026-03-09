import { IsString } from "class-validator";

export class EditValueRequestDto {
    @IsString()
    bio: string
}