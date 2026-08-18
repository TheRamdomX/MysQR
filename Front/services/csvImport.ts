import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { API_URL } from './api';

// Lee un archivo de texto tanto en web (uri puede venir como data: URI o
// blob URL) como en nativo (uri de FileSystem).
export async function readTextFile(uri: string): Promise<string> {
  if (Platform.OS === 'web') {
    if (uri.startsWith('data:')) {
      const base64Content = uri.split(',')[1];
      return decodeBase64Utf8(base64Content);
    }
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result as string;
        if (content.startsWith('data:text/csv;base64,')) {
          try {
            resolve(decodeBase64Utf8(content.split(',')[1]));
          } catch (error) {
            reject(error);
          }
        } else {
          resolve(content);
        }
      };
      reader.onerror = reject;
      reader.readAsText(blob, 'UTF-8');
    });
  }

  return FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.UTF8 });
}

function decodeBase64Utf8(base64Content: string): string {
  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder('utf-8').decode(bytes);
}

// El nombre del archivo exportado por Canvas trae el código de la sección,
// ej: "2026-08-18T1200_Grades-CIT1000_CA16.csv".
export function extractCourseCodeFromFilename(fileName: string): string | null {
  const match = fileName.match(/CIT\d+_CA\d+/);
  return match ? match[0] : null;
}

// El nombre del curso no viene en ningún encabezado explícito: hay que
// sacarlo de la columna "Section" de la primera fila de alumno real.
export function extractCourseNameFromCsv(fileContent: string): string | null {
  const lines = fileContent.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  const firstStudentLine = lines.find(line =>
    !line.includes('Student,ID') &&
    !line.includes('Points Possible') &&
    line.includes('"')
  );
  if (!firstStudentLine) return null;

  const matches = firstStudentLine.match(/"([^"]*)",([^,]*),([^,]*),([^,]*),([^,]*)/);
  return matches && matches[5] ? matches[5].trim() : null;
}

interface RawStudentRow {
  Student: string;
  ID: string;
  'SIS User ID': string;
  'SIS Login ID': string;
  Section: string;
}

export function parseCsvRows(fileContent: string): RawStudentRow[] {
  return fileContent
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line): RawStudentRow | null => {
      const matches = line.match(/"([^"]*)",([^,]*),([^,]*),([^,]*),([^,]*)/);
      if (!matches) return null;
      return {
        Student: matches[1],
        ID: matches[2],
        'SIS User ID': matches[3],
        'SIS Login ID': matches[4],
        Section: matches[5],
      };
    })
    .filter((row): row is RawStudentRow => row !== null);
}

export interface CleanStudent {
  id: string;
  Nombre: string;
  NombreCompleto: string;
  Rut: string;
  Email: string;
}

function normalizeText(text: string): string {
  return text
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã"/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã'/g, 'Ñ')
    .replace(/\\x81/g, 'Á')
    .replace(/\\x8D/g, 'Í')
    .replace(/\\x93/g, 'Ó')
    .replace(/\\x9A/g, 'Ú')
    .replace(/\\x91/g, 'Ñ')
    .replace(/\\x8DN/g, 'ÍN')
    .replace(/\\x81S/g, 'ÁS')
    .replace(/\\x93N/g, 'ÓN')
    .replace(/\\x9AS/g, 'ÚS')
    .replace(/\\x91O/g, 'ÑO')
    .replace(/"/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function cleanStudentRow(row: RawStudentRow): CleanStudent | null {
  const fullName = row.Student?.trim() || '';
  if (fullName === 'Points Possible') return null;

  const nameParts = fullName.split(',').map(part => normalizeText(part.trim()));
  if (nameParts.length < 2) {
    console.warn('Formato de nombre inválido:', fullName);
    return null;
  }

  const apellido = nameParts[0];
  const nombre = nameParts[1];
  const primerNombre = nombre.split(' ')[0];

  return {
    id: row.ID?.trim() || '',
    Nombre: primerNombre,
    NombreCompleto: `${nombre} ${apellido}`,
    Rut: row['SIS User ID']?.trim() || '',
    Email: row['SIS Login ID']?.trim() || '',
  };
}

export interface CursoInfo {
  codigo: string;
  nombre: string;
  dias: string[];
  bloque: string;
}

// POST /api/db/sections/students/batch — sube los alumnos en lotes para no
// mandar un body gigante de una vez; reporta avance vía onProgress.
export async function uploadStudentBatches(
  students: CleanStudent[],
  curso: CursoInfo,
  profesorId: string,
  onProgress: (percent: number, statusText: string) => void,
): Promise<void> {
  const batchSize = 50;
  const totalBatches = Math.ceil(students.length / batchSize);

  for (let i = 0; i < students.length; i += batchSize) {
    const batch = students.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    const response = await fetch(`${API_URL}/api/db/sections/students/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Profesor-ID': profesorId,
      },
      body: JSON.stringify({ students: batch, curso }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en lote ${batchNumber}: ${errorText}`);
    }

    const progress = Math.round(((i + batch.length) / students.length) * 100);
    onProgress(progress, `Procesando lote ${batchNumber} de ${totalBatches}`);
  }
}
