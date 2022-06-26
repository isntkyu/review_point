import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Places } from 'src/entities/Places';

@Module({
  imports: [TypeOrmModule.forFeature([Places])],
  controllers: [PlacesController],
  providers: [PlacesService],
  exports: [PlacesService],
})
export class PlacesModule {}
