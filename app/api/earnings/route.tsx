import { NextResponse } from 'next/server';
import earnings from './earnings.json';

export function GET() {
  return NextResponse.json(earnings);
}