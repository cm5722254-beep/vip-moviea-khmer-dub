import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';

import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditModule } from '../audit/audit.module';

import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';

import { AdminMoviesController } from './admin-movies.controller';
import { AdminMoviesService } from './admin-movies.service';

import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';

import { AdminDepositsController } from './admin-deposits.controller';
import { AdminDepositsService } from './admin-deposits.service';

import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminDashboardService } from './admin-dashboard.service';

import { AdminSettingsController } from './admin-settings.controller';
import { AdminSettingsService } from './admin-settings.service';

import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';

import { AdminPromotionsController } from './admin-promotions.controller';
import { AdminPromotionsService } from './admin-promotions.service';

@Module({
  imports: [
    AuthModule,
    StorageModule,
    NotificationsModule,
    AuditModule,
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [
    AdminAuthController,
    AdminMoviesController,
    AdminUsersController,
    AdminDepositsController,
    AdminDashboardController,
    AdminSettingsController,
    AdminCategoriesController,
    AdminPromotionsController,
  ],
  providers: [
    AdminAuthService,
    AdminMoviesService,
    AdminUsersService,
    AdminDepositsService,
    AdminDashboardService,
    AdminSettingsService,
    AdminCategoriesService,
    AdminPromotionsService,
  ],
  exports: [
    AdminAuthService,
    AdminMoviesService,
    AdminUsersService,
  ],
})
export class AdminModule {}
