import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { RequestStatus } from '../enum';

@Entity('requests')
export class Request {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // время создания
  @CreateDateColumn()
  createdAt: Date;

  // пользователь создавший заявку
  @ManyToOne(() => User, { nullable: false })
  sender: User;

  // пользователь которому предложили
  @ManyToOne(() => User, {
    nullable: false,
  })
  receiver: User;

  // status(enum список)
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.Pending,
  })
  status: RequestStatus;

  // Навык, который предлагает отправитель
  @ManyToOne(() => Skill, {
    nullable: false,
  })
  offeredSkill: Skill;

  // Навык, который отправитель хочет получить
  @ManyToOne(() => Skill, {
    nullable: false,
  })
  requestedSkill: Skill;

  // прочитано ли получателем
  @Column({ default: false })
  isRead: boolean;
}
