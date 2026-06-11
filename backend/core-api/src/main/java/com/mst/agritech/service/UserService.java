package com.mst.agritech.service;

import com.mst.agritech.domain.entity.User;
import com.mst.agritech.dto.response.UserResponse;
import com.mst.agritech.exception.ResourceNotFoundException;
import com.mst.agritech.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public Page<UserResponse> findAll(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::toResponse);
    }

    public UserResponse findById(Long id) {
        return toResponse(userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id)));
    }

    @Transactional
    public void deactivate(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setActive(false);
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        List<String> roles = user.getRoles().stream().map(r -> r.getName()).toList();
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .active(user.isActive())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .build();
    }
}
