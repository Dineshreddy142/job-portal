package com.jobportal.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({
    JwtProperties.class,
    FileProperties.class,
    AppResetProperties.class
})
public class PropertyConfig {
}
