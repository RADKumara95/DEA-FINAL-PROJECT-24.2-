package com.cart.ecom_proj.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.session.jdbc.config.annotation.web.http.EnableJdbcHttpSession;
import org.springframework.session.web.http.CookieSerializer;
import org.springframework.session.web.http.DefaultCookieSerializer;

/**
 * Configuration for Spring Session JDBC.
 * Stores HTTP sessions in MySQL database for persistence across restarts.
 */
@Configuration
@EnableJdbcHttpSession(maxInactiveIntervalInSeconds = 1800) // 30 minutes
public class HttpSessionConfig {

    /**
     * Configure the session cookie settings.
     * This ensures the SESSION cookie is properly set for cross-origin requests.
     */
    @Bean
    public CookieSerializer cookieSerializer() {
        DefaultCookieSerializer serializer = new DefaultCookieSerializer();
        serializer.setCookieName("SESSION");
        serializer.setCookiePath("/");
        serializer.setDomainNamePattern("^.+?\\.(\\w+\\.[a-z]+)$");
        serializer.setUseHttpOnlyCookie(true);
        serializer.setUseSecureCookie(false); // Set to true in production with HTTPS
        serializer.setSameSite("Lax");
        return serializer;
    }
}
