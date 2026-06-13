package com.mst.agritech.security;

import com.mst.agritech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("dataIngestionAuth")
@RequiredArgsConstructor
public class DataIngestionAuthorizer {

    private final UserRepository userRepository;

    public boolean canIngest(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
        if (isAdmin) {
            return true;
        }
        return userRepository.findByEmail(authentication.getName())
                .map(user -> user.getRoles().stream()
                        .flatMap(role -> role.getPermissions().stream())
                        .anyMatch(p -> "data".equals(p.getResource()) && "ingest".equals(p.getAction())))
                .orElse(false);
    }
}
