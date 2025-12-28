import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CitiesService } from './cities.service';
import { CreateCityDto } from './dto/create-city.dto';
import { UpdateCityDto } from './dto/update-city.dto';
import { FindCityDto } from './dto/find-city.dto';
import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/users/enum';

@Controller('cities')
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  // GET /cities?search=
  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() dto: FindCityDto) {
    return this.citiesService.findAll(dto);
  }

  // POST /cities (admin)
  @Post()
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.Admin)
  create(@Body() dto: CreateCityDto) {
    return this.citiesService.create(dto);
  }

  // PATCH /cities/:id (admin)
  @Patch(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.Admin)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCityDto) {
    return this.citiesService.update(id, dto);
  }

  // DELETE /cities/:id (admin)
  @Delete(':id')
  @UseGuards(JwtAccessGuard, RolesGuard)
  @Roles(Role.Admin)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.citiesService.remove(id);
  }
}
