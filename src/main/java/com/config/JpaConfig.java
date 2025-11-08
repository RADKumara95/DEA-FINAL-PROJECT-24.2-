package com.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;

@Configuration
@EnableJpaAuditing
public class JpaConfig {

    @Bean
    public AuditorAware<String> auditorProvider() {
        return new AuditorAwareImpl();
    }

    /**
     * Implementation of AuditorAware to return the current username
     * Returns "system" as default. Can be extended to integrate with 
     * Spring Security or other authentication mechanisms.
     */
    public static class AuditorAwareImpl implements AuditorAware<String> {

        @Override
        public Optional<String> getCurrentAuditor() {
            // TODO: Integrate with your authentication mechanism
            // For Spring Security, you can use:
            // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            // if (authentication != null) return Optional.of(authentication.getName());
            
            return Optional.of("system");
        }
    }
}

