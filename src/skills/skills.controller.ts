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
  Req
} from '@nestjs/common';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { Skill } from './entities/skill.entity';
import { User } from 'src/users/entities/user.entity';
import { FindSkillsDto } from './dto/find-skills.dto';

@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Post()
  @UseGuards(JwtAccessGuard)
  async create(
    @Body() createSkillDto: CreateSkillDto,
    @Req() req,
  ): Promise<Skill> {
    return await this.skillsService.create(createSkillDto, { id: req.user.id } as User);
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async findAll(@Query() findSkillsDto: FindSkillsDto) {
    return this.skillsService.findAll(findSkillsDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.skillsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAccessGuard)
  async update(
    @Param('id', ParseUUIDPipe) id: string, 
    @Body() updateSkillDto: UpdateSkillDto,
    @Req() req,
  ) {
    return this.skillsService.update(id, updateSkillDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(JwtAccessGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req,
  ) {
    await this.skillsService.remove(id, req.user.id);
  }
}
