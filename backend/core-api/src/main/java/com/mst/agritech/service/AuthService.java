package com.mst.agritech.service;

import com.mst.agritech.domain.entity.*;
import com.mst.agritech.dto.request.LoginRequest;
import com.mst.agritech.dto.request.RegisterUserRequest;
import com.mst.agritech.dto.response.AuthResponse;
import com.mst.agritech.exception.ConflictException;
import com.mst.agritech.repository.RoleRepository;
import com.mst.agritech.repository.UserRepository;
import com.mst.agritech.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        List<String> roles = user.getRoles().stream().map(Role::getName).toList();
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId(), roles);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered: " + request.getEmail());
        }

        Role role = roleRepository.findByName("FARMER")
                .orElseGet(() -> roleRepository.save(Role.builder().name("FARMER").build()));

        if (request.getRoleId() != null) {
            role = roleRepository.findById(request.getRoleId()).orElse(role);
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .active(true)
                .roles(new HashSet<>(Set.of(role)))
                .build();

        userRepository.save(user);
        List<String> roles = List.of(role.getName());
        String accessToken = jwtService.generateAccessToken(user.getEmail(), user.getId(), roles);
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .roles(roles)
                .build();
    }
}
