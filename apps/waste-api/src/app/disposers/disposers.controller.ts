import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DisposersService } from './disposers.service';
import { CreateDisposerDto } from './dto/create-disposer.dto';
import { UpdateDisposerDto } from './dto/update-disposer.dto';
import { Disposer } from './entities/disposer.entity';

@Controller('disposers')
export class DisposersController {
  constructor(private readonly disposersService: DisposersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDisposerDto: CreateDisposerDto): Promise<Disposer> {
    return await this.disposersService.create(createDisposerDto);
  }

  @Get()
  async findAll(
    @Query('wasteType') wasteType?: string,
    @Query('location') location?: string,
  ): Promise<Disposer[]> {
    if (wasteType) {
      return await this.disposersService.findByWasteType(wasteType);
    }

    if (location) {
      return await this.disposersService.findByLocation(location);
    }

    return await this.disposersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Disposer> {
    return await this.disposersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDisposerDto: UpdateDisposerDto,
  ): Promise<Disposer> {
    return await this.disposersService.update(id, updateDisposerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return await this.disposersService.remove(id);
  }
}
