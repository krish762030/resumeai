package com.resumeai;

import com.resumeai.config.AppProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(AppProperties.class)
public class ResumeaiApplication {

    public static void main(String[] args) {
        SpringApplication.run(ResumeaiApplication.class, args);
    }
}
