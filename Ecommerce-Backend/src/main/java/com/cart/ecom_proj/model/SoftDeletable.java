package com.cart.ecom_proj.model;

import java.time.LocalDateTime;

public interface SoftDeletable {
    void delete(String deletedBy);
    boolean isDeleted();
    void restore();
    LocalDateTime getDeletedAt();
    String getDeletedBy();
}
