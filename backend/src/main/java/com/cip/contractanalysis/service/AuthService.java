package com.cip.contractanalysis.service;

import com.cip.contractanalysis.dto.AuthDto;
import com.cip.contractanalysis.entity.*;
import com.cip.contractanalysis.exception.BadRequestException;
import com.cip.contractanalysis.exception.ResourceNotFoundException;
import com.cip.contractanalysis.repository.*;
import com.cip.contractanalysis.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered: " + request.getEmail());
        }

        // Create or find organization
        String orgName = request.getOrgName() != null ? request.getOrgName() : "Default Organization";
        Organization org = organizationRepository.findByName(orgName)
                .orElseGet(() -> organizationRepository.save(
                        Organization.builder().name(orgName).build()
                ));

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .role(User.Role.REVIEWER)
                .organization(org)
                .build();

        String accessToken = jwtService.generateAccessToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), user.getPasswordHash(),
                        java.util.List.of(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_REVIEWER"))
                )
        );
        String refreshToken = jwtService.generateRefreshToken(
                new org.springframework.security.core.userdetails.User(
                        user.getEmail(), user.getPasswordHash(),
                        java.util.List.of()
                )
        );
        user.setRefreshToken(refreshToken);
        user = userRepository.save(user);

        log.info("Registered new user: {}", user.getEmail());
        return buildResponse(user, accessToken, refreshToken, org);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        String accessToken = jwtService.generateAccessToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);
        user.setRefreshToken(refreshToken);
        userRepository.save(user);

        log.info("User logged in: {}", user.getEmail());
        return buildResponse(user, accessToken, refreshToken, user.getOrganization());
    }

    @Transactional
    public AuthDto.AuthResponse refresh(AuthDto.RefreshRequest request) {
        User user = userRepository.findByRefreshToken(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String newAccessToken = jwtService.generateAccessToken(userDetails);
        String newRefreshToken = jwtService.generateRefreshToken(userDetails);
        user.setRefreshToken(newRefreshToken);
        userRepository.save(user);

        return buildResponse(user, newAccessToken, newRefreshToken, user.getOrganization());
    }

    @Transactional
    public void logout(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setRefreshToken(null);
            userRepository.save(user);
        });
    }

    private org.springframework.security.core.userdetails.User buildUserDetails(String email, String password) {
        return new org.springframework.security.core.userdetails.User(email, password, java.util.List.of());
    }

    private AuthDto.AuthResponse buildResponse(User user, String access, String refresh, Organization org) {
        return AuthDto.AuthResponse.builder()
                .accessToken(access)
                .refreshToken(refresh)
                .userId(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole().name())
                .orgId(org != null ? org.getId() : null)
                .orgName(org != null ? org.getName() : null)
                .build();
    }
}
