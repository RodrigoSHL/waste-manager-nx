import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDisposerDto } from './dto/create-disposer.dto';
import { UpdateDisposerDto } from './dto/update-disposer.dto';
import { Disposer } from './entities/disposer.entity';

@Injectable()
export class DisposersService {
  constructor(
    @InjectRepository(Disposer)
    private disposersRepository: Repository<Disposer>,
  ) {}

  async create(createDisposerDto: CreateDisposerDto): Promise<Disposer> {
    const disposer = this.disposersRepository.create(createDisposerDto);
    return await this.disposersRepository.save(disposer);
  }

  async findAll(): Promise<Disposer[]> {
    return await this.disposersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Disposer> {
    const disposer = await this.disposersRepository.findOne({
      where: { id },
    });

    if (!disposer) {
      throw new NotFoundException(`Disposer with ID ${id} not found`);
    }

    return disposer;
  }

  async update(id: string, updateDisposerDto: UpdateDisposerDto): Promise<Disposer> {
    const disposer = await this.findOne(id);
    
    Object.assign(disposer, updateDisposerDto);
    
    return await this.disposersRepository.save(disposer);
  }

  async remove(id: string): Promise<void> {
    const disposer = await this.findOne(id);
    await this.disposersRepository.remove(disposer);
  }

  async findByWasteType(wasteType: string): Promise<Disposer[]> {
    return await this.disposersRepository
      .createQueryBuilder('disposer')
      .where(':wasteType = ANY(disposer.wasteTypes)', { wasteType })
      .andWhere('disposer.status = :status', { status: 'active' })
      .getMany();
  }

  async findByLocation(location: string): Promise<Disposer[]> {
    return await this.disposersRepository
      .createQueryBuilder('disposer')
      .where('disposer.location ILIKE :location', { location: `%${location}%` })
      .getMany();
  }
}
