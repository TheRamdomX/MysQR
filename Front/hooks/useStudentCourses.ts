import { useEffect, useState } from 'react';
import { getStudentSections } from '../services/studentApi';
import { CourseBase } from '../types/domain';

export interface StudentCourse extends CourseBase {
  asistencia: boolean[];
}

// Secciones en las que está inscrito el alumno, mapeadas a la forma que usa
// la lista de cursos.
export function useStudentCourses(alumnoId: string | number | undefined) {
  const [courses, setCourses] = useState<StudentCourse[]>([]);

  useEffect(() => {
    if (!alumnoId) return;
    const numId = parseInt(alumnoId.toString(), 10);
    if (isNaN(numId)) {
      console.error('ID de alumno inválido');
      return;
    }

    getStudentSections(numId)
      .then(secciones => {
        setCourses(secciones.map(seccion => ({
          id: seccion.seccion_id.toString(),
          nombre: seccion.nombre,
          cit: `CIT${seccion.asignatura_id}`,
          asistencia: [],
        })));
      })
      .catch(error => console.error('Error al cargar las secciones:', error));
  }, [alumnoId]);

  return { courses };
}
