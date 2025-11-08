package com.repository;

import com.model.Order;
import com.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    /**
     * Find all orders by user ID, ordered by order date descending (newest first)
     */
    List<Order> findByUserIdOrderByOrderDateDesc(Long userId);

    /**
     * Find all orders by user ID and status
     */
    List<Order> findByUserIdAndStatus(Long userId, OrderStatus status);

    /**
     * Find all orders by user ID with pagination
     */
    Page<Order> findByUserId(Long userId, Pageable pageable);

    /**
     * Find all orders by status with pagination
     */
    Page<Order> findByStatus(OrderStatus status, Pageable pageable);

    /**
     * Find all orders between two dates
     */
    List<Order> findByOrderDateBetween(LocalDateTime start, LocalDateTime end);
}

