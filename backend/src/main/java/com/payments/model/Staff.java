
package com.payments.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import javax.persistence.*;
import java.time.LocalDate;
import java.util.List;
import java.time.Year;
import java.util.Random;

@Entity
@Table(name = "staff")
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String employeeId;
    
    @Column(nullable = false)
    private String firstName;
    
    @Column(nullable = false)
    private String lastName;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String phone;

    @Column(nullable = true)
    private LocalDate dateOfBirth;

    @Column(nullable = true)
    private String gender;
    
    private String address;
    
    @Column(nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate hireDate;
    
    @Column(nullable = false)
    private String department;
    
    @Column(nullable = false)
    private String position;
    
    @Column(nullable = false)
    private String employmentStatus; // ACTIVE, INACTIVE, TERMINATED, ON_LEAVE
    
    private Double salary;
    
    private String qualifications;
    
    private String specializations;

    /**
     * This method is automatically called by JPA/Hibernate right before
     * a new Staff entity is saved to the database for the first time.
     * It will not run on updates.
     */
    @PrePersist
    public void generateEmployeeId() {
        // We only generate an ID if one has not been set already
        if (this.employeeId == null || this.employeeId.isEmpty()) {
            String year = String.valueOf(Year.now().getValue()).substring(2); // last 2 digits of the current year
            int randomNum = new Random().nextInt(900000) + 100000; // 6-digit random number for less collision chance
            this.employeeId = "E" + year + randomNum; // e.g., "E25123456"
        }
    }


    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<StaffAttendance> attendanceRecords;
    
    @OneToMany(mappedBy = "staff", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LeaveRequest> leaveRequests;

    // A student MUST belong to an institution.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "institution_id",referencedColumnName = "id", nullable = false)
    private Institution institution;
    
    // Constructors
    public Staff() {}
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getEmployeeId() { return employeeId; }
    public void setEmployeeId(String employeeId) { this.employeeId = employeeId; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    
    public LocalDate getHireDate() { return hireDate; }
    public void setHireDate(LocalDate hireDate) { this.hireDate = hireDate; }
    
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    
    public String getPosition() { return position; }
    public void setPosition(String position) { this.position = position; }
    
    public String getEmploymentStatus() { return employmentStatus; }
    public void setEmploymentStatus(String employmentStatus) { this.employmentStatus = employmentStatus; }
    
    public Double getSalary() { return salary; }
    public void setSalary(Double salary) { this.salary = salary; }
    
    public String getQualifications() { return qualifications; }
    public void setQualifications(String qualifications) { this.qualifications = qualifications; }
    
    public String getSpecializations() { return specializations; }
    public void setSpecializations(String specializations) { this.specializations = specializations; }
    
    public List<StaffAttendance> getAttendanceRecords() { return attendanceRecords; }
    public void setAttendanceRecords(List<StaffAttendance> attendanceRecords) { this.attendanceRecords = attendanceRecords; }
    
    public List<LeaveRequest> getLeaveRequests() { return leaveRequests; }
    public void setLeaveRequests(List<LeaveRequest> leaveRequests) { this.leaveRequests = leaveRequests; }

    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}
