import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disposer, DisposerStatus } from '../entities/disposer.entity';

@Injectable()
export class DisposersSeedService {
  constructor(
    @InjectRepository(Disposer)
    private disposersRepository: Repository<Disposer>,
  ) {}

  async seed() {
    // Check if data already exists
    const count = await this.disposersRepository.count();
    if (count > 0) {
      console.log('Disposers already have data. Skipping seed...');
      return;
    }

    const disposersSeed = [
      {
        name: 'EcoRecycle S.A.',
        wasteTypes: ['Plastic', 'Metal', 'Glass'],
        location: 'North Industrial Zone, City',
        phone: '+1234567890',
        email: 'contact@ecorecycle.com',
        plasticRate: 2.5,
        cardboardRate: 0,
        metalRate: 5.0,
        organicRate: 0,
        glassRate: 1.8,
        status: DisposerStatus.ACTIVE,
      },
      {
        name: 'Green Clean',
        wasteTypes: ['Cardboard', 'Plastic'],
        location: 'Ecological Ave 123, City',
        phone: '+1234567891',
        email: 'info@greenclean.com',
        plasticRate: 2.2,
        cardboardRate: 1.8,
        metalRate: 0,
        organicRate: 0,
        glassRate: 0,
        status: DisposerStatus.ACTIVE,
      },
      {
        name: 'Waste Pro',
        wasteTypes: ['Metal', 'Organic'],
        location: 'South Industrial Park, City',
        phone: '+1234567892',
        email: 'sales@wastepro.com',
        plasticRate: 0,
        cardboardRate: 0,
        metalRate: 4.8,
        organicRate: 0.5,
        glassRate: 0,
        status: DisposerStatus.ACTIVE,
      },
    ];

    for (const disposerData of disposersSeed) {
      const disposer = this.disposersRepository.create(disposerData);
      await this.disposersRepository.save(disposer);
    }

    console.log('✅ Disposers seed completed');
  }
}
