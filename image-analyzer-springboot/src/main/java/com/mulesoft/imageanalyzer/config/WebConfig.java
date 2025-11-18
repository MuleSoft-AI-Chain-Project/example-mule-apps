package com.mulesoft.imageanalyzer.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC Configuration
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    /**
     * Configure CORS to allow requests from any origin
     * (similar to MuleSoft's cors-interceptor with public-resource)
     */
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(false);
    }

    /**
     * Configure static resource handlers
     * Maps /web/** to static resources in classpath:/static/
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/web/**")
                .addResourceLocations("classpath:/static/");
    }
}
