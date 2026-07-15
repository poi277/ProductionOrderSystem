package com.poi.orderSystem.features.user;

import com.poi.orderSystem.features.util.EnumUtil.Role;

public record UserResponse(String id, String name, Role role) {
}
