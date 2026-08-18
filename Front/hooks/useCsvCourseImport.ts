import * as DocumentPicker from 'expo-document-picker';
import { useState } from 'react';
import {
  cleanStudentRow,
  extractCourseCodeFromFilename,
  extractCourseNameFromCsv,
  parseCsvRows,
  readTextFile,
  uploadStudentBatches,
} from '../services/csvImport';

export interface ExtractedCourse {
  codigo: string;
  nombre: string;
}

// Maneja la selección y subida del CSV de alumnos (export de Canvas) que
// da de alta un curso completo. La pantalla solo llama pickFile/upload y
// pinta uploadProgress/uploadStatus.
export function useCsvCourseImport() {
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('');

  const reset = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadStatus('');
  };

  // Abre el picker, valida el nombre del archivo y extrae código/nombre del
  // curso. Devuelve null si el usuario canceló o el archivo no calza.
  const pickFile = async (): Promise<ExtractedCourse | null> => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.assets || result.assets.length === 0) return null;

      const fileName = result.assets[0].name;
      const codigo = extractCourseCodeFromFilename(fileName);
      if (!codigo) {
        setUploadStatus('Error: El nombre del archivo debe contener el código en formato CIT1000_CA16');
        return null;
      }

      setSelectedFile(result);
      setUploadStatus('Archivo seleccionado: ' + fileName);

      const fileContent = await readTextFile(result.assets[0].uri);
      const nombre = extractCourseNameFromCsv(fileContent);
      if (!nombre) {
        setUploadStatus('Error: No se pudo extraer el nombre del curso del CSV');
        return null;
      }

      return { codigo, nombre };
    } catch (error) {
      console.error('Error al seleccionar archivo:', error);
      setUploadStatus('Error al seleccionar archivo');
      return null;
    }
  };

  const upload = async (params: {
    cit: string;
    nombre: string;
    dias: string[];
    bloque: string;
    profesorId: string;
  }) => {
    if (!selectedFile?.assets || selectedFile.assets.length === 0) {
      setUploadStatus('Por favor, seleccione un archivo primero');
      return;
    }
    if (!params.cit || !params.nombre) {
      setUploadStatus('Error: No se pudo extraer el código o la sección del archivo');
      return;
    }

    try {
      const fileContent = await readTextFile(selectedFile.assets[0].uri);
      const students = parseCsvRows(fileContent)
        .slice(1) // la primera fila es "Points Possible", no un alumno
        .map(cleanStudentRow)
        .filter((s): s is NonNullable<typeof s> => s !== null);

      if (students.length === 0) {
        setUploadStatus('No se encontraron alumnos válidos en el archivo');
        return;
      }

      setUploadStatus('Procesando archivo...');
      setUploadProgress(0);

      await uploadStudentBatches(
        students,
        {
          codigo: params.cit,
          nombre: params.nombre,
          dias: params.dias,
          bloque: params.bloque ? params.bloque.slice(-5) : '',
        },
        params.profesorId,
        (percent, statusText) => {
          setUploadProgress(percent);
          setUploadStatus(statusText);
        },
      );

      setUploadStatus('¡Archivo procesado con éxito!');
      setTimeout(reset, 2000);
    } catch (error) {
      console.error('Error procesando CSV:', error);
      setUploadStatus('Error al procesar el archivo');
    }
  };

  return { selectedFile, uploadProgress, uploadStatus, pickFile, upload, reset };
}
