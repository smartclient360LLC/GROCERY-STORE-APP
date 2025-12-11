package com.grocerystore.order.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter
public class JsonbConverter implements AttributeConverter<String, Object> {
    
    @Override
    public Object convertToDatabaseColumn(String attribute) {
        if (attribute == null) {
            return null;
        }
        // Use PostgreSQL's PGobject via reflection to avoid compile-time dependency
        try {
            Class<?> pgObjectClass = Class.forName("org.postgresql.util.PGobject");
            Object pgObject = pgObjectClass.getDeclaredConstructor().newInstance();
            pgObjectClass.getMethod("setType", String.class).invoke(pgObject, "jsonb");
            pgObjectClass.getMethod("setValue", String.class).invoke(pgObject, attribute);
            return pgObject;
        } catch (Exception e) {
            // Fallback: return as string and let PostgreSQL cast it
            return attribute;
        }
    }
    
    @Override
    public String convertToEntityAttribute(Object dbData) {
        if (dbData == null) {
            return null;
        }
        // Handle PGobject via reflection
        try {
            Class<?> pgObjectClass = Class.forName("org.postgresql.util.PGobject");
            if (pgObjectClass.isInstance(dbData)) {
                return (String) pgObjectClass.getMethod("getValue").invoke(dbData);
            }
        } catch (Exception e) {
            // Fallback to toString
        }
        return dbData.toString();
    }
}

