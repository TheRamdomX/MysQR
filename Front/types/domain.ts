// Tipos de dominio compartidos entre pantallas. Reflejan las formas que
// devuelve el backend (Back/database) — no inventar campos nuevos acá sin
// que el backend los envíe.

// Fila de GET /api/db/sections/{professor,student}/:id
// (mysqr/database/pkg/models.SeccionAsignatura).
export interface SeccionAsignatura {
  seccion_id: number;
  asignatura_id: number;
  nombre: string;
  codigo: string;
}

// Usuario de sesión guardado en AsyncStorage tras el login (ver AuthContext).
// profesorId/alumnoId son mutuamente excluyentes según el rol.
export interface UserData {
  id: string;
  rol: string;
  rut: string;
  profesorId?: string;
  alumnoId?: string;
}

// Campos comunes a un curso/sección en la lista del profesor y del alumno;
// cada pantalla agrega encima los campos que solo ella necesita.
export interface CourseBase {
  id: string;
  nombre: string;
  cit: string;
}

// Fila del reporte de asistencia de toda una sección
// (función SQL obtener_asistencia_por_seccion): una entrada por fecha con
// el detalle de alumno/módulo.
export interface SectionAttendanceRow {
  estudiante: string;
  estudiante_id: number;
  asistencia: {
    [fecha: string]: {
      estado: string;
      alumno_id: number;
      modulo_id: number;
    };
  };
}

// Reporte de asistencia de un único alumno
// (función SQL obtener_asistencia_estudiante_seccion): una entrada por
// fecha, solo el emoji de estado.
export interface StudentAttendanceRow {
  estudiante: string;
  asistencia: {
    [fecha: string]: string;
  };
}
