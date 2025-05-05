
package com.payments.model;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@Entity
@JsonIgnoreProperties(ignoreUnknown = true)
public class PaymentAlert {
    @Id
    private String id;
    private double amount;
    
    @Transient
    private Object date; // Using Object to handle both String and Timestamp
    
    private String narrative;
    private String nr1;
    private String nr2;
    private String nr3;
    private String nr4;
    private int picked;
    private String reference;
    private String source;
    private String status;
    private String tcd;
    private String transactionDate;
    
    // Derived fields
    private String studentName;
    private String studentSurname;
    private String regNumber;
}
