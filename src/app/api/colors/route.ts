// src/app/api/colors/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get('company');

  if (!company) {
    return NextResponse.json({ error: 'Missing company' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('firmen')
    .select(`
      primary_color,
      primary_color_dark,
      primary_color_light,
      border_radius,
      input_border_radius,
      font_family
    `)
    .eq('name', company)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    primaryColor: data.primary_color || '#3b82f6',
    primaryColorDark: data.primary_color_dark || '#2563eb',
    primaryColorLight: data.primary_color_light || '#eff6ff',
    borderRadius: data.border_radius || '0.5rem',
    inputBorderRadius: data.input_border_radius || '0.5rem',
    fontFamily: data.font_family || "'Inter', sans-serif"
  });
}
