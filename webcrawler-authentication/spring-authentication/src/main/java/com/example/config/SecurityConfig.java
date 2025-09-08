package com.example.config;

import com.example.jwt.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> userRepository.findByUsername(username)
                .map(user -> new org.springframework.security.core.userdetails.User(
                        user.getUsername(),
                        user.getPassword(),
                        user.isEnabled(),
                        true,
                        true,
                        true,
                        java.util.Collections.emptyList()))
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
    
    // JWT Authentication Configuration
    @Bean
    @Order(1)
    public SecurityFilterChain jwtFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/jwt/**", "/api/jwt/**")
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/jwt/login", "/jwt/api/login").permitAll()
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
    
    // Basic Authentication Configuration
    @Bean
    @Order(2)
    public SecurityFilterChain basicAuthFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/basic/**")
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .httpBasic(basic -> {})
                .logout(logout -> logout
                        .logoutUrl("/basic/logout")
                        .logoutSuccessHandler((request, response, authentication) -> {
                            response.setStatus(401);
                        })
                )
                .build();
    }
    
    // Form Authentication Configuration
    @Bean
    @Order(3)
    public SecurityFilterChain formAuthFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/form/**")
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/form/login")
                        .defaultSuccessUrl("/form/home", true)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/form/logout")
                        .logoutSuccessUrl("/")
                        .permitAll()
                )
                .build();
    }
    
    // OAuth Configuration
    @Bean
    @Order(4)
    public SecurityFilterChain oauthFilterChain(HttpSecurity http) throws Exception {
        return http
            .securityMatcher("/oauth/**")
            .authorizeHttpRequests(authorize -> authorize
                .anyRequest().authenticated()
            )
            .oauth2ResourceServer(resourceServer -> resourceServer
                .jwt(withDefaults())
            )
            .build();
    }
    
    // Remember Me Authentication Configuration
    @Bean
    @Order(5)
    public SecurityFilterChain rememberMeFilterChain(HttpSecurity http, UserDetailsService userDetailsService) throws Exception {
        return http
                .securityMatcher("/remember/**")
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/remember/login")
                        .defaultSuccessUrl("/remember/home", true)
                        .permitAll()
                )
                .rememberMe(remember -> remember
                        .key("mySecretKey")
                        .tokenValiditySeconds(86400)
                        .userDetailsService(userDetailsService)
                )
                .logout(logout -> logout
                        .logoutUrl("/remember/logout")
                        .logoutSuccessUrl("/")
                        .permitAll()
                )
                .build();
    }
    
    // LDAP Authentication Configuration
    @Bean
    @Order(6)
    public SecurityFilterChain ldapFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/ldap/**")
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .formLogin(form -> form
                        .loginPage("/ldap/login")
                        .defaultSuccessUrl("/ldap/home", true)
                        .permitAll()
                )
                .build();
    }
    
    // SAML Configuration
    // NOTE: This is commented out because it requires a SAML Identity Provider to be configured.
    // Without a configured RelyingPartyRegistrationRepository bean, the application will fail to start.
    // @Bean
    // @Order(7)
    // public SecurityFilterChain samlFilterChain(HttpSecurity http) throws Exception {
    //     return http
    //             .securityMatcher("/saml/**")
    //             .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
    //             .saml2Login(saml2 -> saml2
    //                     .defaultSuccessUrl("/saml/home", true)
    //             )
    //             .build();
    // }
    
    // Shared Resources Configuration
    @Bean
    @Order(8)
    public SecurityFilterChain sharedResourcesFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/shared/**")
                .authorizeHttpRequests(auth -> auth.anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .httpBasic(basic -> {})
                .formLogin(form -> form
                        .loginPage("/form/login")
                        .defaultSuccessUrl("/form/home", true)
                        .permitAll()
                )
                .build();
    }
    
    // Default Configuration
    @Bean
    @Order(9)
    public SecurityFilterChain defaultFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher("/","/css/**", "/js/**", "/images/**", "/error")
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/css/**", "/js/**", "/images/**", "/error").permitAll()
                        .anyRequest().authenticated()
                )
                // Adding a default login page for any other authenticated requests
                .formLogin(form -> form
                        .loginPage("/form/login")
                        .defaultSuccessUrl("/form/home", true)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessUrl("/")
                        .permitAll()
                )
                .build();
    }
}
