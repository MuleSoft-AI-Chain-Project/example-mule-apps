package com.example.controller;

import com.example.model.User;
import com.example.repository.UserRepository;
import com.example.service.OtpService;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class MfaController {

    private final OtpService otpService;
    private final UserRepository userRepository;

    public MfaController(OtpService otpService, UserRepository userRepository) {
        this.otpService = otpService;
        this.userRepository = userRepository;
    }

    @GetMapping("/mfa/login")
    public String mfaLogin() {
        return "mfa/login";
    }

    @GetMapping("/mfa/otp")
    public String mfaOtp(@RequestParam String username, org.springframework.ui.Model model) {
        model.addAttribute("username", username);
        return "mfa/otp";
    }

    @PostMapping("/mfa/verify-otp")
    public String verifyOtp(@RequestParam String username, @RequestParam String otp) {
        if (otpService.validateOtp(username, otp)) {
            User user = userRepository.findByUsername(username).get();
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(user, null, java.util.Collections.emptyList());
            SecurityContextHolder.getContext().setAuthentication(auth);
            return "redirect:/mfa/home";
        }
        return "redirect:/mfa/otp?error&username=" + username;
    }

    @GetMapping("/mfa/home")
    public String mfaHome() {
        return "mfa/home";
    }
}
