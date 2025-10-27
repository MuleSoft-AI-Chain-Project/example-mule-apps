package com.example.security;

import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.OtpService;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class MfaAuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final OtpService otpService;
    private final UserRepository userRepository;

    public MfaAuthenticationSuccessHandler(OtpService otpService, UserRepository userRepository) {
        this.otpService = otpService;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        String username = authentication.getName();
        User user = userRepository.findByUsername(username).get();
        String otp = otpService.generateOtp(username);
        otpService.sendOtp(user.getEmail(), otp);
        response.sendRedirect("/mfa/otp?username=" + username);
    }
}
