import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
// import { Skill } from '../../skills/entities/skill.entity';
// import { Category } from '../../categories/entities/category.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 100 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    about?: string;

    @Column({ type: 'date', nullable: true })
    birthdate?: Date;

    @Column({ nullable: true })
    city?: string;

    @Column({ type: 'enum', enum: ['male', 'female'], default: '' })
    gender: 'male' | 'female';

    @Column({ nullable: true })
    avatar?: string;

    // @OneToMany(() => Skill, skill => skill.owner)
    // skills: Skill[];

    // @ManyToMany(() => Category, { nullable: true })
    // @JoinTable({
    //     name: 'user_want_to_learn',
    //     joinColumn: { name: 'userId', referencedColumnName: 'id' },
    //     inverseJoinColumn: { name: 'categoryId', referencedColumnName: 'id' },
    // })
    // wantToLearn: Category[];

    // @ManyToMany(() => Skill, skill => skill.favoritedBy)
    // @JoinTable({
    //     name: 'user_favorite_skills',
    //     joinColumn: { name: 'userId', referencedColumnName: 'id' },
    //     inverseJoinColumn: { name: 'skillId', referencedColumnName: 'id' },
    // })
    // favoriteSkills: Skill[];

    @Column({ type: 'enum', enum: ['USER', 'ADMIN'], default: 'USER' })
    role: 'USER' | 'ADMIN';

    @Column({ nullable: true })
    refreshToken?: string;
}
