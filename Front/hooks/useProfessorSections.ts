import { useEffect, useState } from 'react';
import { getProfessorSections } from '../services/professorApi';
import { CourseBase } from '../types/domain';

export interface TeacherCourse extends CourseBase {
  asistencia: string[];
  dias: string[];
  bloque: string;
}

// Secciones que dicta el profesor, mapeadas a la forma que usa la lista de
// cursos (dias/bloque quedan vacíos: hoy el backend no los modela, solo
// existen para el alta manual de un curso desde la propia pantalla).
export function useProfessorSections(profesorId: string | undefined) {
  const [courses, setCourses] = useState<TeacherCourse[]>([]);

  useEffect(() => {
    if (!profesorId) return;
    const numId = parseInt(profesorId, 10);
    if (isNaN(numId)) {
      console.error('ID de profesor inválido');
      return;
    }

    getProfessorSections(numId)
      .then(secciones => {
        setCourses(secciones.map(seccion => ({
          id: seccion.seccion_id.toString(),
          nombre: seccion.nombre,
          cit: seccion.codigo,
          asistencia: [],
          dias: [],
          bloque: '',
        })));
      })
      .catch(error => console.error('Error al cargar las secciones:', error));
  }, [profesorId]);

  return { courses, setCourses };
}
