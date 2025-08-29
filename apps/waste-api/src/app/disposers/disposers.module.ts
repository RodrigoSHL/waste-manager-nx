import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DisposersService } from './disposers.service';
import { DisposersController } from './disposers.controller';
import { Disposer } from './entities/disposer.entity';
import { DisposersSeedService } from './seeds/disposers-seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([Disposer])],
  controllers: [DisposersController],
  providers: [DisposersService, DisposersSeedService],
  exports: [DisposersService, DisposersSeedService],
})
export class DisposersModule {}
