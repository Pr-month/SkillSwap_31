import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Category } from '../../categories/entities/category.entity';

@Entity()
export class Skill {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 200 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @ManyToOne(() => Category, { nullable: false })
    @JoinColumn({ name: 'categoryId' })
    category: Category;

    @Column({ type: 'text', array: true, nullable: true })
    images?: string[];

    @ManyToOne(() => User, user => user.skills, { nullable: false })
    @JoinColumn({ name: 'ownerId' })
    owner: User;
}