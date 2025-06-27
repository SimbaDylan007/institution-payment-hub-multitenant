package com.payments.repository;

import com.payments.model.ResourceUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceUsageLogRepository extends JpaRepository<ResourceUsageLog, Long> {

    /**
     * Finds the usage frequency of each resource, ordered from most used to least used.
     * @return A list of Object arrays, where each array contains [resourceName, usageCount].
     */
    @Query("SELECT r.resourceName, COUNT(r.resourceName) as usageCount FROM ResourceUsageLog r GROUP BY r.resourceName ORDER BY usageCount DESC")
    List<Object[]> findResourceUsageFrequency();

    /**
     * Counts the total number of usage logs for a specific resource name.
     * @param resourceName The exact name of the resource (e.g., "Library").
     * @return The total count of usage events for that resource.
     */
    long countByResourceName(String resourceName);

    /**
     * Counts the total number of usage logs for resources matching a pattern.
     * @param pattern The pattern to match (e.g., "%Lab%" to count all labs).
     * @return The total count of usage events for matching resources.
     */
    @Query("SELECT COUNT(r) FROM ResourceUsageLog r WHERE r.resourceName LIKE :pattern")
    long countByResourceNameLike(@Param("pattern") String pattern);
}