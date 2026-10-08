import { Module } from '@nestjs/common';
import { WatchProgressController } from './watch-progress.controller';
import { WatchProgressService } from './watch-progress.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WatchProgressController],
  providers: [WatchProgressService],
  exports: [WatchProgressService],
})
export class WatchProgressModule {}
