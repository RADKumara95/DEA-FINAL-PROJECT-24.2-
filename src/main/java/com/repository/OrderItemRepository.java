package com.repository;

import com.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    /**
     * Find all order items that belong to the given order id
     */
    List<OrderItem> findByOrderId(Long orderId);

    /**
     * Find all order items for the given product id
     *
     * Note: `Product.id` is declared as Long in the model, so this method accepts Long.
     */
    List<OrderItem> findByProductId(Long productId);
}
