package com.poi.orderSystem.features.entity;

import com.poi.orderSystem.features.util.EnumUtil.Role;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "InsteckUser")
@Getter
@Setter
public class InsteckUser {

	@Id
	private String id;
	private String name;
	private String password;
	@Enumerated(EnumType.STRING)
	private Role role;
}
