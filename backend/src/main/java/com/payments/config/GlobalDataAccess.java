package com.payments.config;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * This annotation marks a service or method as being exempt from the multi-tenant institution filter.
 * Use it for services that manage global data not tied to a specific institution,
 * such as managing student categories, system-wide settings, etc.
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
public @interface GlobalDataAccess {
}