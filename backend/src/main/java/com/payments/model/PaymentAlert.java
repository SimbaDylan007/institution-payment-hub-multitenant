package com.payments.model;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import java.io.Serializable;

@Data // This generates getters and setters for all fields
@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentAlert implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    private String id;

    private double amount;

    @Transient
    private Object date; // Using Object to handle both String and Timestamp

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
    private String status; // This field exists

    @Column(length = 100)
    private String tcd;

    @Column(length = 100)
    private String transactionDate;

    // Derived fields
    @Column(length = 255)
    private String studentName;

    @Column(length = 255)
    private String studentSurname;

    @Column(length = 100)
    private String regNumber;

}