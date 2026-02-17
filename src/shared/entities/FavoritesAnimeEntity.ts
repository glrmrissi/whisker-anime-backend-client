import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from "typeorm";

@Entity('favorites_animes')
export class FavoritesAnimeEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne('UserEntity', 'favoriteAnimes')
    @JoinColumn({ name: 'userId' })
    user: any;

    @Column({ type: 'uuid' })
    userId: string;

    @Column()
    animeId: number;

    @Column()
    commentsId: number;
}
