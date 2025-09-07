package com.example.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/oauth")
public class OAuthController {
    
    @GetMapping("/login")
    public String login() {
        return "oauth/login";
    }
    
    @GetMapping("/home")
    public String home(Authentication authentication, Model model) {
        Object principal = authentication.getPrincipal();
        String username = "";
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof OAuth2User) {
            username = ((OAuth2User) principal).getAttribute("sub");
        }
        model.addAttribute("username", username);
        return "oauth/home";
    }
    
    @GetMapping("/about")
    public String about() {
        return "oauth/about";
    }
}
