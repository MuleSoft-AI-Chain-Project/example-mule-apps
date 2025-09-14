package com.example.controller;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/shared")
public class SharedResourceController {
    
    @GetMapping("/resource1")
    public String resource1(Authentication authentication, Model model) {
        model.addAttribute("username", authentication.getName());
        return "shared/resource1";
    }
    
    @GetMapping("/resource2")
    public String resource2(Authentication authentication, Model model) {
        model.addAttribute("username", authentication.getName());
        return "shared/resource2";
    }
}
