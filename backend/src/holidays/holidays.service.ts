import { BadRequestException, Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateHolidayDto } from './dto/create-holiday.dto';
import { UpdateHolidayDto } from './dto/update-holiday.dto';

@Injectable()
export class HolidaysService {
  constructor(private supabaseService: SupabaseService) {}

  async listHolidays() {
    const { data, error } = await this.supabaseService.client
      .from('public_holidays')
      .select('id,date,description,created_at')
      .order('date', { ascending: true });
    if (error) {
      throw new BadRequestException('Unable to load holidays');
    }
    return data ?? [];
  }

  async createHoliday(dto: CreateHolidayDto) {
    const date = this.normalizeDate(dto.date);
    const description = dto.description.trim();
    const { data, error } = await this.supabaseService.client
      .from('public_holidays')
      .insert({ date, description })
      .select('id,date,description,created_at')
      .single();
    if (error || !data) {
      throw new BadRequestException(error?.message || 'Unable to create holiday');
    }
    return data;
  }

  async updateHoliday(id: string, dto: UpdateHolidayDto) {
    const updateData: { date?: string; description?: string } = {};
    if (dto.date) {
      updateData.date = this.normalizeDate(dto.date);
    }
    if (dto.description !== undefined) {
      updateData.description = dto.description.trim();
    }
    const { data, error } = await this.supabaseService.client
      .from('public_holidays')
      .update(updateData)
      .eq('id', id)
      .select('id,date,description,created_at')
      .single();
    if (error || !data) {
      throw new BadRequestException(error?.message || 'Unable to update holiday');
    }
    return data;
  }

  async deleteHoliday(id: string) {
    const { error } = await this.supabaseService.client
      .from('public_holidays')
      .delete()
      .eq('id', id);
    if (error) {
      throw new BadRequestException(error?.message || 'Unable to delete holiday');
    }
    return { success: true };
  }

  private normalizeDate(value: string) {
    const date = new Date(value);
    const utc = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    return utc.toISOString().slice(0, 10);
  }
}
