package com.grocerystore.auth.controller;

import com.grocerystore.auth.dto.*;
import com.grocerystore.auth.service.FamilyAccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth/family")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class FamilyAccountController {
    
    private final FamilyAccountService familyAccountService;
    
    // ========== Family Account Endpoints ==========
    
    @PostMapping
    public ResponseEntity<?> createFamilyAccount(
            @RequestParam Long userId,
            @Valid @RequestBody CreateFamilyAccountRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(familyAccountService.createFamilyAccount(userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to create family account");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<FamilyAccountDto>> getUserFamilyAccounts(@PathVariable Long userId) {
        return ResponseEntity.ok(familyAccountService.getUserFamilyAccounts(userId));
    }
    
    @GetMapping("/{familyId}")
    public ResponseEntity<?> getFamilyAccountById(
            @PathVariable Long familyId,
            @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(familyAccountService.getFamilyAccountById(familyId, userId));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Family account not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PutMapping("/{familyId}")
    public ResponseEntity<?> updateFamilyAccount(
            @PathVariable Long familyId,
            @RequestParam Long userId,
            @Valid @RequestBody CreateFamilyAccountRequest request) {
        try {
            return ResponseEntity.ok(familyAccountService.updateFamilyAccount(familyId, userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update family account");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/{familyId}")
    public ResponseEntity<?> deleteFamilyAccount(
            @PathVariable Long familyId,
            @RequestParam Long userId) {
        try {
            familyAccountService.deleteFamilyAccount(familyId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to delete family account");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== Family Member Endpoints ==========
    
    @PostMapping("/{familyId}/members")
    public ResponseEntity<?> addFamilyMember(
            @PathVariable Long familyId,
            @RequestParam Long userId,
            @Valid @RequestBody AddFamilyMemberRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(familyAccountService.addFamilyMember(familyId, userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to add family member");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/{familyId}/members/{memberId}")
    public ResponseEntity<?> updateFamilyMember(
            @PathVariable Long familyId,
            @PathVariable Long memberId,
            @RequestParam Long userId,
            @Valid @RequestBody AddFamilyMemberRequest request) {
        try {
            return ResponseEntity.ok(familyAccountService.updateFamilyMember(familyId, memberId, userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update family member");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/{familyId}/members/{memberId}")
    public ResponseEntity<?> removeFamilyMember(
            @PathVariable Long familyId,
            @PathVariable Long memberId,
            @RequestParam Long userId) {
        try {
            familyAccountService.removeFamilyMember(familyId, memberId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to remove family member");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== Shared Shopping Lists Endpoints ==========
    
    @PostMapping("/{familyId}/lists")
    public ResponseEntity<?> createSharedList(
            @PathVariable Long familyId,
            @RequestParam Long userId,
            @Valid @RequestBody CreateSharedListRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(familyAccountService.createSharedList(familyId, userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to create shared list");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/{familyId}/lists")
    public ResponseEntity<?> getFamilyLists(
            @PathVariable Long familyId,
            @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(familyAccountService.getFamilyLists(familyId, userId));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to get family lists");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/lists/user/{userId}")
    public ResponseEntity<List<SharedShoppingListDto>> getUserLists(@PathVariable Long userId) {
        return ResponseEntity.ok(familyAccountService.getUserLists(userId));
    }
    
    @GetMapping("/lists/{listId}")
    public ResponseEntity<?> getListById(
            @PathVariable Long listId,
            @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(familyAccountService.getListById(listId, userId));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "List not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
    
    @PutMapping("/lists/{listId}")
    public ResponseEntity<?> updateSharedList(
            @PathVariable Long listId,
            @RequestParam Long userId,
            @Valid @RequestBody CreateSharedListRequest request) {
        try {
            return ResponseEntity.ok(familyAccountService.updateSharedList(listId, userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update shared list");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/lists/{listId}")
    public ResponseEntity<?> deleteSharedList(
            @PathVariable Long listId,
            @RequestParam Long userId) {
        try {
            familyAccountService.deleteSharedList(listId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to delete shared list");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    // ========== List Items Endpoints ==========
    
    @PostMapping("/lists/{listId}/items")
    public ResponseEntity<?> addListItem(
            @PathVariable Long listId,
            @RequestParam Long userId,
            @Valid @RequestBody AddListItemRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(familyAccountService.addListItem(listId, userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to add list item");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @GetMapping("/lists/{listId}/items")
    public ResponseEntity<?> getListItems(
            @PathVariable Long listId,
            @RequestParam Long userId) {
        try {
            return ResponseEntity.ok(familyAccountService.getListItems(listId, userId));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to get list items");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/lists/items/{itemId}")
    public ResponseEntity<?> updateListItem(
            @PathVariable Long itemId,
            @RequestParam Long userId,
            @Valid @RequestBody AddListItemRequest request) {
        try {
            return ResponseEntity.ok(familyAccountService.updateListItem(itemId, userId, request));
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to update list item");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @PutMapping("/lists/items/{itemId}/check")
    public ResponseEntity<?> toggleListItemChecked(
            @PathVariable Long itemId,
            @RequestParam Long userId,
            @RequestParam(required = false) Boolean isChecked) {
        try {
            familyAccountService.toggleListItemChecked(itemId, userId, isChecked);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to toggle list item");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
    
    @DeleteMapping("/lists/items/{itemId}")
    public ResponseEntity<?> deleteListItem(
            @PathVariable Long itemId,
            @RequestParam Long userId) {
        try {
            familyAccountService.deleteListItem(itemId, userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage() != null ? e.getMessage() : "Failed to delete list item");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}

