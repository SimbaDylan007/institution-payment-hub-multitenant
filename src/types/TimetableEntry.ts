
export interface TimetableEntry {
  id?: number;
  subject: string;
  teacher: string;
  grade: string;
  section: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  academicYear: string;
}

export interface CreateTimetableEntryRequest {
  subject: string;
  teacher: string;
  grade: string;
  section: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string;
  academicYear: string;
}
