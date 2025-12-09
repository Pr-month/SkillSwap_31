import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { Request as ExchangeRequest } from './entities/request.entity';
import { Request } from 'express';
import { UpdateRequestDto } from './dto/update-request.dto';

type AuthRequest = Request & {
  user: { id: string };
};

@Controller('requests')
@UseGuards(JwtAccessGuard)
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  // POST /requests
  @Post()
  create(
    @Body() dto: CreateRequestDto,
    @Req() req: AuthRequest,
  ): Promise<ExchangeRequest> {
    return this.requestsService.create(dto, req.user.id);
  }

  // GET /requests/incoming
  @Get('incoming')
  findIncoming(@Req() req: AuthRequest): Promise<ExchangeRequest[]> {
    return this.requestsService.findIncoming(req.user.id);
  }

  // GET /requests/outgoing
  @Get('outgoing')
  findOutgoing(@Req() req: AuthRequest): Promise<ExchangeRequest[]> {
    return this.requestsService.findOutgoing(req.user.id);
  }

  // PATCH /requests/:id
  @Patch(':id')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRequestDto,
    @Req() req: AuthRequest,
  ): Promise<ExchangeRequest> {
    return this.requestsService.updateStatus(id, dto, req.user.id);
  }
}
