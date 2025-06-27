package com.payments.dto;

public class ResourceUtilizationDto {
    private String mostUsedResource;
    private String leastUsedResource;
    private double libraryUtilizationPercentage;
    private double labUtilizationPercentage;

    // Getters and Setters
    public String getMostUsedResource() { return mostUsedResource; }
    public void setMostUsedResource(String mostUsedResource) { this.mostUsedResource = mostUsedResource; }
    public String getLeastUsedResource() { return leastUsedResource; }
    public void setLeastUsedResource(String leastUsedResource) { this.leastUsedResource = leastUsedResource; }
    public double getLibraryUtilizationPercentage() { return libraryUtilizationPercentage; }
    public void setLibraryUtilizationPercentage(double libraryUtilizationPercentage) { this.libraryUtilizationPercentage = libraryUtilizationPercentage; }
    public double getLabUtilizationPercentage() { return labUtilizationPercentage; }
    public void setLabUtilizationPercentage(double labUtilizationPercentage) { this.labUtilizationPercentage = labUtilizationPercentage; }
}