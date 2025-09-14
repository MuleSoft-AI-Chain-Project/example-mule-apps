package com.example.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/ldap")
public class LdapController {
    
    @GetMapping("/login")
    public String login() {
        return "ldap/login";
    }
    
    @GetMapping("/home")
    public String home(Authentication authentication, Model model) {
        model.addAttribute("username", authentication.getName());
        return "ldap/home";
    }
    
    @GetMapping("/about")
    public String about() {
        return "ldap/about";
    }
}
