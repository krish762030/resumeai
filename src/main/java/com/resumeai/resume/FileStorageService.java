package com.resumeai.resume;

import com.resumeai.config.AppProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Optional;
import java.util.UUID;

@Service
public class FileStorageService {

    private final Path uploadDir;

    public FileStorageService(AppProperties properties) throws IOException {
        String configuredUploadDir = Optional.ofNullable(properties.getStorage().getUploadDir())
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .orElse("uploads");
        this.uploadDir = Path.of(configuredUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadDir);
    }

    public Path storeResume(MultipartFile file) {
        String originalName = file.getOriginalFilename() == null ? "resume.pdf" : file.getOriginalFilename();
        String storedName = UUID.randomUUID() + "-" + originalName.replaceAll("\\s+", "_");
        Path destination = uploadDir.resolve(storedName);
        try {
            Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);
            return destination;
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to store uploaded file", exception);
        }
    }
}
