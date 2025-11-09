package com.cart.ecom_proj.repo;

import com.cart.ecom_proj.model.Order;
import com.cart.ecom_proj.model.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserIdAndDeletedFalseOrderByOrderDateDesc(Long userId);
    List<Order> findByUserIdAndStatusAndDeletedFalse(Long userId, OrderStatus status);
    Page<Order> findByUserIdAndDeletedFalse(Long userId, Pageable pageable);
    Page<Order> findByStatusAndDeletedFalse(OrderStatus status, Pageable pageable);
    List<Order> findByOrderDateBetweenAndDeletedFalse(LocalDateTime start, LocalDateTime end);
}

