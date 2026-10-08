import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AdminSettingsService } from './admin-settings.service';
import { AdminGuard } from '../auth/admin.guard';
import { UpdateSettingDto } from './dto/admin-misc.dto';

@Controller('admin/settings')
@UseGuards(AdminGuard)
export class AdminSettingsController {
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  @Get()
  getAll() {
    return this.adminSettingsService.getAll();
  }

  @Patch()
  updateMany(@Body() dto: UpdateSettingDto) {
    return this.adminSettingsService.updateMany(dto.settings);
  }
}
