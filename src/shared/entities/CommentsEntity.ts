import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from "typeorm";

@Entity('comments')
export class CommentsEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({ type: 'int' })
    animeId: number;

    @ManyToOne('UserEntity', 'comments')
    @JoinColumn({ name: 'userId' })
    user: any;

    @Column({ type: 'varchar' })
    userId: string;

    @ManyToOne(() => CommentsEntity, (comment) => comment.replies)
    @JoinColumn({ name: 'parentId' }) 
    parent: CommentsEntity;

    @Column({ type: 'int', nullable: true }) 
    parentId: number | null;

    @OneToMany(() => CommentsEntity, (comment) => comment.parent)
    replies: CommentsEntity[];

    @Column({ type: 'varchar' })
    content: string;

    @Column("text", { array: true, nullable: true })
    tags: string[];

    @CreateDateColumn({ type: 'timestamp', nullable: true })
    createdAt: Date | null;

    @UpdateDateColumn({ type: 'timestamp', nullable: true })
    updatedAt: Date | null;

    @DeleteDateColumn({ type: 'timestamp', nullable: true })
    deletedAt: Date | null;
}