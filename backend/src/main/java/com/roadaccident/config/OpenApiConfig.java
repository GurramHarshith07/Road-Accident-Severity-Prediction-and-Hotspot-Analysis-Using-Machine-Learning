package com.roadaccident.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Road Accident Severity Prediction & Hotspot Analysis API")
                        .version("1.0.0")
                        .description("RESTful Backend for Road Accident Analytics, Machine Learning Severity Classification, and Geographical Hotspot Detection.")
                        .contact(new Contact().name("Road Safety AI Project Team")));
    }
}
