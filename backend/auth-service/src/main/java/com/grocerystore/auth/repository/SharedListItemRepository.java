package com.grocerystore.auth.repository;

import com.grocerystore.auth.model.SharedListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SharedListItemRepository extends JpaRepository<SharedListItem, Long> {
    List<SharedListItem> findByListIdOrderByCreatedAtAsc(Long listId);
    
    void deleteByListId(Long listId);
}

