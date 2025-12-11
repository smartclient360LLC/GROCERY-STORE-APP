package com.grocerystore.auth.dto;

import com.grocerystore.auth.model.FamilyMember;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddFamilyMemberRequest {
    @Email(message = "Valid email is required")
    @NotNull(message = "Email is required")
    private String email;
    
    private FamilyMember.MemberRole memberRole;
    
    private String memberName; // Display name like "Mom", "Dad"
    
    private List<String> preferences; // Dietary preferences
    
    private List<String> allergies; // Allergies list
}

