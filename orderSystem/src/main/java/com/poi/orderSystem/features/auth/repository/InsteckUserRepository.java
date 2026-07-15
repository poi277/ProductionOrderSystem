package com.poi.orderSystem.features.auth.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.poi.orderSystem.features.entity.InsteckUser;

public interface InsteckUserRepository extends JpaRepository<InsteckUser, String> {
}
