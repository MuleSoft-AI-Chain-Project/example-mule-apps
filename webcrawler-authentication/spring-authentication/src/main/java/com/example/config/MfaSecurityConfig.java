package com.example.config;

import com.example.security.MfaAuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class MfaSecurityConfig {

    @Bean
    @Order(10)
    public SecurityFilterChain mfaFilterChain(HttpSecurity http, MfaAuthenticationSuccessHandler successHandler, UserDetailsService userDetailsService, PasswordEncoder passwordEncoder) throws Exception {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);

        return http
                .securityMatcher("/mfa/**")
                .authenticationProvider(provider)
                .authorizeHttpRequests(auth -> {
                    auth.requestMatchers("/mfa/login", "/mfa/otp", "/mfa/verify-otp").permitAll();
                    auth.anyRequest().authenticated();
                })
                .formLogin(form -> {
                    form.loginPage("/mfa/login");
                    form.successHandler(successHandler);
                })
                .logout(logout -> {
                    logout.logoutUrl("/mfa/logout");
                    logout.logoutSuccessUrl("/");
                })
                .build();
    }
}
