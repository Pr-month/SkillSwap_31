import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  // UseGuards,
  // Req,
  // ForbiddenException,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
// import { Role } from 'src/users/enum';
// import { JwtAccessGuard } from 'src/auth/guards/jwt-access.guard';

// type AuthRequest = Request & {
//   user: {
//     id: string;
//     role: Role;
//   };
// };

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // @Post()
  // @UseGuards(JwtAccessGuard)
  // create(
  //   @Body() createCategoryDto: CreateCategoryDto,
  //   @Req() req: AuthRequest,
  // ): Promise<Category> {
  //   const user = req.user;

  //   if (user.role !== Role.Admin) {
  //     throw new ForbiddenException('Недостаточно прав');
  //   }

  //   return this.categoriesService.create(createCategoryDto);
  // }

  @Post()
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesService.create(createCategoryDto);
  }

  @Get()
  findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoriesService.remove(id);
  }
}
