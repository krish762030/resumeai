package com.resumeai.job;

import com.resumeai.common.util.TextListMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class JobDataInitializer implements CommandLineRunner {

    private final JobRepository jobRepository;

    @Override
    public void run(String... args) {
        if (jobRepository.count() > 0) {
            return;
        }

        jobRepository.saveAll(List.of(
                Job.builder()
                        .title("Java Backend Developer")
                        .company("Nova Tech")
                        .location("Bengaluru")
                        .experienceLevel("Fresher")
                        .requiredSkills(TextListMapper.toStorage(List.of("Java", "Spring Boot", "REST API", "MySQL")))
                        .jobUrl("https://example.com/jobs/java-backend-developer")
                        .build(),
                Job.builder()
                        .title("Full Stack Developer")
                        .company("ScaleForge")
                        .location("Pune")
                        .experienceLevel("0-2 Years")
                        .requiredSkills(TextListMapper.toStorage(List.of("Java", "Spring Boot", "Angular", "MySQL")))
                        .jobUrl("https://example.com/jobs/full-stack-developer")
                        .build(),
                Job.builder()
                        .title("Software Engineer Intern")
                        .company("CloudAxis")
                        .location("Remote")
                        .experienceLevel("Internship")
                        .requiredSkills(TextListMapper.toStorage(List.of("Java", "Git", "Docker", "JavaScript")))
                        .jobUrl("https://example.com/jobs/software-engineer-intern")
                        .build()
        ));
    }
}
