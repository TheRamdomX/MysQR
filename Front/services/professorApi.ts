import { API_URL } from './api';
import { SeccionAsignatura } from '../types/domain';

export interface ModuleSection {
  modulo_id: number;
  seccion_id: number;
}

// GET /api/db/sections/professor/:id — secciones que dicta un profesor.
export async function getProfessorSections(profesorId: number): Promise<SeccionAsignatura[]> {
  const response = await fetch(`${API_URL}/api/db/sections/professor/${profesorId}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  return response.json();
}

// GET /api/db/professor/current-class — módulo/sección vigente ahora mismo,
// solo informativo (la fuente de verdad para emitir el QR es issueQr).
export async function getCurrentClass(profesorId: number): Promise<ModuleSection | null> {
  const response = await fetch(`${API_URL}/api/db/professor/current-class?profesor_id=${profesorId}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }
  const data = await response.json();
  if (data && data.modulo_id && data.seccion_id) {
    return { modulo_id: data.modulo_id, seccion_id: data.seccion_id };
  }
  return null;
}

export interface IssuedQr {
  encryptedQr: string;
  moduleSection: ModuleSection;
}

// POST /api/classes/start — le pide al backend un QR fresco para la clase
// que le corresponde ahora mismo al profesor autenticado (servicio `teacher`).
export async function issueQr(token: string): Promise<IssuedQr | null> {
  const response = await fetch(`${API_URL}/api/classes/start`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 404) {
    return null; // no hay clase programada en este momento
  }
  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${await response.text()}`);
  }

  const result = await response.json();
  return {
    encryptedQr: result.encrypted_qr,
    moduleSection: { modulo_id: result.data.module_id, seccion_id: result.data.section_id },
  };
}
