package com.payments.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import javax.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentAlert implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    @Column(precision = 19, scale = 4)
    private BigDecimal amount;

    @Column(length = 10)
    private String currency;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "institution_id", referencedColumnName = "id")
    private Institution institution;

    @Transient
    private Object date;
    @Column(length = 1000)
    private String narrative;
    @Column(length = 255)
    private String nr1;
    @Column(length = 255)
    private String nr2;
    @Column(length = 255)
    private String nr3;
    @Column(length = 255)
    private String nr4;
    private int picked;
    @Column(length = 255)
    private String reference;
    @Column(length = 100)
    private String source;
    @Column(length = 100)
    private String status;
    @Column(length = 100)
    private String tcd;
    @Column(length = 100)
    private String transactionDate;
    @Column(length = 255)
    private String studentName;
    @Column(length = 255)
    private String studentSurname;
    @Column(length = 100)
    private String regNumber;

    // --- Getters and Setters ---
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public Object getDate() { return date; }
    public void setDate(Object date) { this.date = date; }
    public String getNarrative() { return narrative; }
    public void setNarrative(String narrative) { this.narrative = narrative; }
    public String getNr1() { return nr1; }
    public void setNr1(String nr1) { this.nr1 = nr1; }
    public String getNr2() { return nr2; }
    public void setNr2(String nr2) { this.nr2 = nr2; }
    public String getNr3() { return nr3; }
    public void setNr3(String nr3) { this.nr3 = nr3; }
    public String getNr4() { return nr4; }
    public void setNr4(String nr4) { this.nr4 = nr4; }
    public int getPicked() { return picked; }
    public void setPicked(int picked) { this.picked = picked; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getTcd() { return tcd; }
    public void setTcd(String tcd) { this.tcd = tcd; }
    public String getTransactionDate() { return transactionDate; }
    public void setTransactionDate(String transactionDate) { this.transactionDate = transactionDate; }
    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }
    public String getStudentSurname() { return studentSurname; }
    public void setStudentSurname(String studentSurname) { this.studentSurname = studentSurname; }
    public String getRegNumber() { return regNumber; }
    public void setRegNumber(String regNumber) { this.regNumber = regNumber; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public Institution getInstitution() { return institution; }
    public void setInstitution(Institution institution) { this.institution = institution; }
}