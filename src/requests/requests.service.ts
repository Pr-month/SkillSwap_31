import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { Request } from './entities/request.entity';
import { RequestStatus } from './enum';
import { Skill } from 'src/skills/entities/skill.entity';
import { UpdateRequestDto } from './dto/update-request.dto';

@Injectable()
export class RequestsService {
  constructor(
    @InjectRepository(Request)
    private readonly requestsRepository: Repository<Request>,

    @InjectRepository(Skill)
    private readonly skillsRepository: Repository<Skill>,

    private readonly notificationsGateway: NotificationsGateway,
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
      relations: ['owner', 'category'],
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

    const savedRequest = await this.requestsRepository.save(request);

    // Отправляем уведомление получателю заявки
    this.notificationsGateway.notifyNewRequest(receiver.id, {
      skillName: requestedSkill.category.name,
      fromUser: {
        id: sender.id,
        name: sender.name,
      },
      requestId: savedRequest.id,
    });

    return savedRequest;
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
      relations: [
        'offeredSkill.category',
        'offeredSkill',
        'receiver',
        'requestedSkill.category',
        'requestedSkill',
        'sender',
      ],
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

    const updatedRequest = await this.requestsRepository.save(request);

    // Отправляем уведомление отправителю заявки
    const notificationPayload = {
      skillName: request.offeredSkill.category.name,
      fromUser: {
        id: request.receiver.id,
        name: request.receiver.name,
      },
      requestId: request.id,
    };

    if (dto.status === RequestStatus.Accepted) {
      this.notificationsGateway.notifyRequestAccepted(
        request.sender.id,
        notificationPayload,
      );
    } else if (dto.status === RequestStatus.Rejected) {
      this.notificationsGateway.notifyRequestRejected(
        request.sender.id,
        notificationPayload,
      );
    }

    return updatedRequest;
  }
}
