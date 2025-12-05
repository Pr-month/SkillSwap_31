import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Req,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { Skill } from './entities/skill.entity';
import { User } from '../users/entities/user.entity';
import { FindSkillsDto } from './dto/find-skills.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

interface RequestWithUser extends Request {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

@Controller('skills')
export class SkillsController {
  constructor(
    private readonly skillsService: SkillsService,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req: RequestWithUser,
  ): Promise<Skill> {
    const user = await this.usersRepository.findOne({
      where: { email: req.user.email },
    });
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }
    return await this.skillsService.create(createSkillDto, user);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() findSkillsDto: FindSkillsDto) {
    return this.skillsService.findAll(findSkillsDto);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async addToFavorites(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Request() req: RequestWithUser,
  ): Promise<void> {
    await this.skillsService.addToFavorites(id, req.user.email);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.skillsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req: RequestWithUser,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.email);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: RequestWithUser,
  ) {
    await this.skillsService.remove(id, req.user.email);
  }
}
