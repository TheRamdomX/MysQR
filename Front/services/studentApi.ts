import { API_URL } from './api';
import { SeccionAsignatura } from '../types/domain';

// GET /api/db/sections/student/:id — secciones en las que está inscrito un alumno.
export async function getStudentSections(alumnoId: number): Promise<SeccionAsignatura[]> {
  const response = await fetch(`${API_URL}/api/db/sections/student/${alumnoId}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

export type ScanStatus = 'registered' | 'already_registered' | 'expired' | 'not_enrolled' | 'invalid';

export interface ScanResult {
  status: ScanStatus;
  message: string;
}

// POST /api/scan — le manda al backend el string crudo leído por la cámara
// (servicio `student`); el backend decide si es válido, si el alumno está
// inscrito y si ya había registrado asistencia, sin que el cliente decida nada.
export async function scanAttendance(qr: string, token: string): Promise<ScanResult> {
  const response = await fetch(`${API_URL}/api/scan`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ qr }),
  });

  const body = await response.json().catch(() => ({}));

  if (response.status === 404) return { status: 'expired', message: 'QR expirado, pide uno nuevo' };
  if (response.status === 403) return { status: 'not_enrolled', message: 'No estás inscrito en esta sección' };
  if (response.status === 400) return { status: 'invalid', message: 'QR inválido' };
  if (!response.ok) {
    throw new Error(body.error || `Error al registrar asistencia: ${response.statusText}`);
  }

  return body.status === 'already_registered'
    ? { status: 'already_registered', message: 'Ya habías registrado tu asistencia' }
    : { status: 'registered', message: '¡Asistencia registrada!' };
}
