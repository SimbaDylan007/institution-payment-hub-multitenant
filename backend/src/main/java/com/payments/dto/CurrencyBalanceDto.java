package com.payments.dto;

import java.math.BigDecimal;
import java.util.Map;

public class CurrencyBalanceDto {

    // This map will hold balances like {"USD": 150.00, "ZWG": 25000.00}
    private Map<String, BigDecimal> balances;

    public CurrencyBalanceDto(Map<String, BigDecimal> balances) {
        this.balances = balances;
    }

    // Getters and Setters
    public Map<String, BigDecimal> getBalances() {
        return balances;
    }

    public void setBalances(Map<String, BigDecimal> balances) {
        this.balances = balances;
    }
}