import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from './entities/request.entity';
import { Skill } from 'src/skills/entities/skill.entity';
import { CreateRequestDto } from './dto/create-request.dto';
import { RequestStatus } from './enum';
import { UpdateRequestDto } from './dto/update-request.dto';
import { Role } from 'src/users/enum';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,
  ) {}

  // POST
  async create(dto: CreateRequestDto, currentUserId: string): Promise<Request> {
    const offeredSkill = await this.skillsRepository.findOne({
      where: { id: dto.offeredSkillId },
      relations: ['owner'],
    });

    if (!offeredSkill) {
      throw new NotFoundException('Предлагаемый навык не найден');
    }

    if (!offeredSkill.owner) {
      throw new BadRequestException(
        'У предлагаемого навыка не указан владелец',
      );
    }

    if (offeredSkill.owner.id !== currentUserId) {
      throw new ForbiddenException(
        'Вы можете отправлять заявки только от своих навыков',
      );
    }

    const requestedSkill = await this.skillsRepository.findOne({
      where: { id: dto.requestedSkillId },
      relations: ['owner'],
    });

    if (!requestedSkill) {
      throw new NotFoundException('Запрашиваемый навык не найден');
    }

    if (!requestedSkill.owner) {
      throw new BadRequestException(
        'У запрашиваемого навыка не указан владелец',
      );
    }

    const sender = offeredSkill.owner;
    const receiver = requestedSkill.owner;

    const request = this.requestsRepository.create({
      sender,
      receiver,
      offeredSkill,
      requestedSkill,
      status: RequestStatus.Pending,
      isRead: false,
    });

    return this.requestsRepository.save(request);
  }

  //GET /requests/incoming
  async findIncoming(currentUserId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        receiver: { id: currentUserId },
        status: In([RequestStatus.Pending, RequestStatus.InProgress]),
      },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });
  }

  // GET /requests/outgoing
  async findOutgoing(currentUserId: string): Promise<Request[]> {
    return this.requestsRepository.find({
      where: {
        sender: { id: currentUserId },
        status: In([RequestStatus.Pending, RequestStatus.InProgress]),
      },
      relations: ['sender', 'receiver', 'offeredSkill', 'requestedSkill'],
      order: { createdAt: 'DESC' },
    });
  }

  // PATCH /requests/:id
  async updateStatus(
    id: string,
    dto: UpdateRequestDto,
    currentUserId: string,
  ): Promise<Request> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['receiver'],
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    // обновлять может только получатель
    if (request.receiver.id !== currentUserId) {
      throw new ForbiddenException('Можно обновлять только входящие заявки');
    }

    // разрешаем только accepted / rejected
    if (
      dto.status !== RequestStatus.Accepted &&
      dto.status !== RequestStatus.Rejected
    ) {
      throw new BadRequestException(
        'Обновлять статус можно только на accepted или rejected',
      );
    }

    request.status = dto.status;
    request.isRead = true;

    return this.requestsRepository.save(request);
  }

  // DELETE /requests/:id
  async remove(
    id: string,
    currentUserId: string,
    currentUserRole: Role,
  ): Promise<void> {
    const request = await this.requestsRepository.findOne({
      where: { id },
      relations: ['sender'],
    });

    if (!request) {
      throw new NotFoundException('Заявка не найдена');
    }

    const isAdmin = currentUserRole === Role.Admin;

    if (!isAdmin && request.sender.id !== currentUserId) {
      throw new ForbiddenException('Можно удалять только исходящие заявки');
    }

    await this.requestsRepository.delete(id);
  }
}
