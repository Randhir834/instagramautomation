import { Body, Controller, Delete, Get, HttpCode, Param, Post, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  CreateBookingInput,
  createBookingSchema,
  CreateSlotsInput,
  createSlotsSchema,
} from '@repo/shared';
import { CurrentUser, RequestUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { AvailabilityService } from './availability.service';
import { BookingService } from './booking.service';

@Controller()
export class BookingController {
  constructor(
    private readonly bookings: BookingService,
    private readonly availability: AvailabilityService,
  ) {}

  // ----- Creator (dashboard) -----

  @Get('bookings')
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: RequestUser) {
    return this.bookings.listForUser(user.userId);
  }

  @Post('bookings/:id/cancel')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  cancel(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.bookings.cancel(user.userId, id);
  }

  @Get('bookings/slots')
  @UseGuards(JwtAuthGuard)
  slots(@CurrentUser() user: RequestUser) {
    return this.availability.listSlots(user.userId);
  }

  @Post('bookings/slots')
  @UseGuards(JwtAuthGuard)
  createSlots(
    @CurrentUser() user: RequestUser,
    @Body(new ZodValidationPipe(createSlotsSchema)) dto: CreateSlotsInput,
  ) {
    return this.availability.createSlots(user.userId, dto);
  }

  @Delete('bookings/slots/:id')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  deleteSlot(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.availability.deleteSlot(user.userId, id);
  }

  // ----- Public (booking page) -----

  @Get('public/book/:username')
  openSlots(@Param('username') username: string) {
    return this.availability.listOpenSlots(username);
  }

  @Post('public/book')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  book(@Body(new ZodValidationPipe(createBookingSchema)) dto: CreateBookingInput) {
    return this.bookings.book(dto);
  }
}
