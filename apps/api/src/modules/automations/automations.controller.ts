import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PlanLimit, PlanLimitGuard } from '../../common/guards/plan-limit.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AutomationsService } from './automations.service';
import { CreateAutomationDto, createAutomationSchema } from './dto/create-automation.dto';
import { UpdateAutomationDto, updateAutomationSchema } from './dto/update-automation.dto';

@Controller('automations')
@UseGuards(JwtAuthGuard, PlanLimitGuard)
export class AutomationsController {
  constructor(private readonly automations: AutomationsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.automations.list(user.userId);
  }

  @Get(':id')
  get(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.automations.get(user.userId, id);
  }

  @Post()
  @PlanLimit('automations')
  create(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(createAutomationSchema)) dto: CreateAutomationDto,
  ) {
    return this.automations.create(user.userId, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateAutomationSchema)) dto: UpdateAutomationDto,
  ) {
    return this.automations.update(user.userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.automations.remove(user.userId, id);
  }
}
