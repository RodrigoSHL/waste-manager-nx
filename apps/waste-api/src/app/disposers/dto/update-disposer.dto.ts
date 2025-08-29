import { PartialType } from '@nestjs/mapped-types';
import { CreateDisposerDto } from './create-disposer.dto';

export class UpdateDisposerDto extends PartialType(CreateDisposerDto) {}
