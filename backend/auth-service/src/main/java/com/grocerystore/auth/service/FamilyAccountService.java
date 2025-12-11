package com.grocerystore.auth.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.grocerystore.auth.dto.*;
import com.grocerystore.auth.model.*;
import com.grocerystore.auth.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class FamilyAccountService {
    
    private final FamilyAccountRepository familyAccountRepository;
    private final FamilyMemberRepository familyMemberRepository;
    private final SharedShoppingListRepository sharedShoppingListRepository;
    private final SharedListItemRepository sharedListItemRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    // ========== Family Account Management ==========
    
    @Transactional
    public FamilyAccountDto createFamilyAccount(Long userId, CreateFamilyAccountRequest request) {
        FamilyAccount familyAccount = FamilyAccount.builder()
                .familyName(request.getFamilyName())
                .createdByUserId(userId)
                .build();
        
        familyAccount = familyAccountRepository.save(familyAccount);
        
        // Add creator as OWNER
        FamilyMember owner = FamilyMember.builder()
                .familyAccount(familyAccount)
                .userId(userId)
                .memberRole(FamilyMember.MemberRole.OWNER)
                .memberName("Owner")
                .isActive(true)
                .build();
        
        familyMemberRepository.save(owner);
        
        return toFamilyAccountDto(familyAccount);
    }
    
    public List<FamilyAccountDto> getUserFamilyAccounts(Long userId) {
        return familyAccountRepository.findByUserId(userId).stream()
                .map(this::toFamilyAccountDto)
                .collect(Collectors.toList());
    }
    
    public FamilyAccountDto getFamilyAccountById(Long familyId, Long userId) {
        FamilyAccount familyAccount = familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        return toFamilyAccountDto(familyAccount);
    }
    
    @Transactional
    public FamilyAccountDto updateFamilyAccount(Long familyId, Long userId, CreateFamilyAccountRequest request) {
        FamilyAccount familyAccount = familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        
        // Only OWNER can update
        FamilyMember member = familyMemberRepository.findByFamilyAccountIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this family"));
        
        if (member.getMemberRole() != FamilyMember.MemberRole.OWNER) {
            throw new RuntimeException("Only the owner can update the family account");
        }
        
        familyAccount.setFamilyName(request.getFamilyName());
        familyAccount = familyAccountRepository.save(familyAccount);
        
        return toFamilyAccountDto(familyAccount);
    }
    
    @Transactional
    public void deleteFamilyAccount(Long familyId, Long userId) {
        FamilyAccount familyAccount = familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        
        // Only OWNER can delete
        FamilyMember member = familyMemberRepository.findByFamilyAccountIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this family"));
        
        if (member.getMemberRole() != FamilyMember.MemberRole.OWNER) {
            throw new RuntimeException("Only the owner can delete the family account");
        }
        
        familyAccountRepository.delete(familyAccount);
    }
    
    // ========== Family Member Management ==========
    
    @Transactional
    public FamilyMemberDto addFamilyMember(Long familyId, Long userId, AddFamilyMemberRequest request) {
        familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        
        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
        
        // Check if already a member
        if (familyMemberRepository.existsByFamilyAccountIdAndUserId(familyId, user.getId())) {
            throw new RuntimeException("User is already a member of this family");
        }
        
        FamilyAccount familyAccount = familyAccountRepository.findById(familyId)
                .orElseThrow(() -> new RuntimeException("Family account not found"));
        
        FamilyMember member = FamilyMember.builder()
                .familyAccount(familyAccount)
                .userId(user.getId())
                .memberRole(request.getMemberRole() != null ? request.getMemberRole() : FamilyMember.MemberRole.MEMBER)
                .memberName(request.getMemberName())
                .preferences(convertListToJson(request.getPreferences()))
                .allergies(convertListToJson(request.getAllergies()))
                .isActive(true)
                .build();
        
        member = familyMemberRepository.save(member);
        
        return toFamilyMemberDto(member);
    }
    
    @Transactional
    public FamilyMemberDto updateFamilyMember(Long familyId, Long memberId, Long userId, AddFamilyMemberRequest request) {
        // Verify access
        familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Family member not found"));
        
        if (!member.getFamilyAccount().getId().equals(familyId)) {
            throw new RuntimeException("Member does not belong to this family");
        }
        
        // Only OWNER can update members, or members can update themselves
        FamilyMember requester = familyMemberRepository.findByFamilyAccountIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this family"));
        
        if (requester.getMemberRole() != FamilyMember.MemberRole.OWNER && !member.getUserId().equals(userId)) {
            throw new RuntimeException("You can only update your own information");
        }
        
        if (request.getMemberRole() != null) {
            member.setMemberRole(request.getMemberRole());
        }
        if (request.getMemberName() != null) {
            member.setMemberName(request.getMemberName());
        }
        if (request.getPreferences() != null) {
            member.setPreferences(convertListToJson(request.getPreferences()));
        }
        if (request.getAllergies() != null) {
            member.setAllergies(convertListToJson(request.getAllergies()));
        }
        
        member = familyMemberRepository.save(member);
        
        return toFamilyMemberDto(member);
    }
    
    @Transactional
    public void removeFamilyMember(Long familyId, Long memberId, Long userId) {
        // Verify access
        familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        
        FamilyMember member = familyMemberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Family member not found"));
        
        if (!member.getFamilyAccount().getId().equals(familyId)) {
            throw new RuntimeException("Member does not belong to this family");
        }
        
        // Only OWNER can remove members, or members can remove themselves
        FamilyMember requester = familyMemberRepository.findByFamilyAccountIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Not a member of this family"));
        
        if (requester.getMemberRole() != FamilyMember.MemberRole.OWNER && !member.getUserId().equals(userId)) {
            throw new RuntimeException("Only the owner can remove members");
        }
        
        // Cannot remove the owner
        if (member.getMemberRole() == FamilyMember.MemberRole.OWNER) {
            throw new RuntimeException("Cannot remove the owner from the family");
        }
        
        member.setIsActive(false);
        familyMemberRepository.save(member);
    }
    
    // ========== Shared Shopping Lists ==========
    
    @Transactional
    public SharedShoppingListDto createSharedList(Long familyId, Long userId, CreateSharedListRequest request) {
        FamilyAccount familyAccount = familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        
        // If this is set as default, unset other defaults
        if (request.getIsDefault() != null && request.getIsDefault()) {
            List<SharedShoppingList> existingLists = sharedShoppingListRepository.findByFamilyAccountIdOrderByIsDefaultDescCreatedAtDesc(familyId);
            existingLists.forEach(list -> {
                if (list.getIsDefault()) {
                    list.setIsDefault(false);
                    sharedShoppingListRepository.save(list);
                }
            });
        }
        
        SharedShoppingList list = SharedShoppingList.builder()
                .familyAccount(familyAccount)
                .listName(request.getListName())
                .createdByUserId(userId)
                .isDefault(request.getIsDefault() != null ? request.getIsDefault() : false)
                .build();
        
        list = sharedShoppingListRepository.save(list);
        
        return toSharedShoppingListDto(list);
    }
    
    public List<SharedShoppingListDto> getFamilyLists(Long familyId, Long userId) {
        familyAccountRepository.findByIdAndUserId(familyId, userId)
                .orElseThrow(() -> new RuntimeException("Family account not found or access denied"));
        
        return sharedShoppingListRepository.findByFamilyAccountIdOrderByIsDefaultDescCreatedAtDesc(familyId).stream()
                .map(this::toSharedShoppingListDto)
                .collect(Collectors.toList());
    }
    
    public List<SharedShoppingListDto> getUserLists(Long userId) {
        return sharedShoppingListRepository.findByUserId(userId).stream()
                .map(this::toSharedShoppingListDto)
                .collect(Collectors.toList());
    }
    
    public SharedShoppingListDto getListById(Long listId, Long userId) {
        SharedShoppingList list = sharedShoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        // Verify user has access through family membership
        familyAccountRepository.findByIdAndUserId(list.getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        return toSharedShoppingListDto(list);
    }
    
    @Transactional
    public SharedShoppingListDto updateSharedList(Long listId, Long userId, CreateSharedListRequest request) {
        SharedShoppingList list = sharedShoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        // Verify user has access
        familyAccountRepository.findByIdAndUserId(list.getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        if (request.getListName() != null) {
            list.setListName(request.getListName());
        }
        
        if (request.getIsDefault() != null && request.getIsDefault()) {
            // Unset other defaults
            List<SharedShoppingList> existingLists = sharedShoppingListRepository
                    .findByFamilyAccountIdOrderByIsDefaultDescCreatedAtDesc(list.getFamilyAccount().getId());
            existingLists.forEach(l -> {
                if (l.getIsDefault() && !l.getId().equals(listId)) {
                    l.setIsDefault(false);
                    sharedShoppingListRepository.save(l);
                }
            });
            list.setIsDefault(true);
        }
        
        list = sharedShoppingListRepository.save(list);
        
        return toSharedShoppingListDto(list);
    }
    
    @Transactional
    public void deleteSharedList(Long listId, Long userId) {
        SharedShoppingList list = sharedShoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        // Verify user has access and is the creator
        familyAccountRepository.findByIdAndUserId(list.getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        if (!list.getCreatedByUserId().equals(userId)) {
            throw new RuntimeException("Only the creator can delete the list");
        }
        
        sharedShoppingListRepository.delete(list);
    }
    
    // ========== List Items ==========
    
    @Transactional
    public SharedListItemDto addListItem(Long listId, Long userId, AddListItemRequest request) {
        SharedShoppingList list = sharedShoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        // Verify user has access
        familyAccountRepository.findByIdAndUserId(list.getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        SharedListItem item = SharedListItem.builder()
                .list(list)
                .productId(request.getProductId())
                .productName(request.getProductName())
                .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                .weight(request.getWeight())
                .notes(request.getNotes())
                .addedByUserId(userId)
                .isChecked(false)
                .build();
        
        item = sharedListItemRepository.save(item);
        
        return toSharedListItemDto(item);
    }
    
    public List<SharedListItemDto> getListItems(Long listId, Long userId) {
        SharedShoppingList list = sharedShoppingListRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        // Verify user has access
        familyAccountRepository.findByIdAndUserId(list.getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        return sharedListItemRepository.findByListIdOrderByCreatedAtAsc(listId).stream()
                .map(this::toSharedListItemDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public SharedListItemDto updateListItem(Long itemId, Long userId, AddListItemRequest request) {
        SharedListItem item = sharedListItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("List item not found"));
        
        // Verify user has access
        familyAccountRepository.findByIdAndUserId(item.getList().getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        if (request.getQuantity() != null) {
            item.setQuantity(request.getQuantity());
        }
        if (request.getWeight() != null) {
            item.setWeight(request.getWeight());
        }
        if (request.getNotes() != null) {
            item.setNotes(request.getNotes());
        }
        
        item = sharedListItemRepository.save(item);
        
        return toSharedListItemDto(item);
    }
    
    @Transactional
    public void toggleListItemChecked(Long itemId, Long userId, Boolean isChecked) {
        SharedListItem item = sharedListItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("List item not found"));
        
        // Verify user has access
        familyAccountRepository.findByIdAndUserId(item.getList().getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        item.setIsChecked(isChecked != null ? isChecked : !item.getIsChecked());
        sharedListItemRepository.save(item);
    }
    
    @Transactional
    public void deleteListItem(Long itemId, Long userId) {
        SharedListItem item = sharedListItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("List item not found"));
        
        // Verify user has access
        familyAccountRepository.findByIdAndUserId(item.getList().getFamilyAccount().getId(), userId)
                .orElseThrow(() -> new RuntimeException("Access denied"));
        
        sharedListItemRepository.delete(item);
    }
    
    // ========== Helper Methods ==========
    
    private FamilyAccountDto toFamilyAccountDto(FamilyAccount familyAccount) {
        List<FamilyMemberDto> members = familyAccount.getMembers() != null
            ? familyAccount.getMembers().stream()
                .map(this::toFamilyMemberDto)
                .collect(Collectors.toList())
            : Collections.emptyList();
        
        return FamilyAccountDto.builder()
                .id(familyAccount.getId())
                .familyName(familyAccount.getFamilyName())
                .createdByUserId(familyAccount.getCreatedByUserId())
                .members(members)
                .createdAt(familyAccount.getCreatedAt())
                .updatedAt(familyAccount.getUpdatedAt())
                .build();
    }
    
    private FamilyMemberDto toFamilyMemberDto(FamilyMember member) {
        User user = userRepository.findById(member.getUserId())
                .orElse(null);
        
        return FamilyMemberDto.builder()
                .id(member.getId())
                .userId(member.getUserId())
                .email(user != null ? user.getEmail() : null)
                .firstName(user != null ? user.getFirstName() : null)
                .lastName(user != null ? user.getLastName() : null)
                .memberRole(member.getMemberRole())
                .memberName(member.getMemberName())
                .preferences(convertJsonToList(member.getPreferences()))
                .allergies(convertJsonToList(member.getAllergies()))
                .isActive(member.getIsActive())
                .joinedAt(member.getJoinedAt())
                .build();
    }
    
    private SharedShoppingListDto toSharedShoppingListDto(SharedShoppingList list) {
        List<SharedListItemDto> items = list.getItems() != null
            ? list.getItems().stream()
                .map(this::toSharedListItemDto)
                .collect(Collectors.toList())
            : Collections.emptyList();
        
        User creator = userRepository.findById(list.getCreatedByUserId()).orElse(null);
        String createdByName = creator != null 
            ? creator.getFirstName() + " " + creator.getLastName()
            : "Unknown";
        
        return SharedShoppingListDto.builder()
                .id(list.getId())
                .familyAccountId(list.getFamilyAccount().getId())
                .listName(list.getListName())
                .createdByUserId(list.getCreatedByUserId())
                .createdByName(createdByName)
                .isDefault(list.getIsDefault())
                .items(items)
                .createdAt(list.getCreatedAt())
                .updatedAt(list.getUpdatedAt())
                .build();
    }
    
    private SharedListItemDto toSharedListItemDto(SharedListItem item) {
        User addedBy = userRepository.findById(item.getAddedByUserId()).orElse(null);
        String addedByName = addedBy != null
            ? addedBy.getFirstName() + " " + addedBy.getLastName()
            : "Unknown";
        
        return SharedListItemDto.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productName(item.getProductName())
                .quantity(item.getQuantity())
                .weight(item.getWeight())
                .notes(item.getNotes())
                .addedByUserId(item.getAddedByUserId())
                .addedByName(addedByName)
                .isChecked(item.getIsChecked())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
    
    private String convertListToJson(List<String> list) {
        if (list == null || list.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            log.error("Error converting list to JSON", e);
            return null;
        }
    }
    
    private List<String> convertJsonToList(String json) {
        if (json == null || json.isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            log.error("Error converting JSON to list", e);
            return Collections.emptyList();
        }
    }
}

