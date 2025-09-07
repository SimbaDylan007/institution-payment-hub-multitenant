package com.payments.dto;

import java.util.List;
import java.util.ArrayList;

public class ReportCardDto {
    private String studentName;
    private String studentId;
    private String gradeLevel;
    private String academicYear;
    private String semester;
    private List<SubjectGradeDto> subjectGrades = new ArrayList<>();
    private double overallAverage;
    private String overallGrade;
    private String teacherComments;
    private String principalComments;


    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getGradeLevel() {
        return gradeLevel;
    }

    public void setGradeLevel(String gradeLevel) {
        this.gradeLevel = gradeLevel;
    }

    public String getAcademicYear() {
        return academicYear;
    }

    public void setAcademicYear(String academicYear) {
        this.academicYear = academicYear;
    }

    public String getSemester() {
        return semester;
    }

    public void setSemester(String semester) {
        this.semester = semester;
    }

    public List<SubjectGradeDto> getSubjectGrades() {
        return subjectGrades;
    }

    public void setSubjectGrades(List<SubjectGradeDto> subjectGrades) {
        this.subjectGrades = subjectGrades;
    }

    public double getOverallAverage() {
        return overallAverage;
    }

    public void setOverallAverage(double overallAverage) {
        this.overallAverage = overallAverage;
    }

    public String getOverallGrade() {
        return overallGrade;
    }

    public void setOverallGrade(String overallGrade) {
        this.overallGrade = overallGrade;
    }

    public String getTeacherComments() {
        return teacherComments;
    }

    public void setTeacherComments(String teacherComments) {
        this.teacherComments = teacherComments;
    }

    public String getPrincipalComments() {
        return principalComments;
    }

    public void setPrincipalComments(String principalComments) {
        this.principalComments = principalComments;
    }
}
